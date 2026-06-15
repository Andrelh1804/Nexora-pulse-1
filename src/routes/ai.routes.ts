/**
 * AI ROUTES — /api/v1/ai/*
 * Quota enforcement, histórico persistente e geração via Gemini.
 */

import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { authenticate, requirePlan, AuthRequest } from "../middleware/auth.middleware";
import { saveInteraction, getUsageStats } from "../services/ai-memory.service";
import { checkQuota, getFullQuotaStatus, getAiHistory } from "../services/ai-quota.service";
import { PlanTier } from "../lib/usageEngine";
import logger from "../lib/logger";

const router = Router();

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (_ai) return _ai;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    _ai = new GoogleGenAI({ apiKey: key, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
  } catch {
    _ai = null;
  }
  return _ai;
}

const VALID_AGENTS = ["social_media", "copywriter", "analyst", "traffic_manager", "general"] as const;
type AgentType = typeof VALID_AGENTS[number];

// ── GET /api/v1/ai/quota ─────────────────────────────────────────
router.get("/quota", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, plan } = req.user!;
    const quota = await getFullQuotaStatus(tenantId, plan as PlanTier);
    return res.json({ quota, geminiEnabled: !!getAI(), timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error(`[AI] quota fetch error: ${err instanceof Error ? err.message : err}`, { module: "AI" });
    return res.status(500).json({ error: "Erro ao buscar cota.", code: "QUOTA_ERROR" });
  }
});

// ── GET /api/v1/ai/usage ─────────────────────────────────────────
router.get("/usage", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getUsageStats(req.user!.tenantId);
    return res.json(stats);
  } catch (err) {
    logger.error(`[AI] usage fetch error: ${err instanceof Error ? err.message : err}`, { module: "AI" });
    return res.status(500).json({ error: "Erro ao buscar estatísticas.", code: "STATS_ERROR" });
  }
});

// ── GET /api/v1/ai/history ───────────────────────────────────────
router.get("/history", authenticate, requirePlan("basic"), async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const page = Math.max(1, parseInt(req.query.page as string ?? "1"));
    const pageSize = Math.min(50, Math.max(5, parseInt(req.query.pageSize as string ?? "20")));
    const agentType = req.query.agentType as string | undefined;

    const history = await getAiHistory(tenantId, page, pageSize, agentType);
    return res.json(history);
  } catch (err) {
    logger.error(`[AI] history fetch error: ${err instanceof Error ? err.message : err}`, { module: "AI" });
    return res.status(500).json({ error: "Erro ao buscar histórico.", code: "HISTORY_ERROR" });
  }
});

// ── POST /api/v1/ai/agent ────────────────────────────────────────
router.post("/agent", authenticate, async (req: AuthRequest, res: Response) => {
  const { agentType, tenantName, tenantData, userInput } = req.body as {
    agentType: string;
    tenantName?: string;
    tenantData?: Record<string, unknown>;
    userInput?: string;
  };

  if (!agentType || !tenantName) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes: agentType ou tenantName", code: "MISSING_PARAMS" });
  }
  if (!VALID_AGENTS.includes(agentType as AgentType)) {
    return res.status(400).json({ error: `Tipo de agente inválido: ${agentType}`, code: "INVALID_AGENT_TYPE" });
  }

  const { tenantId, plan } = req.user!;

  // ── Quota enforcement ─────────────────────────────────────────
  const quotaCheck = await checkQuota(tenantId, plan as PlanTier);
  if (!quotaCheck.allowed) {
    return res.status(429).json({
      error: quotaCheck.error,
      code: "QUOTA_EXCEEDED",
      quota: quotaCheck.quota,
      upgradeUrl: "/app/billing",
    });
  }

  const prompt = userInput?.trim() ?? "Gere uma sugestão estratégica para otimizar meus resultados este mês.";
  const systemInstruction = buildSystemInstruction(agentType as AgentType, tenantName, tenantData ?? {});
  const startTime = Date.now();
  const ai = getAI();

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { systemInstruction, temperature: 0.75 },
      });
      const text = response.text ?? "O agente não conseguiu formular uma resposta no momento.";
      const processingMs = Date.now() - startTime;

      await saveInteraction({
        tenantId,
        userId: req.user!.sub,
        agentType,
        prompt,
        response: text,
        model: "gemini-2.5-flash",
        processingMs,
        isSimulated: false,
        status: "success",
      });

      logger.info(`[AI] Agent ${agentType} responded in ${processingMs}ms for tenant ${tenantId}`, { module: "AI" });

      return res.json({
        result: text,
        agentType,
        model: "gemini-2.5-flash",
        processingMs,
        quota: {
          used: quotaCheck.quota.used + 1,
          limit: quotaCheck.quota.limit,
          remaining: Math.max(0, quotaCheck.quota.remaining - 1),
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      // Simulação: não consome cota
      const simulated = buildSimulatedResponse(agentType as AgentType, tenantName, tenantData ?? {});
      await saveInteraction({
        tenantId,
        userId: req.user!.sub,
        agentType,
        prompt,
        response: simulated.result,
        processingMs: Date.now() - startTime,
        isSimulated: true,
        status: "success",
      });
      return res.json({ ...simulated, processingMs: Date.now() - startTime });
    }
  } catch (err) {
    logger.error(`[AI] agent error: ${err instanceof Error ? err.message : err}`, { module: "AI", data: { agentType, tenantId } });
    const simulated = buildSimulatedResponse(agentType as AgentType, tenantName, tenantData ?? {});
    await saveInteraction({
      tenantId,
      agentType,
      prompt,
      response: simulated.result,
      processingMs: Date.now() - startTime,
      isSimulated: true,
      status: "failed",
      metadata: { error: err instanceof Error ? err.message : "unknown" },
    });
    return res.status(200).json({ ...simulated, fallback: true, error: err instanceof Error ? err.message : "AI service temporarily unavailable" });
  }
});

// ── HELPERS ──────────────────────────────────────────────────────
function buildSystemInstruction(agentType: AgentType, tenantName: string, tenantData: Record<string, unknown>): string {
  const ctx = JSON.stringify(tenantData);
  const instructions: Record<AgentType, string> = {
    social_media: `Você é o Agente Social Media sênior da Nexora Pulse, especialista em tráfego orgânico, Instagram, Reels, TikTok, hashtags estratégicas e SEO social. Sua missão é gerar conteúdo altamente viral e focado em engajamento. Seu cliente atual é: "${tenantName}". Dados: ${ctx}. Responda em Markdown rico em português do Brasil.`,
    copywriter: `Você é o Agente Copywriter de alta conversão da Nexora Pulse, expert em AIDA, PAS, Meta/Google/TikTok Ads. Cliente: "${tenantName}". Dados: ${ctx}. Copies impactantes em Markdown em português.`,
    analyst: `Você é o Agente Analista de Inteligência da Nexora Pulse. Cliente: "${tenantName}". Dados: ${ctx}. Diagnóstico realista e ultra profissional em Markdown em português. Aponte 3 tendências de mercado.`,
    traffic_manager: `Você é o Agente Gestor de Tráfego Enterprise da Nexora Pulse. Cliente: "${tenantName}". Dados: ${ctx}. Recomende distribuição de verba entre Meta/Google/TikTok em Markdown em português.`,
    general: `Você é um Agente de Marketing Autônomo da Nexora Pulse. Cliente: ${tenantName}. Responda em português.`,
  };
  return instructions[agentType];
}

function buildSimulatedResponse(agentType: AgentType, tenantName: string, tenantData: Record<string, unknown>) {
  const followers = tenantData?.followers ?? "12.4k";
  const roas = tenantData?.roas ?? "3.8x";
  const leads = tenantData?.leads ?? "1.240";
  const conversionRate = tenantData?.conversionRate ?? "2.4%";

  const results: Record<AgentType, string> = {
    social_media: `### ⚡ Nexora Pulse — Plano de Conteúdo para **${tenantName}**\n\nCom base nos seus **${followers} seguidores**:\n\n1. **Reels Viral** — Gancho: "O segredo que seu mercado esconde..."\n   - CTA: "Comente 'PULSE' e receba o passo a passo!"\n2. **Carrossel Educacional** — Aumentar conversão de ${conversionRate}.\n3. **Story Interativo** — Enquete + link na bio com chatbot ativo.\n\n*SEO Social*: Use "automação de vendas" e "growth hacking" nas legendas.`,
    copywriter: `### ✍️ Copy de Alta Performance — **${tenantName}**\n\n**Opção A (PAS)**\n- Título: Cansado de queimar verba em anúncios?\n- CTA: [Saiba Mais]\n\n**Opção B (AIDA)**\n- Título: Como escalamos ROAS de **${roas}** com IA?\n- CTA: [Quero Escalar]`,
    analyst: `### 📊 Relatório — **${tenantName}**\n\n- **Conversão**: ${conversionRate}\n- **Leads**: ${leads}\n- **ROAS**: ${roas}\n\n**3 Tendências:**\n1. Vídeos Lo-Fi (+23% retenção)\n2. Chatbots híbridos → +40% agendamentos\n3. Hiper-segmentação → -18% CAC`,
    traffic_manager: `### 🎯 Alocação — **${tenantName}**\n\nROAS: **${roas}**\n\n- **Meta Ads**: 50%\n- **Google Ads**: 35%\n- **TikTok**: 15%`,
    general: `### 🤖 Nexora Pulse — **${tenantName}**\n\nPosso ajudá-lo com estratégias de marketing digital, análise de dados e automação de campanhas.`,
  };

  return {
    result: results[agentType],
    agentType,
    note: "Resposta gerada via motor de simulação analítica Nexora Pulse (modo demonstração — ative o Gemini para respostas reais).",
    timestamp: new Date().toISOString(),
  };
}

export default router;
