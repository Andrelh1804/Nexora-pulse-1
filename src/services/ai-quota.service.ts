/**
 * AI QUOTA SERVICE — Prioridade 1
 * Enforcement de limites de uso de IA por tenant/plano.
 * Controla chamadas mensais, valida plano e retorna status de cota.
 */

import { query, queryOne } from "../lib/db";
import { PLAN_LIMITS, PlanTier } from "../lib/usageEngine";
import logger from "../lib/logger";

export interface QuotaStatus {
  tenantId: string;
  plan: PlanTier;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
  resetDate: string;
}

export interface QuotaCheckResult {
  allowed: boolean;
  quota: QuotaStatus;
  error?: string;
}

export async function getMonthlyAiUsage(tenantId: string): Promise<number> {
  try {
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM ai_interactions
       WHERE tenant_id = $1
         AND is_simulated = FALSE
         AND created_at >= date_trunc('month', NOW())`,
      [tenantId]
    );
    return parseInt(result?.count ?? "0");
  } catch (err) {
    logger.warn(`[AI Quota] Failed to get monthly usage: ${err instanceof Error ? err.message : err}`, {
      module: "AIQuota",
      data: { tenantId },
    });
    return 0;
  }
}

export async function checkQuota(tenantId: string, plan: PlanTier): Promise<QuotaCheckResult> {
  const limitValue = PLAN_LIMITS[plan].aiCallsPerMonth;
  const isUnlimited = limitValue === Infinity;

  if (isUnlimited) {
    return {
      allowed: true,
      quota: {
        tenantId,
        plan,
        used: 0,
        limit: -1,
        remaining: -1,
        percentUsed: 0,
        isExceeded: false,
        resetDate: getNextMonthReset(),
      },
    };
  }

  const used = await getMonthlyAiUsage(tenantId);
  const limit = limitValue as number;
  const remaining = Math.max(0, limit - used);
  const percentUsed = Math.min(100, Math.round((used / limit) * 100));
  const isExceeded = used >= limit;

  const quota: QuotaStatus = {
    tenantId,
    plan,
    used,
    limit,
    remaining,
    percentUsed,
    isExceeded,
    resetDate: getNextMonthReset(),
  };

  if (isExceeded) {
    logger.warn(`[AI Quota] Limit exceeded for tenant ${tenantId} on plan ${plan}: ${used}/${limit}`, {
      module: "AIQuota",
    });
    return {
      allowed: false,
      quota,
      error: `Limite mensal de ${limit} chamadas de IA atingido no plano ${plan}. Reinicia em ${quota.resetDate}.`,
    };
  }

  return { allowed: true, quota };
}

export async function getFullQuotaStatus(tenantId: string, plan: PlanTier): Promise<QuotaStatus> {
  const limitValue = PLAN_LIMITS[plan].aiCallsPerMonth;
  const isUnlimited = limitValue === Infinity;

  if (isUnlimited) {
    const used = await getMonthlyAiUsage(tenantId);
    return {
      tenantId,
      plan,
      used,
      limit: -1,
      remaining: -1,
      percentUsed: 0,
      isExceeded: false,
      resetDate: getNextMonthReset(),
    };
  }

  const used = await getMonthlyAiUsage(tenantId);
  const limit = limitValue as number;
  return {
    tenantId,
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percentUsed: Math.min(100, Math.round((used / limit) * 100)),
    isExceeded: used >= limit,
    resetDate: getNextMonthReset(),
  };
}

export async function getAiHistory(
  tenantId: string,
  page = 1,
  pageSize = 20,
  agentType?: string
): Promise<{
  interactions: {
    id: string;
    agentType: string;
    prompt: string;
    response: string | null;
    model: string;
    isSimulated: boolean;
    processingMs: number;
    status: string;
    createdAt: string;
  }[];
  total: number;
  page: number;
  pages: number;
}> {
  try {
    const offset = (page - 1) * pageSize;
    const agentFilter = agentType ? "AND agent_type = $4" : "";
    const params: unknown[] = [tenantId, pageSize, offset];
    if (agentType) params.push(agentType);

    const [rows, countResult] = await Promise.all([
      query<{
        id: string;
        agent_type: string;
        prompt: string;
        response: string | null;
        model: string;
        is_simulated: boolean;
        processing_ms: number;
        status: string;
        created_at: string;
      }>(
        `SELECT id, agent_type, prompt, response, model, is_simulated, processing_ms, status, created_at
         FROM ai_interactions
         WHERE tenant_id = $1 ${agentFilter}
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        params
      ),
      queryOne<{ count: string }>(
        `SELECT COUNT(*) AS count FROM ai_interactions WHERE tenant_id = $1 ${agentFilter}`,
        agentType ? [tenantId, agentType] : [tenantId]
      ),
    ]);

    const total = parseInt(countResult?.count ?? "0");
    return {
      interactions: rows.rows.map((r) => ({
        id: r.id,
        agentType: r.agent_type,
        prompt: r.prompt,
        response: r.response,
        model: r.model,
        isSimulated: r.is_simulated,
        processingMs: r.processing_ms,
        status: r.status,
        createdAt: r.created_at,
      })),
      total,
      page,
      pages: Math.ceil(total / pageSize),
    };
  } catch (err) {
    logger.error(`[AI Quota] Failed to get history: ${err instanceof Error ? err.message : err}`, {
      module: "AIQuota",
    });
    return { interactions: [], total: 0, page: 1, pages: 0 };
  }
}

function getNextMonthReset(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default { checkQuota, getFullQuotaStatus, getAiHistory, getMonthlyAiUsage };
