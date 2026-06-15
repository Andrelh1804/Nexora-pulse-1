import { Router, Response } from "express";
import { query, queryOne } from "../lib/db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { paginationSchema, createPostSchema, formatZodError } from "../lib/validation";
import { ZodError } from "zod";

const router = Router();
router.use(authenticate);

// GET /api/v1/social/posts
router.get("/posts", async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const [posts, countResult] = await Promise.all([
      query(
        `SELECT * FROM social_posts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.user!.tenantId, limit, offset]
      ),
      queryOne<{ count: string }>(
        "SELECT COUNT(*) AS count FROM social_posts WHERE tenant_id = $1",
        [req.user!.tenantId]
      ),
    ]);

    return res.json({
      data: posts.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult?.count ?? "0"),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao buscar posts." });
  }
});

// POST /api/v1/social/posts
router.post("/posts", async (req: AuthRequest, res: Response) => {
  try {
    const body = createPostSchema.parse(req.body);

    const post = await queryOne(
      `INSERT INTO social_posts (tenant_id, platform, caption, media_url, hashtags, scheduled_at, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user!.tenantId,
        body.platform,
        body.caption ?? null,
        body.media_url ?? null,
        JSON.stringify(body.hashtags),
        body.scheduled_at ?? null,
        body.scheduled_at ? "scheduled" : "draft",
        req.user!.sub,
      ]
    );

    return res.status(201).json({ data: post });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao criar post." });
  }
});

// GET /api/v1/social/calendar
router.get("/calendar", async (req: AuthRequest, res: Response) => {
  const posts = await query(
    `SELECT id, platform, caption, scheduled_at, status FROM social_posts
     WHERE tenant_id = $1 AND scheduled_at IS NOT NULL
     ORDER BY scheduled_at ASC LIMIT 50`,
    [req.user!.tenantId]
  );
  return res.json({ data: posts.rows });
});

export default router;
