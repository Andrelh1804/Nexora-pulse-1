import { Router, Response } from "express";
import { query, queryOne } from "../lib/db";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.middleware";
import { updateTenantSchema, createUserSchema, paginationSchema, formatZodError } from "../lib/validation";
import { hashPassword } from "../lib/auth";
import { ZodError } from "zod";
import auditLogger from "../lib/auditLogger";

const router = Router();
router.use(authenticate);

// GET /api/v1/tenant — current tenant info
router.get("/", async (req: AuthRequest, res: Response) => {
  const tenant = await queryOne(
    "SELECT id, slug, name, niche, plan, status, logo_url, custom_domain, primary_color, timezone, language, trial_ends_at, created_at FROM tenants WHERE id = $1",
    [req.user!.tenantId]
  );
  if (!tenant) return res.status(404).json({ error: "Tenant não encontrado." });
  return res.json({ data: tenant });
});

// PATCH /api/v1/tenant — update tenant settings
router.patch("/", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const body = updateTenantSchema.parse(req.body);
    const fields = Object.keys(body);
    if (fields.length === 0) return res.status(400).json({ error: "Nenhum campo para atualizar." });

    const setClauses = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
    const values = fields.map((f) => (body as Record<string, unknown>)[f]);

    const tenant = await queryOne(
      `UPDATE tenants SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.user!.tenantId, ...values]
    );

    auditLogger.log({
      action: "tenant.updated",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "tenant",
      details: { updatedFields: fields },
      status: "success",
    });

    return res.json({ data: tenant });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao atualizar configurações." });
  }
});

// GET /api/v1/tenant/users — list tenant users
router.get("/users", requireRole("gestor"), async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const [users, countResult] = await Promise.all([
      query(
        `SELECT id, name, email, role, avatar_url, phone, is_active, is_verified, last_login_at, created_at
         FROM users WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.user!.tenantId, limit, offset]
      ),
      queryOne<{ count: string }>(
        "SELECT COUNT(*) AS count FROM users WHERE tenant_id = $1",
        [req.user!.tenantId]
      ),
    ]);

    return res.json({
      data: users.rows,
      pagination: { page, limit, total: parseInt(countResult?.count ?? "0") },
    });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

// POST /api/v1/tenant/users — invite user
router.post("/users", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const body = createUserSchema.parse(req.body);

    const existing = await queryOne(
      "SELECT id FROM users WHERE email = $1",
      [body.email]
    );
    if (existing) return res.status(409).json({ error: "E-mail já cadastrado.", code: "EMAIL_EXISTS" });

    const passwordHash = await hashPassword(body.password);
    const user = await queryOne(
      `INSERT INTO users (tenant_id, email, password_hash, name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
      [req.user!.tenantId, body.email, passwordHash, body.name, body.role, body.phone ?? null]
    );

    auditLogger.log({
      action: "user.created",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "user",
      resourceId: (user as Record<string, string>)?.id,
      details: { email: body.email, role: body.role },
      status: "success",
    });

    return res.status(201).json({ data: user, message: "Usuário criado com sucesso." });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

// GET /api/v1/tenant/stats — dashboard stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  const [leads, campaigns, posts, messages] = await Promise.all([
    queryOne<{ total: string; closed: string; pipeline_value: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'fechado') AS closed,
              SUM(value) FILTER (WHERE status NOT IN ('perdido','fechado')) AS pipeline_value
       FROM leads WHERE tenant_id = $1`,
      [req.user!.tenantId]
    ),
    queryOne<{ total: string; active: string; total_spend: string; total_leads: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'active') AS active,
              COALESCE(SUM(spend), 0) AS total_spend,
              COALESCE(SUM(leads), 0) AS total_leads
       FROM campaigns WHERE tenant_id = $1`,
      [req.user!.tenantId]
    ),
    queryOne<{ total: string; published: string; scheduled: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'published') AS published,
              COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled
       FROM social_posts WHERE tenant_id = $1`,
      [req.user!.tenantId]
    ),
    queryOne<{ total: string; unread: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE direction = 'inbound' AND status = 'delivered') AS unread
       FROM whatsapp_messages WHERE tenant_id = $1`,
      [req.user!.tenantId]
    ),
  ]);

  return res.json({
    leads: { total: parseInt(leads?.total ?? "0"), closed: parseInt(leads?.closed ?? "0"), pipelineValue: parseFloat(leads?.pipeline_value ?? "0") },
    campaigns: { total: parseInt(campaigns?.total ?? "0"), active: parseInt(campaigns?.active ?? "0"), totalSpend: parseFloat(campaigns?.total_spend ?? "0"), totalLeads: parseInt(campaigns?.total_leads ?? "0") },
    posts: { total: parseInt(posts?.total ?? "0"), published: parseInt(posts?.published ?? "0"), scheduled: parseInt(posts?.scheduled ?? "0") },
    messages: { total: parseInt(messages?.total ?? "0"), unread: parseInt(messages?.unread ?? "0") },
    timestamp: new Date().toISOString(),
  });
});

export default router;
