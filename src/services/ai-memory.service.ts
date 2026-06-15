/**
 * AI MEMORY SERVICE — Fase 2.8
 * Persists AI interactions to PostgreSQL and provides contextual memory per tenant/agent.
 * Works server-side only (imported in routes, not in frontend).
 */

import { query, queryOne } from "../lib/db";
import logger from "../lib/logger";

export interface AIInteractionRecord {
  tenantId: string;
  userId?: string;
  agentType: string;
  prompt: string;
  response?: string;
  model?: string;
  tokensUsed?: number;
  processingMs?: number;
  isSimulated?: boolean;
  status?: "success" | "failed" | "timeout";
  metadata?: Record<string, unknown>;
}

export interface AIMemoryContext {
  agentType: string;
  tenantId: string;
  recentInteractions: {
    prompt: string;
    response: string | null;
    createdAt: string;
  }[];
  interactionCount: number;
}

export async function saveInteraction(data: AIInteractionRecord): Promise<string | null> {
  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO ai_interactions
         (tenant_id, user_id, agent_type, prompt, response, model, tokens_used, processing_ms, is_simulated, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        data.tenantId,
        data.userId ?? null,
        data.agentType,
        data.prompt,
        data.response ?? null,
        data.model ?? "gemini-2.5-flash",
        data.tokensUsed ?? 0,
        data.processingMs ?? 0,
        data.isSimulated ?? false,
        data.status ?? "success",
        JSON.stringify(data.metadata ?? {}),
      ]
    );
    return result?.id ?? null;
  } catch (err) {
    logger.warn(`[AI Memory] Failed to save interaction: ${err instanceof Error ? err.message : err}`, {
      module: "AI",
      tenantId: data.tenantId,
    });
    return null;
  }
}

export async function getMemoryContext(
  tenantId: string,
  agentType: string,
  limit = 5
): Promise<AIMemoryContext> {
  try {
    const [interactions, countResult] = await Promise.all([
      query<{ prompt: string; response: string | null; created_at: string }>(
        `SELECT prompt, response, created_at
         FROM ai_interactions
         WHERE tenant_id = $1 AND agent_type = $2 AND status = 'success'
         ORDER BY created_at DESC LIMIT $3`,
        [tenantId, agentType, limit]
      ),
      queryOne<{ count: string }>(
        "SELECT COUNT(*) AS count FROM ai_interactions WHERE tenant_id = $1 AND agent_type = $2",
        [tenantId, agentType]
      ),
    ]);

    return {
      agentType,
      tenantId,
      recentInteractions: interactions.rows.map((r) => ({
        prompt: r.prompt,
        response: r.response,
        createdAt: r.created_at,
      })),
      interactionCount: parseInt(countResult?.count ?? "0"),
    };
  } catch {
    return { agentType, tenantId, recentInteractions: [], interactionCount: 0 };
  }
}

export async function getUsageStats(tenantId: string): Promise<{
  totalInteractions: number;
  totalTokens: number;
  avgProcessingMs: number;
  byAgent: Record<string, number>;
  last30Days: number;
}> {
  try {
    const [totals, byAgent] = await Promise.all([
      queryOne<{ total: string; tokens: string; avg_ms: string; last30: string }>(
        `SELECT
           COUNT(*) AS total,
           COALESCE(SUM(tokens_used), 0) AS tokens,
           COALESCE(AVG(processing_ms), 0) AS avg_ms,
           COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS last30
         FROM ai_interactions WHERE tenant_id = $1`,
        [tenantId]
      ),
      query<{ agent_type: string; count: string }>(
        `SELECT agent_type, COUNT(*) AS count
         FROM ai_interactions WHERE tenant_id = $1
         GROUP BY agent_type ORDER BY count DESC`,
        [tenantId]
      ),
    ]);

    const agentMap: Record<string, number> = {};
    byAgent.rows.forEach((r) => { agentMap[r.agent_type] = parseInt(r.count); });

    return {
      totalInteractions: parseInt(totals?.total ?? "0"),
      totalTokens: parseInt(totals?.tokens ?? "0"),
      avgProcessingMs: parseFloat(totals?.avg_ms ?? "0"),
      byAgent: agentMap,
      last30Days: parseInt(totals?.last30 ?? "0"),
    };
  } catch {
    return { totalInteractions: 0, totalTokens: 0, avgProcessingMs: 0, byAgent: {}, last30Days: 0 };
  }
}

export default { saveInteraction, getMemoryContext, getUsageStats };
