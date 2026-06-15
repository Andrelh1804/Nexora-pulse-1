import { Router, Response } from "express";
import { queryOne } from "../lib/db";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { getUsageStats } from "../services/ai-memory.service";

const router = Router();
router.use(authenticate);

// GET /api/v1/billing/status
router.get("/status", async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const [tenant, leadsCount, campaignsCount, usersCount, postsCount, aiStats] = await Promise.all([
      queryOne<{
        plan: string;
        status: string;
        trial_ends_at: string | null;
        next_billing_at: string | null;
      }>(
        "SELECT plan, status, trial_ends_at, NULL AS next_billing_at FROM tenants WHERE id = $1",
        [tenantId]
      ),
      queryOne<{ count: string }>("SELECT COUNT(*) AS count FROM leads WHERE tenant_id = $1", [tenantId]),
      queryOne<{ count: string }>("SELECT COUNT(*) AS count FROM campaigns WHERE tenant_id = $1", [tenantId]),
      queryOne<{ count: string }>("SELECT COUNT(*) AS count FROM users WHERE tenant_id = $1", [tenantId]),
      queryOne<{ count: string }>(
        "SELECT COUNT(*) AS count FROM social_posts WHERE tenant_id = $1 AND created_at >= date_trunc('month', NOW())",
        [tenantId]
      ),
      getUsageStats(tenantId),
    ]);

    return res.json({
      plan: (tenant?.plan ?? "basic") as "basic" | "premium" | "enterprise",
      status: tenant?.status ?? "active",
      trialEndsAt: tenant?.trial_ends_at ?? null,
      nextBillingAt: tenant?.next_billing_at ?? null,
      usage: {
        aiCalls: aiStats.last30Days ?? 0,
        leads: parseInt(leadsCount?.count ?? "0"),
        campaigns: parseInt(campaignsCount?.count ?? "0"),
        users: parseInt(usersCount?.count ?? "0"),
        socialPosts: parseInt(postsCount?.count ?? "0"),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar status de cobrança." });
  }
});

export default router;
