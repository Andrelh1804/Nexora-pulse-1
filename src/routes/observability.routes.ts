/**
 * OBSERVABILITY ROUTES — Fase 2.10
 * Internal health checks, metrics, audit log viewer, AI usage stats.
 * Protected: requires 'admin' role minimum.
 */
import { Router, Request, Response } from "express";
import { query, queryOne, checkConnection } from "../lib/db";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.middleware";
import { getUsageStats } from "../services/ai-memory.service";
import auditLogger from "../lib/auditLogger";

const router = Router();

// ── PUBLIC HEALTH (no auth required) ────────
router.get("/health", async (_req: Request, res: Response) => {
  const [dbOk, mem] = await Promise.all([
    checkConnection(),
    Promise.resolve(process.memoryUsage()),
  ]);

  const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);
  const rssMb = Math.round(mem.rss / 1024 / 1024);

  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: "2.0",
    checks: {
      database: { status: dbOk ? "pass" : "fail", latency: null },
      memory: {
        status: heapUsedMb < 400 ? "pass" : "warn",
        heapUsedMb,
        heapTotalMb,
        rssMb,
      },
      api: { status: "pass" },
    },
  });
});

// ── PROTECTED ROUTES (admin only) ────────────
router.use(authenticate, requireRole("admin"));

// GET /api/v1/ops/metrics
router.get("/metrics", async (req: AuthRequest, res: Response) => {
  try {
    const [tenantStats, aiStats, recentAudit] = await Promise.all([
      queryOne<{
        total_users: string; active_users: string;
        total_leads: string; total_campaigns: string;
        active_campaigns: string; total_posts: string; total_messages: string;
      }>(
        `SELECT
           (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS total_users,
           (SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND is_active = TRUE) AS active_users,
           (SELECT COUNT(*) FROM leads WHERE tenant_id = $1) AS total_leads,
           (SELECT COUNT(*) FROM campaigns WHERE tenant_id = $1) AS total_campaigns,
           (SELECT COUNT(*) FROM campaigns WHERE tenant_id = $1 AND status = 'active') AS active_campaigns,
           (SELECT COUNT(*) FROM social_posts WHERE tenant_id = $1) AS total_posts,
           (SELECT COUNT(*) FROM whatsapp_messages WHERE tenant_id = $1) AS total_messages`,
        [req.user!.tenantId]
      ),
      getUsageStats(req.user!.tenantId),
      query(
        `SELECT action, severity, status, user_email, resource, created_at
         FROM audit_logs WHERE tenant_id = $1
         ORDER BY created_at DESC LIMIT 10`,
        [req.user!.tenantId]
      ),
    ]);

    const mem = process.memoryUsage();

    return res.json({
      tenant: {
        id: req.user!.tenantId,
        plan: req.user!.plan,
        users: {
          total: parseInt(tenantStats?.total_users ?? "0"),
          active: parseInt(tenantStats?.active_users ?? "0"),
        },
        content: {
          leads: parseInt(tenantStats?.total_leads ?? "0"),
          campaigns: parseInt(tenantStats?.total_campaigns ?? "0"),
          activeCampaigns: parseInt(tenantStats?.active_campaigns ?? "0"),
          posts: parseInt(tenantStats?.total_posts ?? "0"),
          messages: parseInt(tenantStats?.total_messages ?? "0"),
        },
      },
      ai: aiStats,
      system: {
        uptime: Math.floor(process.uptime()),
        memoryMb: {
          heap: Math.round(mem.heapUsed / 1024 / 1024),
          rss: Math.round(mem.rss / 1024 / 1024),
        },
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      },
      recentActivity: recentAudit.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar métricas.", details: err instanceof Error ? err.message : undefined });
  }
});

// GET /api/v1/ops/audit-logs
router.get("/audit-logs", async (req: AuthRequest, res: Response) => {
  const { limit = "50", severity, action } = req.query;
  const conditions: string[] = ["tenant_id = $1"];
  const params: unknown[] = [req.user!.tenantId];
  let idx = 2;

  if (severity) { conditions.push(`severity = $${idx++}`); params.push(severity); }
  if (action)   { conditions.push(`action ILIKE $${idx++}`); params.push(`%${action}%`); }

  const logs = await query(
    `SELECT id, action, resource, resource_id, severity, status, user_email, ip_address, details, created_at
     FROM audit_logs WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC LIMIT $${idx}`,
    [...params, Math.min(parseInt(String(limit)), 200)]
  );

  // Also pull in-memory logs from the auditLogger singleton
  const inMemoryLogs = auditLogger.getRecentLogs(20).filter(
    (l) => l.tenantId === req.user!.tenantId
  );

  return res.json({
    dbLogs: logs.rows,
    inMemoryLogs,
    total: logs.rowCount + inMemoryLogs.length,
  });
});

// GET /api/v1/ops/db-stats
router.get("/db-stats", requireRole("super_admin"), async (_req: Request, res: Response) => {
  const tables = await query(
    `SELECT
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) AS size,
       n_live_tup AS row_count
     FROM pg_stat_user_tables
     WHERE schemaname = 'public'
     ORDER BY n_live_tup DESC`
  );

  const dbSize = await queryOne<{ size: string }>(
    "SELECT pg_size_pretty(pg_database_size(current_database())) AS size"
  );

  return res.json({
    tables: tables.rows,
    totalSize: dbSize?.size ?? "unknown",
    timestamp: new Date().toISOString(),
  });
});

export default router;
