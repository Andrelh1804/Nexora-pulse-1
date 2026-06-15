import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

dotenv.config();

const app = express();
const PORT = 5000;
const API_VERSION = "v1";
const API_PREFIX = `/api/${API_VERSION}`;

// ──────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ──────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ──────────────────────────────────────────────
// BODY PARSING
// ──────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────
// STRUCTURED LOGGING (morgan)
// ──────────────────────────────────────────────
morgan.token("tenant", (req: Request) => req.headers["x-tenant-id"] as string ?? "-");
morgan.token("plan", (req: Request) => req.headers["x-plan"] as string ?? "-");

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? '{"time":":date[iso]","method":":method","url":":url","status":":status","ms":":response-time","tenant":":tenant"}'
      : ":method :url :status :response-time ms | tenant=:tenant"
  )
);

// ──────────────────────────────────────────────
// RATE LIMITING
// ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos.", code: "RATE_LIMIT_EXCEEDED" },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Limite de chamadas de IA atingido. Aguarde 1 minuto.", code: "AI_RATE_LIMIT" },
});

app.use(`${API_PREFIX}/`, globalLimiter);
app.use(`${API_PREFIX}/ai/`, aiLimiter);

// ──────────────────────────────────────────────
// CORS (DEV-FRIENDLY)
// ──────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Tenant-Id,X-Plan,X-Request-Id");
  if (req.method === "OPTIONS") { res.sendStatus(204); return; }
  next();
});

// ──────────────────────────────────────────────
// REQUEST CONTEXT MIDDLEWARE
// ──────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Powered-By", "Nexora Pulse API");
  (req as Request & { requestId: string }).requestId = requestId;
  next();
});

// ──────────────────────────────────────────────
// GOOGLE GEMINI AI INIT
// ──────────────────────────────────────────────
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
    console.log("[Nexora API] Gemini AI initialized ✓");
  } catch (err) {
    console.error("[Nexora API] Error initializing Gemini:", err);
  }
} else {
  console.warn("[Nexora API] GEMINI_API_KEY not set — running in simulation mode.");
}

// ──────────────────────────────────────────────
// API v1 ROUTER
// ──────────────────────────────────────────────
const router = express.Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? "development",
    features: {
      ai: !!ai,
      rateLimit: true,
      auditLogs: true,
      multiTenant: true,
    },
  });
});

// System info
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    name: "Nexora Pulse API",
    version: API_VERSION,
    stage: "1.5 — Enterprise Foundation",
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// AI AGENTS ENDPOINT  /api/v1/ai/agent
// ──────────────────────────────────────────────
router.post("/ai/agent", async (req: Request, res: Response) => {
  const { agentType, tenantName, tenantData, userInput } = req.body;

  if (!agentType || !tenantName) {
    return res.status(400).json({
      error: "Parâmetros obrigatórios ausentes: agentType ou tenantName",
      code: "MISSING_PARAMS",
    });
  }

  const validAgents = ["social_media", "copywriter", "analyst", "traffic_manager", "general"];
  if (!validAgents.includes(agentType)) {
    return res.status(400).json({ error: `Tipo de agente inválido: ${agentType}`, code: "INVALID_AGENT_TYPE" });
  }

  const systemInstruction = buildSystemInstruction(agentType, tenantName, tenantData);

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userInput ?? "Gere uma sugestão estratégica para otimizar meus resultados este mês.",
        config: { systemInstruction, temperature: 0.75 },
      });
      const text = response.text ?? "O agente não conseguiu formular uma resposta no momento.";
      return res.json({ result: text, agentType, model: "gemini-2.5-flash", timestamp: new Date().toISOString() });
    } else {
      return res.json(buildSimulatedResponse(agentType, tenantName, tenantData, userInput));
    }
  } catch (error: unknown) {
    console.error("[Nexora API] AI call failed:", error);
    return res.status(200).json({
      ...buildSimulatedResponse(agentType, tenantName, tenantData, userInput),
      fallback: true,
      error: error instanceof Error ? error.message : "AI service temporarily unavailable",
    });
  }
});

// ──────────────────────────────────────────────
// LEGACY COMPAT: /api/gemini/agent → /api/v1/ai/agent
// ──────────────────────────────────────────────
app.post("/api/gemini/agent", async (req: Request, res: Response) => {
  req.url = `${API_PREFIX}/ai/agent`;
  app._router.handle(req, res, () => {});
});

// ──────────────────────────────────────────────
// TENANTS ENDPOINT  /api/v1/tenants
// ──────────────────────────────────────────────
router.get("/tenants", (_req: Request, res: Response) => {
  res.json({
    tenants: [
      { id: "glow", name: "E-commerce Glow", plan: "premium" },
      { id: "stutz", name: "Stutz Imóveis", plan: "enterprise" },
      { id: "meliuz", name: "Méliuz SA", plan: "enterprise" },
      { id: "nexora", name: "Agência Nexora Demo", plan: "basic" },
    ],
    total: 4,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// MARKETPLACE ENDPOINT  /api/v1/marketplace
// ──────────────────────────────────────────────
router.get("/marketplace/items", (_req: Request, res: Response) => {
  res.json({
    items: [],
    total: 0,
    message: "Marketplace API — use client-side domain for in-memory data in dev mode.",
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// FEATURE FLAGS ENDPOINT  /api/v1/features
// ──────────────────────────────────────────────
router.get("/features/:plan", (req: Request, res: Response) => {
  const { plan } = req.params;
  const validPlans = ["basic", "premium", "enterprise"];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: "Plano inválido", validPlans });
  }
  res.json({
    plan,
    features: getFeaturesByPlan(plan),
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// 404 handler for unmatched API routes
// ──────────────────────────────────────────────
router.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Rota de API não encontrada",
    code: "NOT_FOUND",
    hint: `Verifique se está usando o prefixo ${API_PREFIX}/`,
  });
});

// Mount versioned router
app.use(API_PREFIX, router);

// Legacy health compat
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString(), version: API_VERSION });
});

// ──────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ──────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Nexora API] Unhandled error:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    code: "INTERNAL_ERROR",
    message: process.env.NODE_ENV !== "production" ? err.message : "Contate o suporte.",
  });
});

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function buildSystemInstruction(agentType: string, tenantName: string, tenantData: Record<string, unknown>): string {
  const ctx = JSON.stringify(tenantData ?? {});
  if (agentType === "social_media") {
    return `Você é o Agente Social Media sênior da Nexora Pulse, especialista em tráfego orgânico, Instagram, Reels, TikTok, hashtags estratégicas e SEO social. Sua missão é gerar conteúdo altamente viral e focado em engajamento. Seu cliente atual é: "${tenantName}". Dados: ${ctx}. Responda em Markdown rico em português do Brasil.`;
  }
  if (agentType === "copywriter") {
    return `Você é o Agente Copywriter de alta conversão da Nexora Pulse, expert em AIDA, PAS, Meta/Google/TikTok Ads. Cliente: "${tenantName}". Dados: ${ctx}. Copies impactantes em Markdown em português.`;
  }
  if (agentType === "analyst") {
    return `Você é o Agente Analista de Inteligência da Nexora Pulse. Cliente: "${tenantName}". Dados: ${ctx}. Diagnóstico realista e ultra profissional em Markdown em português. Aponte 3 tendências de mercado.`;
  }
  if (agentType === "traffic_manager") {
    return `Você é o Agente Gestor de Tráfego Enterprise da Nexora Pulse. Cliente: "${tenantName}". Dados: ${ctx}. Recomende distribuição de verba entre Meta/Google/TikTok em Markdown em português.`;
  }
  return `Você é um Agente de Marketing Autônomo da Nexora Pulse. Cliente: ${tenantName}. Responda em português.`;
}

function buildSimulatedResponse(agentType: string, tenantName: string, tenantData: Record<string, unknown>, userInput?: string) {
  const followers = tenantData?.followers ?? "12.4k";
  const roas = tenantData?.roas ?? "3.8x";
  const leads = tenantData?.leads ?? "1,240";
  const conversionRate = tenantData?.conversionRate ?? "2.4%";

  let result = "";
  if (agentType === "social_media") {
    result = `### ⚡ Nexora Pulse — Plano de Conteúdo Orgânico para **${tenantName}**\n\nCom base nos seus **${followers} seguidores**:\n\n1. **Reels Viral** — Gancho: "O segredo que seu mercado esconde para faturar mais..."\n   - CTA: "Comente 'PULSE' e receba o passo a passo no Direct!"\n2. **Carrossel Educacional** — Aumentar conversão de ${conversionRate} do seu público.\n3. **Story Interativo** — Use enquete + link na bio com chatbot ativo.\n\n*SEO Social*: Use palavras-chave "automação de vendas" e "growth hacking" nas legendas.`;
  } else if (agentType === "copywriter") {
    result = `### ✍️ Copy de Alta Performance — **${tenantName}**\n\n**Opção A (PAS)**\n- Título: Cansado de queimar verba em anúncios que não vendem?\n- Texto: Enquanto você gerencia manualmente, concorrentes usam IA preditiva...\n- CTA: [Saiba Mais] — Inicie suas automações hoje!\n\n**Opção B (AIDA)**\n- Título: Como escalamos para ROAS de **${roas}** com IA?\n- CTA: [Quero Escalar Meu Negócio]`;
  } else if (agentType === "analyst") {
    result = `### 📊 Relatório de Inteligência — **${tenantName}**\n\n- **Conversão**: ${conversionRate} (meta: 3.5%)\n- **Leads ativos**: ${leads}\n- **ROAS**: ${roas}\n\n**3 Tendências Críticas:**\n1. Vídeos Lo-Fi e Bastidores (+23% retenção no Reels)\n2. Chatbots híbridos: resposta <1min → +40% agendamentos\n3. Hiper-segmentação Meta Ads → -18% CAC`;
  } else {
    result = `### 🎯 Alocação de Orçamento — **${tenantName}**\n\nROAS atual: **${roas}**\n\n- **Meta Ads**: 50% — Conversão direta + WhatsApp\n- **Google Ads**: 35% — Captura de intenção de compra\n- **TikTok Ads**: 15% — Branding + topo de funil\n\n*Active Conversion API* para reter eventos iOS 14+.`;
  }

  return {
    result,
    agentType,
    note: "Resposta gerada via motor de simulação analítica Nexora Pulse (Modo Demonstration Autônomo).",
    timestamp: new Date().toISOString(),
  };
}

function getFeaturesByPlan(plan: string): Record<string, boolean> {
  const base = { social_media: true, marketplace: true };
  const premium = { ...base, ai_agents: true, traffic_manager: true, crm_whatsapp: true, nexora_sites: true, nexora_design: true, nexora_automation: true, capi_dispatcher: true, ai_predictor: true, fast_copy_generator: true, smart_budget_rules: true, export_reports: true };
  const enterprise = { ...premium, admin_cockpit: true, white_label: true, multi_user: true, api_access: true, automation_tests: true };
  if (plan === "enterprise") return enterprise;
  if (plan === "premium") return premium;
  return base;
}

// ──────────────────────────────────────────────
// SERVER START
// ──────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Nexora API] Vite middleware mounted (development).");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Nexora API] Serving static production assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Nexora Pulse API ${API_VERSION} running on http://0.0.0.0:${PORT}`);
    console.log(`   API Gateway: http://0.0.0.0:${PORT}${API_PREFIX}/health`);
    console.log(`   AI Endpoint: http://0.0.0.0:${PORT}${API_PREFIX}/ai/agent`);
    console.log(`   Environment: ${process.env.NODE_ENV ?? "development"}\n`);
  });
}

startServer();
