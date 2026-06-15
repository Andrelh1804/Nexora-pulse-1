import { Router, Response } from "express";
import { query, queryOne } from "../lib/db";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.middleware";
import { createLeadSchema, updateLeadSchema, paginationSchema, formatZodError } from "../lib/validation";
import { ZodError } from "zod";
import auditLogger from "../lib/auditLogger";

const router = Router();
router.use(authenticate);

// GET /api/v1/leads
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const { status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = status ? "AND status = $4" : "";
    const params = status
      ? [req.user!.tenantId, limit, offset, status]
      : [req.user!.tenantId, limit, offset];

    const [leads, countResult] = await Promise.all([
      query(
        `SELECT l.*, u.name AS assigned_to_name
         FROM leads l
         LEFT JOIN users u ON u.id = l.assigned_to
         WHERE l.tenant_id = $1 ${whereClause}
         ORDER BY l.created_at DESC LIMIT $2 OFFSET $3`,
        params
      ),
      queryOne<{ count: string }>(
        `SELECT COUNT(*) AS count FROM leads WHERE tenant_id = $1 ${whereClause ? "AND status = $2" : ""}`,
        status ? [req.user!.tenantId, status] : [req.user!.tenantId]
      ),
    ]);

    return res.json({
      data: leads.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult?.count ?? "0"),
        totalPages: Math.ceil(parseInt(countResult?.count ?? "0") / limit),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao buscar leads." });
  }
});

// GET /api/v1/leads/pipeline — Kanban grouped
router.get("/pipeline", async (req: AuthRequest, res: Response) => {
  const stages = ["novo", "contato", "proposta", "fechado", "perdido"];
  const result = await query(
    "SELECT * FROM leads WHERE tenant_id = $1 ORDER BY updated_at DESC",
    [req.user!.tenantId]
  );
  const pipeline = stages.reduce((acc, stage) => {
    acc[stage] = result.rows.filter((l: Record<string, unknown>) => l.status === stage);
    return acc;
  }, {} as Record<string, unknown[]>);

  const totalValue = result.rows
    .filter((l: Record<string, unknown>) => l.status !== "perdido")
    .reduce((s: number, l: Record<string, unknown>) => s + parseFloat(String(l.value ?? 0)), 0);

  return res.json({ pipeline, totalLeads: result.rowCount, totalValue });
});

// GET /api/v1/leads/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const lead = await queryOne(
    "SELECT * FROM leads WHERE id = $1 AND tenant_id = $2",
    [req.params.id, req.user!.tenantId]
  );
  if (!lead) return res.status(404).json({ error: "Lead não encontrado." });
  return res.json({ data: lead });
});

// POST /api/v1/leads
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const body = createLeadSchema.parse(req.body);
    const lead = await queryOne(
      `INSERT INTO leads (tenant_id, name, email, phone, status, value, source, notes, tags, campaign_id, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [req.user!.tenantId, body.name, body.email ?? null, body.phone ?? null, body.status,
       body.value, body.source ?? null, body.notes ?? null, body.tags, body.campaign_id ?? null, req.user!.sub]
    );

    auditLogger.log({
      action: "lead.created",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "lead",
      resourceId: (lead as Record<string, string>)?.id,
      details: { name: body.name, value: body.value, source: body.source },
      status: "success",
    });

    return res.status(201).json({ data: lead });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao criar lead." });
  }
});

// PATCH /api/v1/leads/:id
router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const body = updateLeadSchema.parse(req.body);
    const fields = Object.keys(body);
    if (fields.length === 0) return res.status(400).json({ error: "Nenhum campo para atualizar." });

    const setClauses = fields.map((f, i) => `${f} = $${i + 3}`).join(", ");
    const values = fields.map((f) => (body as Record<string, unknown>)[f]);

    const addConverted = body.status === "fechado" ? ", converted_at = NOW()" : "";
    const lead = await queryOne(
      `UPDATE leads SET ${setClauses}${addConverted}, updated_at = NOW(), last_interaction = NOW()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [req.params.id, req.user!.tenantId, ...values]
    );

    if (!lead) return res.status(404).json({ error: "Lead não encontrado." });

    auditLogger.log({
      action: "lead.updated",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "lead",
      resourceId: req.params.id,
      details: { updatedFields: fields, newStatus: body.status },
      status: "success",
    });

    return res.json({ data: lead });
  } catch (err) {
    if (err instanceof ZodError) return res.status(422).json({ fields: formatZodError(err) });
    return res.status(500).json({ error: "Erro ao atualizar lead." });
  }
});

// DELETE /api/v1/leads/:id
router.delete("/:id", requireRole("gestor"), async (req: AuthRequest, res: Response) => {
  const result = await query(
    "DELETE FROM leads WHERE id = $1 AND tenant_id = $2",
    [req.params.id, req.user!.tenantId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: "Lead não encontrado." });
  return res.json({ message: "Lead removido." });
});

export default router;
