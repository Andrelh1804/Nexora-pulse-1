import { Router, Response } from "express";
import { query, queryOne } from "../lib/db";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.middleware";
import { createCampaignSchema, updateCampaignSchema, paginationSchema, formatZodError } from "../lib/validation";
import { ZodError } from "zod";
import auditLogger from "../lib/auditLogger";

const router = Router();
router.use(authenticate);

// GET /api/v1/campaigns
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const [campaigns, countResult] = await Promise.all([
      query(
        `SELECT * FROM campaigns WHERE tenant_id = $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.user!.tenantId, limit, offset]
      ),
      queryOne<{ count: string }>(
        "SELECT COUNT(*) AS count FROM campaigns WHERE tenant_id = $1",
        [req.user!.tenantId]
      ),
    ]);

    return res.json({
      data: campaigns.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult?.count ?? "0"),
        totalPages: Math.ceil(parseInt(countResult?.count ?? "0") / limit),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao buscar campanhas." });
  }
});

// GET /api/v1/campaigns/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const campaign = await queryOne(
    "SELECT * FROM campaigns WHERE id = $1 AND tenant_id = $2",
    [req.params.id, req.user!.tenantId]
  );
  if (!campaign) return res.status(404).json({ error: "Campanha não encontrada." });
  return res.json({ data: campaign });
});

// POST /api/v1/campaigns
router.post("/", requireRole("gestor"), async (req: AuthRequest, res: Response) => {
  try {
    const body = createCampaignSchema.parse(req.body);
    const campaign = await queryOne(
      `INSERT INTO campaigns (tenant_id, name, platform, budget, starts_at, ends_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user!.tenantId, body.name, body.platform, body.budget ?? 0, body.starts_at ?? null, body.ends_at ?? null, req.user!.sub]
    );

    auditLogger.log({
      action: "campaign.created",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "campaign",
      resourceId: (campaign as Record<string, string>)?.id,
      details: { name: body.name, platform: body.platform },
      status: "success",
    });

    return res.status(201).json({ data: campaign });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao criar campanha." });
  }
});

// PATCH /api/v1/campaigns/:id
router.patch("/:id", requireRole("gestor"), async (req: AuthRequest, res: Response) => {
  try {
    const body = updateCampaignSchema.parse(req.body);
    const fields = Object.keys(body);
    if (fields.length === 0) return res.status(400).json({ error: "Nenhum campo para atualizar." });

    const setClauses = fields.map((f, i) => `${f} = $${i + 3}`).join(", ");
    const values = fields.map((f) => (body as Record<string, unknown>)[f]);

    const campaign = await queryOne(
      `UPDATE campaigns SET ${setClauses}, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [req.params.id, req.user!.tenantId, ...values]
    );

    if (!campaign) return res.status(404).json({ error: "Campanha não encontrada." });

    auditLogger.log({
      action: "campaign.updated",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "campaign",
      resourceId: req.params.id,
      details: { updatedFields: fields },
      status: "success",
    });

    return res.json({ data: campaign });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao atualizar campanha." });
  }
});

// DELETE /api/v1/campaigns/:id
router.delete("/:id", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const result = await query(
    "DELETE FROM campaigns WHERE id = $1 AND tenant_id = $2",
    [req.params.id, req.user!.tenantId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: "Campanha não encontrada." });

  auditLogger.log({
    action: "campaign.deleted" as never,
    tenantId: req.user!.tenantId,
    userId: req.user!.sub,
    resource: "campaign",
    resourceId: req.params.id,
    status: "success",
  });

  return res.json({ message: "Campanha removida." });
});

export default router;
