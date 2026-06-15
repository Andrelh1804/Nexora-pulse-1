import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./src/routes/auth.routes";
import campaignsRoutes from "./src/routes/campaigns.routes";
import leadsRoutes from "./src/routes/leads.routes";
import tenantRoutes from "./src/routes/tenants.routes";
import observabilityRoutes from "./src/routes/observability.routes";
import billingRoutes from "./src/routes/billing.routes";
import socialRoutes from "./src/routes/social.routes";
import { checkConnection } from "./src/lib/db";
import { saveInteraction, getMemoryContext, getUsageStats } from "./src/services/ai-memory.service";
import { authenticate, AuthRequest } from "./src/middleware/auth.middleware";

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Muitas tentativas de autenticação. Aguarde 15 minutos.", code: "AUTH_RATE_LIMIT" },
});

app.use(`${API_PREFIX}/`, globalLimiter);
app.use(`${API_PREFIX}/ai/`, aiLimiter);
app.use(`${API_PREFIX}/auth/login`, authLimiter);
app.use(`${API_PREFIX}/auth/register`, authLimiter);

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

// ── AUTH ROUTES ──────────────────────────────
router.use("/auth", authRoutes);

// ── TENANT ROUTES ────────────────────────────
router.use("/tenant", tenantRoutes);

// ── CAMPAIGNS ROUTES ─────────────────────────
router.use("/campaigns", campaignsRoutes);

// ── LEADS ROUTES ─────────────────────────────
router.use("/leads", leadsRoutes);

// ── OBSERVABILITY ROUTES ─────────────────────
router.use("/ops", observabilityRoutes);

// ── BILLING ROUTES ────────────────────────────
router.use("/billing", billingRoutes);

// ── SOCIAL ROUTES ─────────────────────────────
router.use("/social", socialRoutes);

// ── AI USAGE ──────────────────────────────────
router.get("/ai/usage", authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const stats = await getUsageStats(authReq.user!.tenantId);
  return res.json(stats);
});

// ── HEALTH CHECK ─────────────────────────────
router.get("/health", async (_req: Request, res: Response) => {
  const dbOk = await checkConnection();
  res.json({
    status: "ok",
    version: API_VERSION,
    stage: "2.0 — Foundation to Production",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? "development",
    services: {
      database: dbOk ? "connected" : "disconnected",
      ai: !!ai ? "gemini-2.5-flash" : "simulation",
    },
    features: {
      auth: true,
      rbac: true,
      multiTenant: true,
      rateLimit: true,
      auditLogs: true,
      campaigns: true,
      leads: true,
    },
  });
});

// ── STATUS ───────────────────────────────────
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    name: "Nexora Pulse API",
    version: API_VERSION,
    stage: "2.0 — Foundation to Production",
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// ── AI AGENTS ENDPOINT  /api/v1/ai/agent ─────
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

  const tenantId = req.headers["x-tenant-id"] as string ?? "unknown";
  const memoryCtx = await getMemoryContext(tenantId, agentType, 3);
  const memoryNote = memoryCtx.recentInteractions.length > 0
    ? `\n\n[Contexto histórico — últimas ${memoryCtx.recentInteractions.length} interações deste agente com este cliente]\n` +
      memoryCtx.recentInteractions.map((i, n) => `${n + 1}. Usuário perguntou: "${i.prompt.slice(0, 120)}..."`).join("\n")
    : "";

  const systemInstruction = buildSystemInstruction(agentType, tenantName, tenantData) + memoryNote;
  const prompt = userInput ?? "Gere uma sugestão estratégica para otimizar meus resultados este mês.";
  const startTime = Date.now();

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
        tenantId, agentType, prompt,
        response: text,
        model: "gemini-2.5-flash",
        processingMs,
        isSimulated: false,
        status: "success",
      });

      return res.json({ result: text, agentType, model: "gemini-2.5-flash", timestamp: new Date().toISOString() });
    } else {
      const simulated = buildSimulatedResponse(agentType, tenantName, tenantData, userInput);
      await saveInteraction({
        tenantId, agentType, prompt,
        response: simulated.result,
        processingMs: Date.now() - startTime,
        isSimulated: true,
        status: "success",
      });
      return res.json(simulated);
    }
  } catch (error: unknown) {
    console.error("[Nexora API] AI call failed:", error);
    const simulated = buildSimulatedResponse(agentType, tenantName, tenantData, userInput);
    await saveInteraction({
      tenantId, agentType, prompt,
      response: simulated.result,
      processingMs: Date.now() - startTime,
      isSimulated: true,
      status: "failed",
      metadata: { error: error instanceof Error ? error.message : "unknown" },
    });
    return res.status(200).json({
      ...simulated,
      fallback: true,
      error: error instanceof Error ? error.message : "AI service temporarily unavailable",
    });
  }
});

// ── LEGACY TENANTS LIST ───────────────────────
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

// ── MARKETPLACE ───────────────────────────────
router.get("/marketplace/items", (_req: Request, res: Response) => {
  res.json({ items: [], total: 0, timestamp: new Date().toISOString() });
});

// ── FEATURE FLAGS ─────────────────────────────
router.get("/features/:plan", (req: Request, res: Response) => {
  const { plan } = req.params;
  const validPlans = ["basic", "premium", "enterprise"];
  if (!validPlans.includes(plan)) {
    return res.status(400).json({ error: "Plano inválido", validPlans });
  }
  res.json({ plan, features: getFeaturesByPlan(plan), timestamp: new Date().toISOString() });
});

// ── 404 API handler ───────────────────────────
router.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Rota de API não encontrada",
    code: "NOT_FOUND",
    hint: `Verifique se está usando o prefixo ${API_PREFIX}/`,
  });
});

// Mount versioned router
app.use(API_PREFIX, router);

// ── LEGACY COMPAT ─────────────────────────────
app.post("/api/gemini/agent", async (req: Request, res: Response) => {
  req.url = `${API_PREFIX}/ai/agent`;
  app._router.handle(req, res, () => {});
});

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
  void userInput;

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
async function seedDemoUser() {
  try {
    const { queryOne, query } = await import("./src/lib/db");
    const { hashPassword } = await import("./src/lib/auth");

    const existing = await queryOne(
      "SELECT id FROM users WHERE email = $1",
      ["demo@nexorapulse.com"]
    );
    if (!existing) {
      const hash = await hashPassword("Demo@12345");
      await query(
        `INSERT INTO users (tenant_id, email, password_hash, name, role, is_active, is_verified)
         VALUES ($1, $2, $3, $4, 'admin', TRUE, TRUE)`,
        ["00000000-0000-0000-0000-000000000004", "demo@nexorapulse.com", hash, "Demo User Nexora"]
      );
      console.log("[Nexora API] Demo user seeded: demo@nexorapulse.com / Demo@12345 ✓");
    }
  } catch (err) {
    console.warn("[Nexora API] Could not seed demo user:", err instanceof Error ? err.message : err);
  }
}

async function startServer() {
  const dbOk = await checkConnection();
  if (dbOk) {
    console.log("[Nexora API] PostgreSQL connected ✓");
    await seedDemoUser();
  } else {
    console.warn("[Nexora API] PostgreSQL not connected — DB features will be unavailable.");
  }

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
    console.log(`   API Gateway:  http://0.0.0.0:${PORT}${API_PREFIX}/health`);
    console.log(`   Auth:         http://0.0.0.0:${PORT}${API_PREFIX}/auth/login`);
    console.log(`   AI Endpoint:  http://0.0.0.0:${PORT}${API_PREFIX}/ai/agent`);
    console.log(`   Environment:  ${process.env.NODE_ENV ?? "development"}\n`);
  });
}

startServer();
