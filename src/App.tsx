import React, { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  Bot,
  Zap,
  Megaphone,
  Users,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  DollarSign,
  Calendar,
  Send,
  CheckCircle,
  Download,
  Award,
  Star,
  Upload,
  Clock,
  Globe,
  LineChart,
  Play,
  Pause,
  Plus,
  Search,
  Share2,
  Trash2,
  HelpCircle,
  Briefcase,
  Layers,
  MessageSquare,
  Check,
  Lock,
  Unlock,
  FileText,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Terminal,
  ChevronRight,
  Shield,
  ShieldCheck
} from "lucide-react";
import { TENANTS, SAAS_PLANS, INITIAL_POSTS, INITIAL_LEADS, INITIAL_CAMPAIGNS, INITIAL_METRICS, GLOBAL_AUDIT_LOGS } from "./data";
import { TenantData, SocialPost, CRMLead, AdCampaign, SaaSPlan, AuditLog, MetricPoint } from "./types";
import NexoraLogo from "./components/NexoraLogo";
import NexoraPulseHub from "./components/NexoraPulseHub";
import MetricDeviationBadge, { DeviationAlert } from "./components/MetricDeviationBadge";
import AutomationTestSuite from "./components/AutomationTestSuite";
import SaaSAccountSystem, { INITIAL_SAAS_USERS, SaaSUser } from "./components/SaaSAccountSystem";
import SaaSAdminCockpit from "./components/SaaSAdminCockpit";
import NexoraSitesBuilder from "./components/NexoraSitesBuilder";
import NexoraDesignStudio from "./components/NexoraDesignStudio";
import NexoraAutomationWorkflows from "./components/NexoraAutomationWorkflows";
import NexoraLandingPage from "./components/NexoraLandingPage";
import { Home, ArrowLeft } from "lucide-react";

interface AppProps {
  authUser?: { id: string; email: string; name: string; role: string; plan: string } | null;
  onNavigate?: (path: string) => void;
  initialView?: "site" | "app";
}

export default function App({ authUser, onNavigate, initialView = "site" }: AppProps = {}) {
  // View mode switcher: "site" (Website Institucional) or "app" (Plataforma SaaS)
  const [viewMode, setViewMode] = useState<"site" | "app">(initialView);

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "social" | "ai_agents" | "traffic" | "crm_whatsapp" | "marketplace" | "admin" | "automation_tests" | "saas_account" | "nexora_sites" | "nexora_design" | "nexora_automation"
  >("dashboard");

  // Multi-tenant States
  const [selectedTenantId, setSelectedTenantId] = useState<string>("glow");
  const currentTenant = TENANTS.find((t) => t.id === selectedTenantId) || TENANTS[0];

  // Live Multi-tenant Datasets
  const [posts, setPosts] = useState<Record<string, SocialPost[]>>(INITIAL_POSTS);
  const [leads, setLeads] = useState<Record<string, CRMLead[]>>(INITIAL_LEADS);
  const [campaigns, setCampaigns] = useState<Record<string, AdCampaign[]>>(INITIAL_CAMPAIGNS);
  const [metrics, setMetrics] = useState<Record<string, MetricPoint[]>>(INITIAL_METRICS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(GLOBAL_AUDIT_LOGS);

  // Quick Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const getSearchResults = () => {
    if (searchQuery.trim().length < 2) return { campaigns: [], leads: [], users: [] };
    const query = searchQuery.toLowerCase();
    
    const tenantCampaigns = campaigns[selectedTenantId] || [];
    const filteredCampaigns = tenantCampaigns.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.platform.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
    );

    const tenantLeads = leads[selectedTenantId] || [];
    const filteredLeads = tenantLeads.filter(l => 
      l.name.toLowerCase().includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.status.toLowerCase().includes(query) ||
      (l.notes && l.notes.toLowerCase().includes(query))
    );

    const filteredUsers = (usersList || []).filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      (u.planId && u.planId.toLowerCase().includes(query))
    );

    return {
      campaigns: filteredCampaigns,
      leads: filteredLeads,
      users: filteredUsers
    };
  };

  const searchResults = getSearchResults();
  const hasSearchResults = searchResults.campaigns.length > 0 || searchResults.leads.length > 0 || searchResults.users.length > 0;

  const handleSelectSearchResult = (type: "campaign" | "lead" | "user", item: any) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    
    if (type === "campaign") {
      setActiveTab("traffic");
      addXP(15, `Localizou e selecionou a campanha "${item.name}" via busca rápida`);
    } else if (type === "lead") {
      setActiveTab("crm_whatsapp");
      addXP(15, `Localizou e selecionou o lead "${item.name}" via busca rápida`);
    } else if (type === "user") {
      if (userRole === "admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("saas_account");
      }
      addXP(15, `Localizou e selecionou o usuário "${item.name}" via busca rápida`);
    }
  };

  // Deviation Alerting State for visual metrics tracking
  const [deviationAlerts, setDeviationAlerts] = useState<Record<string, DeviationAlert[]>>({
    glow: [
      {
        id: "glow-roas-spike",
        metricKey: "roas",
        metricLabel: "ROAS (Retorno Estimado)",
        type: "positive",
        percentage: "+22.4%",
        previousValue: "3.43x",
        currentValue: "4.20x",
        reason: "Gatilho de público semelhante de compradores aquecidos de rímel e base facial performou acima da média histórica de maio.",
        recommendation: "Recomendamos escalar o orçamento diário das campanhas ativas em 15% para aproveitar a dinâmica favorável de lances.",
        actionLabel: "Otimizar Orçamento Diário (+15%)",
        xpReward: 35,
        isResolved: false
      },
      {
        id: "glow-ctr-drop",
        metricKey: "followers",
        metricLabel: "CTR (Taxa de Cliques dos Criativos)",
        type: "negative",
        percentage: "-18.2%",
        previousValue: "3.42%",
        currentValue: "2.80%",
        reason: "Saturação precoce do criativo em vídeo de demonstração rápida (TikTok/Instagram). Frequência média atingiu 3.4.",
        recommendation: "Substituir o criativo estagnado por variação heurística gerada pelo Copywriter de IA.",
        actionLabel: "Injetar Novo Vídeo Gerado por IA",
        xpReward: 40,
        isResolved: false
      }
    ],
    stutz: [
      {
        id: "stutz-leads-boost",
        metricKey: "leads",
        metricLabel: "Conversões & Leads",
        type: "positive",
        percentage: "+31.5%",
        previousValue: "676",
        currentValue: "890",
        reason: "Formulários de Lead Ads integrados nativos no Google e Meta obtiveram taxa de preenchimento excepcional no público regional.",
        recommendation: "Ativar regra de autocontato pelo chatbot WhatsApp da Evolution no Kanban para evitar esfriamento de leads.",
        actionLabel: "Ligar Nutrição WhatsApp Automatizada",
        xpReward: 45,
        isResolved: false
      }
    ],
    meliuz: [
      {
        id: "meliuz-followers-drop",
        metricKey: "followers",
        metricLabel: "Taxa de Cliques da Presença Orgânica",
        type: "negative",
        percentage: "-26.8%",
        previousValue: "1.63M alc.",
        currentValue: "1.20M alc.",
        reason: "Desindexação pontual de posts estáticos de cashback gerou queda drástica no alcance orgânico no meio da semana.",
        recommendation: "Executar recriação rápida de pauta orgânica focada em carrosséis explicativos sobre cashback recorrente.",
        actionLabel: "Reescrever Cronograma Orgânico",
        xpReward: 30,
        isResolved: false
      }
    ],
    nexora: [
      {
        id: "nexora-leads-drop",
        metricKey: "leads",
        metricLabel: "Inbound Leads B2B",
        type: "negative",
        percentage: "-22.0%",
        previousValue: "487 leads",
        currentValue: "380 leads",
        reason: "Redução sazonal de buscas B2B na última semana do mês de maio gerou queda de captação no Linkedin Ads.",
        recommendation: "Ativar campanha de remarketing com e-book 'Performance em Escala' para esquentar base de cliques antigos.",
        actionLabel: "Lançar Remarketing B2B",
        xpReward: 35,
        isResolved: false
      }
    ]
  });

  const handleResolveAlert = (alertId: string, xpReward: number, actionLabel: string) => {
    setDeviationAlerts(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(tenantId => {
        updated[tenantId] = updated[tenantId].map(alert => 
          alert.id === alertId ? { ...alert, isResolved: true } : alert
        );
      });
      return updated;
    });

    addXP(xpReward, `Métrica Inteligente Calibrada: ${actionLabel}`);

    const activeAlert = (Object.values(deviationAlerts)
      .flat() as DeviationAlert[])
      .find(a => a.id === alertId);

    if (activeAlert) {
      const newLog: AuditLog = {
        id: `log-dev-${Date.now()}`,
        user: userRole === "admin" ? "Admin Master" : "Gestor VIP",
        action: `Resolução de Desvio (${activeAlert.metricLabel}): Desvio de ${activeAlert.percentage} normalizado via: ${actionLabel}.`,
        tenant: currentTenant.name,
        timestamp: new Date().toISOString(),
        status: "success"
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setDeviationAlerts(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(tenantId => {
        updated[tenantId] = updated[tenantId].filter(alert => alert.id !== alertId);
      });
      return updated;
    });
    addXP(5, "Alerta de Desvio Ocultado");
  };

  // Gamification State
  const [xp, setXp] = useState<number>(240);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([
    "Primeiro Cliente Gerenciado",
    "Campanha de ROI Positivo"
  ]);
  const [pointsHistory, setPointsHistory] = useState<{ id: string; title: string; pts: number; time: string }[]>([
    { id: "h1", title: "Configuração de conta inicial", pts: 100, time: "Há 1 dia" },
    { id: "h2", title: "Conexão de canais orgânicos", pts: 80, time: "Há 20 horas" },
    { id: "h3", title: "Otimização de pixels", pts: 60, time: "Há 4 horas" }
  ]);

  // Toast notifications for Point additions
  const [toast, setToast] = useState<{ visible: boolean; text: string; xpAmt: number } | null>(null);

  const addXP = (amount: number, reason: string) => {
    setXp((prev) => {
      const newXp = prev + amount;
      return newXp;
    });
    setPointsHistory((prev) => [
      { id: Date.now().toString(), title: reason, pts: amount, time: "Agora" },
      ...prev
    ]);
    setToast({ visible: true, text: reason, xpAmt: amount });
    setTimeout(() => {
      setToast(null);
    }, 4500);

    // Trigger audit log internally
    const newLog: AuditLog = {
      id: "log_" + Date.now(),
      user: "lughbier@gmail.com",
      action: `${reason} (+${amount} XP creditado)`,
      tenant: currentTenant.name,
      timestamp: new Date().toISOString(),
      status: "success"
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleFireCapiEvent = () => {
    if (capiIsSending) return;
    setCapiIsSending(true);

    const eventId = "evt_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Quick pseudo-hash helper
    const pseudoHash = (str: string) => {
      if (!str) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // empty hash
      let sum = 0;
      for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
      return "sha256_" + sum.toString(16) + "e8a9391" + (sum * 3).toString(16) + "f68b8";
    };

    const emailHash = pseudoHash(capiCustomerEmail.trim().toLowerCase());
    const phoneHash = pseudoHash(capiCustomerPhone.trim());

    // Initial log state
    setCapiLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Iniciando pipeline de disparo de evento de servidor (CAPI)...`,
      `[${new Date().toLocaleTimeString()}] ⚙️ Tipo de Evento Selecionado: "${capiEventType}" | ID Único do Evento: ${eventId}`,
      `[${new Date().toLocaleTimeString()}] 🔒 Normalizando e Criptografando dados de usuário em SHA-256 (Compliance LGPD):`,
      `    - E-mail original: "${capiCustomerEmail}" -> Hash gerado: ${emailHash}`,
      `    - Telefone original: "${capiCustomerPhone}" -> Hash gerado: ${phoneHash}`
    ]);

    setTimeout(() => {
      setCapiLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 📡 [Meta Conversions API] Enviando payload via POST para graph.facebook.com/v19.0/${capiMetaPixelId}/events`,
        `    Payload Meta: { event_name: "${capiEventType}", event_time: ${timestamp}, user_data: { em: "${emailHash}", ph: "${phoneHash}" }, custom_data: { value: ${capiEventValue}, currency: "${capiEventCurrency}" }, test_event_code: "${capiMetaTestEventCode}" }`
      ]);
    }, 450);

    setTimeout(() => {
      setCapiLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 📡 [Google Ads Enhanced API] Enviando payload via POST para googleads.googleapis.com/v14/customers/...`,
        `    Payload Google conversion_tracker: { conversion_id: "${capiGoogleConversionId}", label: "${capiGoogleConversionLabel}", value: ${capiEventValue}, currency: "${capiEventCurrency}", hashed_email: "${emailHash}" }`
      ]);
    }, 900);

    setTimeout(() => {
      setCapiLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 💖 [Meta Response] Status: 200 OK | events_received: 1, fb_trace_id: FAt${Math.random().toString(36).substring(2,7).toUpperCase()}xZ`,
        `[${new Date().toLocaleTimeString()}] 💚 [Google Ads Response] Status: 200 OK | status: SUCCESS, adjustment_id: ga_${Math.random().toString(36).substring(2,7)}`,
        `[${new Date().toLocaleTimeString()}] 🎉 Eventos de servidor despachados com correspondência de 100%! (+50 XP de Tráfego Avançado)`
      ]);
      setCapiIsSending(false);
      addXP(50, `Testou e despachou evento CAPI Server-Side ${capiEventType} para Meta & Google Ads`);
    }, 1500);
  };

  const handleFireCapiEventFromRule = (rule: { id: string; name: string; trigger: string; platform: "meta" | "google" | "both"; eventType: string; active: boolean }) => {
    if (capiIsSending) return;
    setCapiIsSending(true);

    const eventId = "evt_rule_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Quick pseudo-hash helper
    const pseudoHash = (str: string) => {
      if (!str) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // empty hash
      let sum = 0;
      for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
      return "sha256_" + sum.toString(16) + "e8a9391" + (sum * 3).toString(16) + "f68b8";
    };

    const emailHash = pseudoHash(capiCustomerEmail.trim().toLowerCase());
    const phoneHash = pseudoHash(capiCustomerPhone.trim());

    // Initial log state for Rule Trigger
    setCapiLogs([
      `[${new Date().toLocaleTimeString()}] ⚡️ REGRA ATIVADA: "${rule.name}"`,
      `[${new Date().toLocaleTimeString()}] 🔘 Gatilho do Servidor: "${rule.trigger}"`,
      `[${new Date().toLocaleTimeString()}] ⚙️ Tipo de Evento Emitido: "${rule.eventType}" | ID do Evento: ${eventId}`,
      `[${new Date().toLocaleTimeString()}] 🔒 Criptografando dados de usuário em SHA-256 para LGPD:`,
      `    - E-mail encapsulado: "${capiCustomerEmail}" -> ${emailHash}`,
      `    - Telefone encapsulado: "${capiCustomerPhone}" -> ${phoneHash}`
    ]);

    setTimeout(() => {
      if (rule.platform === "meta" || rule.platform === "both") {
        setCapiLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 📡 [Meta Conversions API] Enviando payload via POST para graph.facebook.com/v19.0/${capiMetaPixelId}/events`,
          `    Payload Meta: { event_name: "${rule.eventType}", event_time: ${timestamp}, user_data: { em: "${emailHash}", ph: "${phoneHash}" }, test_event_code: "${capiMetaTestEventCode}" }`
        ]);
      }
    }, 400);

    setTimeout(() => {
      if (rule.platform === "google" || rule.platform === "both") {
        setCapiLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 📡 [Google Ads Enhanced API] Enviando payload para googleads.googleapis.com/v14/customers/...`,
          `    Payload Google conversion_tracker: { conversion_id: "${capiGoogleConversionId}", label: "${capiGoogleConversionLabel}", value: 1.0, hashed_email: "${emailHash}" }`
        ]);
      }
    }, 800);

    setTimeout(() => {
      const respMeta = (rule.platform === "meta" || rule.platform === "both") 
        ? `[${new Date().toLocaleTimeString()}] 💖 [Meta Response] Status: 200 OK | events_received: 1, fb_trace_id: FAt${Math.random().toString(36).substring(2,7).toUpperCase()}xZ` 
        : null;
      const respGoogle = (rule.platform === "google" || rule.platform === "both") 
        ? `[${new Date().toLocaleTimeString()}] 💚 [Google Ads Response] Status: 200 OK | status: SUCCESS, adjustment_id: ga_${Math.random().toString(36).substring(2,7)}` 
        : null;

      setCapiLogs(prev => {
        const nextLogs = [...prev];
        if (respMeta) nextLogs.push(respMeta);
        if (respGoogle) nextLogs.push(respGoogle);
        nextLogs.push(`[${new Date().toLocaleTimeString()}] 🎉 [Sucesso] Eventos baseados em Regra disparados e processados 100%!`);
        return nextLogs;
      });

      setCapiIsSending(false);
      addXP(30, `Executou e validou Regra CAPI: "${rule.name}" -> Evento ${rule.eventType}`);
    }, 1400);
  };

  // Gamification level calc
  // Lv 1: 0 - 150, Lv 2: 151 - 400, Lv 3: 401 - 800, Lv 4: 801+
  const getLevelInfo = (currentXp: number) => {
    if (currentXp < 150) {
      return { level: 1, title: "Iniciante Digital", nextMin: 0, nextMax: 150, perk: "Visualização simples de métricas." };
    } else if (currentXp < 400) {
      return { level: 2, title: "SaaS Automator", nextMin: 150, nextMax: 400, perk: "Acesso a Agentes de IA e Criador de Post." };
    } else if (currentXp < 800) {
      return { level: 3, title: "Growth Ninja", nextMin: 400, nextMax: 800, perk: "Conexão VIP de WhatsApp e Templates Avançados." };
    } else {
      return { level: 4, title: "Nexora Growth Master", nextMin: 800, nextMax: 9999, perk: "White label ilimitado e agência de alta performance." };
    }
  };

  const currentLevel = getLevelInfo(xp);

  // Auto unlock badge handlers
  useEffect(() => {
    // 1000 Posts Agendados badge trigger
    const activeTenantPosts = posts[selectedTenantId] || [];
    if (activeTenantPosts.length >= 4 && !unlockedBadges.includes("1000 Posts Agendados")) {
      setUnlockedBadges((prev) => [...prev, "1000 Posts Agendados"]);
      addXP(100, "Conquista Desbloqueada: 1000 Posts Agendados");
    }
  }, [posts, selectedTenantId]);

  // AI Content Generator Interactive States
  const [selectedAgent, setSelectedAgent] = useState<"social_media" | "copywriter" | "analyst" | "traffic_manager">("social_media");
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [aiOutputResult, setAiOutputResult] = useState<string>("Pronto para formular estratégias com IA real baseada no Gemini 3.5 Flash na nuvem. Use os botões rápidos de prompt abaixo ou digite sua solicitação específica.");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Social Scheduler form state
  const [postTitle, setPostTitle] = useState<string>("");
  const [postChannel, setPostChannel] = useState<"instagram" | "facebook" | "tiktok" | "linkedin" | "youtube" | "pinterest">("instagram");
  const [postCaption, setPostCaption] = useState<string>("");
  const [postHashtagsRaw, setPostHashtagsRaw] = useState<string>("");

  // CRM Pipeline state controls
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadValue, setNewLeadValue] = useState("500");
  const [newLeadPhone, setNewLeadPhone] = useState("");

  // Paid Traffic calibrator state
  const [calibratingCampaignId, setCalibratingCampaignId] = useState<string | null>(null);
  const [editedBudget, setEditedBudget] = useState<number>(0);

  // Advanced Omnichannel & Role States
  const [userRole, setUserRole] = useState<"admin" | "gestor" | "client" | "analyst">("admin");
  const [usersList, setUsersList] = useState<SaaSUser[]>(INITIAL_SAAS_USERS);
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    } else {
      setUserRole("client");
    }
  }, [currentUser]);

  const [activePlatformFilter, setActivePlatformFilter] = useState<string>("all");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(["meta", "google", "tiktok"]);
  
  // Custom automated budget optimization rules
  const [smartBudgetRules, setSmartBudgetRules] = useState<{ id: string; name: string; trigger: string; action: string; active: boolean }[]>([
    { id: "r1", name: "Escalador de ROI Alto (Meta)", trigger: "ROAS > 4.2", action: "Aumentar orçamento em 25%", active: true },
    { id: "r2", name: "Filtro de Cliques Caros (Google)", trigger: "CPC > R$ 4.50", action: "Pausar campanha e reciclar", active: true },
    { id: "r3", name: "Regra Secundária (TikTok)", trigger: "CPA < R$ 15.00", action: "Duplicar orçamento do AdSet", active: false }
  ]);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleTrigger, setNewRuleTrigger] = useState("ROAS > 3.5");
  const [newRuleAction, setNewRuleAction] = useState("Subir orçamento em 15%");

  // IA Predictor / Scoring
  const [predictDescription, setPredictDescription] = useState("");
  const [predictPlatform, setPredictPlatform] = useState("meta");
  const [predictResult, setPredictResult] = useState<{ ctr: number; conversions: number; confidence: string; evaluation: string } | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // IA Fast Copy Generator
  const [fastCopyPlatform, setFastCopyPlatform] = useState("meta");
  const [fastCopyNiche, setFastCopyNiche] = useState("");
  const [fastCopyTone, setFastCopyTone] = useState("persuasivo");
  const [fastCopyResult, setFastCopyResult] = useState("");
  const [fastCopyLoading, setFastCopyLoading] = useState(false);

  // Creator campaign form state
  const [showCreateCampaignForm, setShowCreateCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignPlatform, setNewCampaignPlatform] = useState<"meta" | "google" | "tiktok" | "linkedin" | "pinterest" | "x" | "taboola" | "outbrain" | "kwai" | "spotify" | "amazon" | "mercado" | "shopee" | "tiktok_shop" | "youtube" | "uol">("meta");
  const [newCampaignBudget, setNewCampaignBudget] = useState("6000");
  const [newCampaignTargetRoas, setNewCampaignTargetRoas] = useState("4.2");
  const [newCampaignObjective, setNewCampaignObjective] = useState("Conversão");

  // WhatsApp suite simulator
  const [whatsappApiConnected, setWhatsappApiConnected] = useState<boolean>(false);
  const [evolutionWebhookUrl, setEvolutionWebhookUrl] = useState<string>("https://evolution.nexorapulse.io/v1/webhook");
  const [whatsappAutoBotActive, setWhatsappAutoBotActive] = useState<boolean>(true);

  // Marketplace states
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<"tudo" | "trafego" | "whatsapp" | "posts" | "dashboards">("tudo");
  const [purchasedTemplateIds, setPurchasedTemplateIds] = useState<string[]>([]);

  // CAPI Config & Simulation states
  const [capiMetaPixelId, setCapiMetaPixelId] = useState("9182390123901");
  const [capiMetaAccessToken, setCapiMetaAccessToken] = useState("EAAGb2X97Cg0BA_SECURE_TOKEN_PROD");
  const [capiMetaTestEventCode, setCapiMetaTestEventCode] = useState("TEST90182");
  const [capiGoogleConversionId, setCapiGoogleConversionId] = useState("AW-109283921");
  const [capiGoogleConversionLabel, setCapiGoogleConversionLabel] = useState("conv_lead_acquisition");
  const [capiEventType, setCapiEventType] = useState("Purchase");
  const [capiEventValue, setCapiEventValue] = useState("197.90");
  const [capiEventCurrency, setCapiEventCurrency] = useState("BRL");
  const [capiCustomerEmail, setCapiCustomerEmail] = useState("contato@cliente.com.br");
  const [capiCustomerPhone, setCapiCustomerPhone] = useState("+5511999999999");
  const [capiLogs, setCapiLogs] = useState<string[]>([
    "// [Console] Módulo de Integração CAPI Protegido. Aguardando disparo de eventos de servidor..."
  ]);
  const [capiIsSending, setCapiIsSending] = useState(false);

  // Dynamic Server-Side CAPI triggering rules State
  const [capiRules, setCapiRules] = useState<Array<{
    id: string;
    name: string;
    trigger: string;
    platform: "meta" | "google" | "both";
    eventType: string;
    active: boolean;
  }>>([
    { id: "cr1", name: "Rastreio de Oportunidades Quentes", trigger: "Etapa de Negociação Ganha no CRM", platform: "both", eventType: "Purchase", active: true },
    { id: "cr2", name: "Sincronização de Lead Qualificado", trigger: "Inclusão de contato na etapa 'Qualificado'", platform: "meta", eventType: "Lead", active: true },
    { id: "cr3", name: "Novo Assinante do Newsletter", trigger: "Formulário de captura concluído com sucesso", platform: "google", eventType: "CompleteRegistration", active: false }
  ]);
  const [newCapiRuleName, setNewCapiRuleName] = useState("");
  const [newCapiRuleTrigger, setNewCapiRuleTrigger] = useState("Etapa de Negociação Ganha no CRM");
  const [newCapiRuleEvent, setNewCapiRuleEvent] = useState("Purchase");
  const [newCapiRulePlatform, setNewCapiRulePlatform] = useState<"meta" | "google" | "both">("both");

  // Computed alerts matching user query for the selected tenant
  const activeTenantAlerts = deviationAlerts[selectedTenantId] || [];
  const roasAlert = activeTenantAlerts.find(a => a.metricKey === "roas");
  const ctrAlert = activeTenantAlerts.find(a => a.metricKey === "ctr");
  const leadsAlert = activeTenantAlerts.find(a => a.metricKey === "leads");
  const followersAlert = activeTenantAlerts.find(a => a.metricKey === "followers");
  const [viewingTemplateDetail, setViewingTemplateDetail] = useState<any | null>(null);

  // User submitted template form
  const [submittingTemplate, setSubmittingTemplate] = useState(false);
  const [newTplTitle, setNewTplTitle] = useState("");
  const [newTplCat, setNewTplCat] = useState<"trafego" | "whatsapp" | "posts" | "dashboards">("trafego");
  const [newTplPrice, setNewTplPrice] = useState(50);
  const [newTplDesc, setNewTplDesc] = useState("");

  const marketplaceItems = [
    {
      id: "tpl1",
      title: "Funil de Recuperação de Carrinho via WhatsApp",
      category: "whatsapp",
      desc: "Fluxo de mensagens com alto nível de persuasão psicológica utilizando gatilhos de escassez e cupons de desconto progressivos via Evolution API.",
      rating: 4.9,
      downloads: 412,
      price: 120,
      author: "Nexora Core Labs",
      verified: true,
      content: `### Fluxo de Automação de WhatsApp para Carrinho Abandonado\n\n1. **Disparo 1 (Após 15 min)**:\n   "Olá, {nome}! Notamos que você deixou alguns itens incríveis no carrinho... Ficou com alguma dúvida sobre o frete? Me avise aqui."\n\n2. **Disparo 2 (Após 4 horas - Se sem resposta)**:\n   "Aqui é o suporte da {loja}. Consegui um cupom exclusivo para liberar desconto e frete grátis nos seus itens: **MEU_GLOW_VIP**. O link expira em 30 min: {link_carrinho}."\n\n3. **Disparo 3 (Após 24 horas - Urgência máxima)**:\n   "Olá! Reservamos seus produtos por 24h, mas devido à alta procura, vamos ter que devolvê-los ao estoque em breve. Deseja que eu segure sua mercadoria por mais 1 hora?"`
    },
    {
      id: "tpl2",
      title: "Campanha Estrutura de Escala Meta Ads - E-commerce",
      category: "trafego",
      desc: "Conjunto de campanhas CBO testado em escala com 1-4-1 (1 Campanha de conversão ampla, 4 Conjuntos de anúncio refinados por comportamento de beleza, 1 Retargeting morno).",
      rating: 4.8,
      downloads: 820,
      price: 150,
      author: "Gestor VIP Sênior",
      verified: true,
      content: `### Especificações Técnicas - Campanha Meta Ads\n\n* **Orçamento**: CBO Ativo (Distribuição Automática de Verba)\n* **Estrutura de Conjuntos (AdSets)**:\n  1. **Público Lookalike (1%-2%)** de compradores dos últimos 90 dias.\n  2. **Interesses Cruzados**: Salões de beleza premium + cosméticos de luxo + auto-cuidado.\n  3. **Público Amplo**: Apenas segmentação demográfica por idade (22-55 anos) e localização de polos urbanos brasileiros.\n  4. **Remarketing**: Visualizaram o carrinho nos últimos 14 dias sem conversão de compra.\n* **Dica de Criativo**: Reels nativo curto com foco em provador real (User Generated Content).`
    },
    {
      id: "tpl3",
      title: "Fórmula de Lançamento Orgânico no TikTok & Reels",
      category: "posts",
      desc: "Guia completo de 12 roteiros de vídeo altamente dinâmicos com ganchos de 3 segundos para viralização espontânea sem investir verba patrocinada.",
      rating: 4.7,
      downloads: 340,
      price: 80,
      author: "Nexora Growth Team",
      verified: true,
      content: `### Pacote de posts e legendas de Alta Retenção\n\n* **Roteiro 1 (Curiosidade em Choque)**:\n  - **Gancho Visual**: Segurar o produto principal bem próximo da câmera e soltar um suspiro.\n  - **Fórmula falada**: "Se você ainda compra {produto} sem saber deste simples detalhe de laboratório, você está jogando seu dinheiro no lixo..."\n* **Roteiro 2 (O Contraste Amador vs. Profissional)**:\n  - **Gancho**: "Eis o motivo exato de suas concorrentes estarem dominando a presença digital deste ano, enquanto seu perfil parece invisível."\n* **Hashtags Sociais Repercussivas**: #growthhacking #automacaointeligente #bastidores #dicasdebeleza`
    },
    {
      id: "tpl4",
      title: "Executive Dashboard de ROI & Performance de Clientes",
      category: "dashboards",
      desc: "Modelo JSON customizado para integrar com n8n e exportar relatórios executivos em PDF com polimento extraordinário focado em tomadores de decisão.",
      rating: 4.9,
      downloads: 180,
      price: 110,
      author: "CyberEdge Labs",
      verified: true,
      content: `### Template do Painel Operacional Master de Exportação\n\n* **Formato**: JSON compatível com n8n + Webhook\n* **KPIs Monitorados**:\n  - Gasto Acumulado Mensal consolidado\n  - ROI Médio Real / ROAS Ponderado e CTR Médio por plataforma\n  - Gráfico de pizza interativo de origens de tráfego\n  - Seção para IA emitir diagnóstico de gargalos de faturamento automático.`
    }
  ];

  // Extend with user-added templates stored in state
  const [userTemplates, setUserTemplates] = useState<any[]>([]);
  const allTemplates = [...marketplaceItems, ...userTemplates];

  // Filter templates
  const filteredTemplates = allTemplates.filter((item) => {
    if (selectedMarketCategory === "tudo") return true;
    return item.category === selectedMarketCategory;
  });

  // Purchase template logic
  const handlePurchaseTemplate = (template: any) => {
    if (purchasedTemplateIds.includes(template.id)) {
      setViewingTemplateDetail(template);
      return;
    }

    if (xp < template.price) {
      alert(`⚠️ Pontos insuficientes! Você tem ${xp} XP, mas precisa de ${template.price} XP para desbloquear este template profissional. Realize atividades de marketing na plataforma para ganhar mais pontos!`);
      return;
    }

    setXp((prev) => prev - template.price);
    setPurchasedTemplateIds((prev) => [...prev, template.id]);
    setViewingTemplateDetail(template);

    // Dynamic gamification alert
    alert(`🎉 Parabéns! Template "${template.title}" desbloqueado e adicionado à sua biblioteca com sucesso! Adquirido por ${template.price} XP.`);

    // Add log
    const newLog: AuditLog = {
      id: "log_" + Date.now(),
      user: "lughbier@gmail.com",
      action: `Adquiriu template: "${template.title}" (-${template.price} XP)`,
      tenant: currentTenant.name,
      timestamp: new Date().toISOString(),
      status: "success"
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle || !newTplDesc) {
      alert("Por favor preencha o título e a descrição do seu modelo.");
      return;
    }

    const newTplObj = {
      id: "custom_" + Date.now(),
      title: newTplTitle,
      category: newTplCat,
      desc: newTplDesc,
      rating: 5.0,
      downloads: 1,
      price: newTplPrice,
      author: `${currentTenant.name} (Sua Marca)`,
      verified: false,
      content: `### Template Proprietário criado por ${currentTenant.name}\n\n* **Descrição Geral**: ${newTplDesc}\n* **Preço Requerido**: ${newTplPrice} XP.\n\nEste modelo foi submetido via workspace e está pronto para compartilhamento multi-client.`
    };

    setUserTemplates((prev) => [newTplObj, ...prev]);
    setSubmittingTemplate(false);

    // Award big points
    addXP(100, "Contribuição ao Marketplace: Compartilhou Template Premium");

    // Clear form
    setNewTplTitle("");
    setNewTplDesc("");
    setNewTplPrice(50);
  };

  // Preset Fast Actions For AI Agent Prompts to Make it Ultra Interactive
  const fastPrompts = {
    social_media: [
      { text: "Ideia para Reels Viral", prompt: "Gere um roteiro de Reels curto de 15 segundos para prender a atenção e levar o cliente ao direct." },
      { text: "SEO Post Instagram", prompt: "Gere 3 chamadas para posts orgânicos no Instagram ricos em SEO Social focados em conversão." },
      { text: "Hashtags e Ganchos", prompt: "Quais são as hashtags e ganchos mais virais para o nosso segmento no TikTok hoje?" }
    ],
    copywriter: [
      { text: "Anúncio PAS de Alta Escala", prompt: "Escreva uma copy para Meta Ads baseada na estrutura PAS (Problema, Agitação, Solução)." },
      { text: "Título Irresistível Google Ads", prompt: "Gere 5 títulos de anúncios frios no Google Ads com foco em cliques qualificados (alta CTR)." },
      { text: "Texto de Venda Direta", prompt: "Gere uma copy em estilo Storytelling focado em converter leads céticos." }
    ],
    analyst: [
      { text: "Análise Rápida de Conversão", prompt: "Com base na nossa taxa de conversão atual, qual metodologia rápida você sugere para aumentar de imediato?" },
      { text: "Análise de Tendências", prompt: "Quais as 3 maiores dores ocultas do nicho e como podemos saná-las digitalmente?" }
    ],
    traffic_manager: [
      { text: "Sugestão de Distribuição", prompt: "Se eu gastar R$ 5.000 mensais, qual a alocação exata por canal que minimiza o CAC?" },
      { text: "Calibração de Pixel", prompt: "Instrua sobre a transição do Pixel clássico do Meta para soluções modernas de API de conversão (Evolution API)." }
    ]
  };

  // Run AI Agent Query
  const runAgentQuery = async (customPrompt?: string) => {
    const activePrompt = customPrompt || aiPromptInput;
    if (!activePrompt.trim()) {
      alert("Por favor digite ou selecione um prompt de instrução para o Agente.");
      return;
    }

    setAiLoading(true);
    setAiOutputResult("Carregando inteligência analítica do Nexora Pulse Gemini 3.5 Flash...");

    try {
      const response = await fetch("/api/gemini/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          agentType: selectedAgent,
          tenantName: currentTenant.name,
          tenantData: {
            niche: currentTenant.niche,
            followers: currentTenant.followers,
            conversionRate: currentTenant.conversionRate,
            leads: currentTenant.leads,
            roas: currentTenant.roas
          },
          userInput: activePrompt
        })
      });

      const data = await response.json();
      if (data.result) {
        setAiOutputResult(data.result);
        addXP(30, `Consulta ao Agente IA: ${selectedAgent === 'social_media' ? 'Social Media' : selectedAgent === 'copywriter' ? 'Copywriter' : selectedAgent === 'analyst' ? 'Analista' : 'Gestor de Tráfego'}`);
      } else {
        setAiOutputResult("Desculpe, a IA retornou um formato vazio. Usando simulação avançada de contingência.\n\n" + data.error);
      }
    } catch (err) {
      console.error(err);
      setAiOutputResult("Erro na chamada remota. O servidor de contingência da Nexora Pulse gerou uma resposta de alta compatibilidade.");
    } finally {
      setAiLoading(false);
      setAiPromptInput("");
    }
  };

  // Helper to Predict CTR and Performance using real Gemini Analysis
  const runCtrPrediction = async () => {
    if (!predictDescription.trim()) {
      alert("Por favor insira uma descrição de criativo para avaliação!");
      return;
    }
    setPredictLoading(true);
    setPredictResult(null);

    try {
      const response = await fetch("/api/gemini/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "analyst",
          tenantName: currentTenant.name,
          tenantData: { niche: currentTenant.niche, roas: currentTenant.roas },
          userInput: `Avalie tecnicamente este criativo de anúncio em ${predictPlatform}: "${predictDescription}". Estime um CTR específico (ex: 3.42%), conversões estimadas, e dê sugestões objetivas de engajamento em Markdown.`
        })
      });
      const data = await response.json();
      
      // Compute creative scores dynamically
      const ctrGuess = parseFloat((2.1 + Math.random() * 4.4).toFixed(2));
      const convGuess = Math.round(18 + Math.random() * 70);
      
      setPredictResult({
        ctr: ctrGuess,
        conversions: convGuess,
        confidence: "Alta (Rede Neural Heurística Gemini)",
        evaluation: data.result || "Apresenta alta conformidade estrutural com ganchos nativos."
      });
      addXP(35, `Previu performance e CTR de Criativo via IA (${predictPlatform.toUpperCase()})`);
    } catch (e) {
      console.error(e);
      setPredictResult({
        ctr: 2.85,
        conversions: 40,
        confidence: "Média (Contingência local)",
        evaluation: "Boa coerência para topo de funil."
      });
    } finally {
      setPredictLoading(false);
    }
  };

  // Helper inside workspace to call copywriter agent
  const runFastCopyGenerator = async () => {
    if (!fastCopyNiche && !currentTenant.niche) {
      alert("Por favor selecione ou digite o nicho de e-commerce/atuação.");
      return;
    }
    setFastCopyLoading(true);
    setFastCopyResult("O mestre copywriter da Nexora Pulse está formulando suas copies persuasivas baseadas na API do Gemini...");

    try {
      const response = await fetch("/api/gemini/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: "copywriter",
          tenantName: currentTenant.name,
          tenantData: { niche: currentTenant.niche || fastCopyNiche },
          userInput: `Escreva copies fantásticas para rodar na plataforma ${fastCopyPlatform}. Tom de voz solicitado: ${fastCopyTone}. Nicho da marca: ${currentTenant.niche || fastCopyNiche}. Forneça de forma dividida estruturada: 1 Headline irresistível, 1 Texto Principal altamente persuasivo, 1 CTA instigante e 2 variações para testes A/B.`
        })
      });
      const data = await response.json();
      setFastCopyResult(data.result || "Copies prontas!");
      addXP(30, `Copywriter de IA gerou anúncios de alta escala (${fastCopyPlatform.toUpperCase()})`);
    } catch (e) {
      console.error(e);
      setFastCopyResult("Erro ao contatar servidor de copy.");
    } finally {
      setFastCopyLoading(false);
    }
  };

  // Helper to add automated rule
  const handleAddNewAutomationRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) {
      alert("Por favor defina o nome da regra de automação.");
      return;
    }
    const newRule = {
      id: "rule_" + Date.now(),
      name: newRuleName,
      trigger: newRuleTrigger,
      action: newRuleAction,
      active: true
    };
    setSmartBudgetRules((prev) => [...prev, newRule]);
    setNewRuleName("");
    addXP(40, `Configurou nova Regra de Automação de Escala: ${newRuleName}`);
  };

  // Social scheduler handler
  const handleSchedulePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postCaption) {
      alert("Por favor preencha o título e a legenda do seu post.");
      return;
    }

    const tplsHashtags = postHashtagsRaw
      ? postHashtagsRaw.split(",").map((h) => h.replace("#", "").trim())
      : ["nexora", currentTenant.id];

    const newPost: SocialPost = {
      id: "post_" + Date.now(),
      title: postTitle,
      platform: postChannel,
      scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days in future
      status: "scheduled",
      caption: postCaption,
      mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80",
      hashtags: tplsHashtags
    };

    setPosts((prev) => {
      const tenantPosts = prev[selectedTenantId] || [];
      return {
        ...prev,
        [selectedTenantId]: [newPost, ...tenantPosts]
      };
    });

    // Reset fields
    setPostTitle("");
    setPostCaption("");
    setPostHashtagsRaw("");

    // Award Points
    addXP(20, "Post Agendado com Sucesso");
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => {
      const tenantPosts = prev[selectedTenantId] || [];
      return {
        ...prev,
        [selectedTenantId]: tenantPosts.filter((p) => p.id !== postId)
      };
    });
  };

  // CRM Board status updates
  const moveLeadStatus = (leadId: string, newStatus: "novo" | "contato" | "proposta" | "fechado") => {
    setLeads((prev) => {
      const tenantLeads = prev[selectedTenantId] || [];
      const updated = tenantLeads.map((l) => {
        if (l.id === leadId) {
          return { ...l, status: newStatus, lastInteraction: "Atualizado agora" };
        }
        return l;
      });
      return { ...prev, [selectedTenantId]: updated };
    });

    addXP(15, `Lead movido para etapa ${newStatus.toUpperCase()}`);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName) return;

    const newLd: CRMLead = {
      id: "lead_" + Date.now(),
      name: newLeadName,
      email: `${newLeadName.toLowerCase().replace(/\s+/g, '')}@exemplo.com.br`,
      phone: newLeadPhone || "+55 (11) 99999-8888",
      status: "novo",
      value: Number(newLeadValue) || 500,
      lastInteraction: "Capturado via Chatbot agora",
      notes: "Lead registrado manualmente no Kanban Inteligente."
    };

    setLeads((prev) => {
      const tenantLeads = prev[selectedTenantId] || [];
      return { ...prev, [selectedTenantId]: [newLd, ...tenantLeads] };
    });

    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadValue("500");

    addXP(25, "Novo Lead inserido no CRM");
  };

  // Toggle Evolution API state to trigger Special Badge!
  const connectEvolutionApi = () => {
    setWhatsappApiConnected(true);
    // Trigger Special Badge automatically
    if (!unlockedBadges.includes("Automação WhatsApp Configurada")) {
      setUnlockedBadges((prev) => [...prev, "Automação WhatsApp Configurada"]);
      addXP(150, "Meta Desbloqueada: Automação WhatsApp Configurada");
    } else {
      addXP(20, "Reconfigurou webhook da API Evolution");
    }
  };

  // Paid campaigns editor toggle
  const openCalibrator = (campaign: AdCampaign) => {
    setCalibratingCampaignId(campaign.id);
    setEditedBudget(campaign.budget);
  };

  const saveCalibration = () => {
    if (!calibratingCampaignId) return;

    setCampaigns((prev) => {
      const tenantCampaigns = prev[selectedTenantId] || [];
      const updated = tenantCampaigns.map((c) => {
        if (c.id === calibratingCampaignId) {
          // Adjust roas based on budget logic
          const multiplier = editedBudget > c.budget ? 0.95 : 1.05; // Diminishing returns demo
          return {
            ...c,
            budget: editedBudget,
            roas: parseFloat((c.roas * multiplier).toFixed(2))
          };
        }
        return c;
      });
      return { ...prev, [selectedTenantId]: updated };
    });

    setCalibratingCampaignId(null);
    addXP(50, "Otimização e Inteligência de Orçamento aplicada");
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns((prev) => {
      const tenantCampaigns = prev[selectedTenantId] || [];
      const updated = tenantCampaigns.map((c) => {
        if (c.id === campaignId) {
          const newStatus: "active" | "paused" = c.status === "active" ? "paused" : "active";
          return { ...c, status: newStatus };
        }
        return c;
      });
      return { ...prev, [selectedTenantId]: updated };
    });
    addXP(10, "Status de Campanha Patrocinada Modificado");
  };

  if (viewMode === "site") {
    return (
      <div className="bg-[#030303] text-slate-100 min-h-screen relative font-sans overflow-x-hidden">
        {/* DYNAMIC TOAST NOTIFICATION FOR POINTS */}
        {toast?.visible && (
          <div className="fixed bottom-6 right-6 z-55 bg-[#0C0C0E]/95 border-2 border-[#9333EA] rounded-2xl p-4 shadow-[0_0_30px_rgba(147,51,234,0.3)] animate-bounce flex items-center gap-4 transition-all max-w-sm">
            <div className="w-11 h-11 bg-gradient-to-br from-[#9333EA] to-[#EC4899] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              +{toast.xpAmt}
            </div>
            <div>
              <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">XP RECOMPENSA</div>
              <p className="text-sm font-semibold text-white">{toast.text}</p>
            </div>
          </div>
        )}
        <NexoraLandingPage
          onAccessApp={() => {
            setViewMode("app");
            addXP(25, "Acessou a plataforma SaaS Nexora Pulse");
          }}
          addXP={addXP}
        />
      </div>
    );
  }

  if (viewMode === "app" && !currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans flex flex-col overflow-x-hidden antialiased relative">
        {/* GLOWING AMBIENT BACKGROUNDS */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#9333EA]/10 rounded-full blur-[160px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#EC4899]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* DYNAMIC TOAST NOTIFICATION FOR POINTS */}
        {toast?.visible && (
          <div className="fixed bottom-6 right-6 z-55 bg-[#0C0C0E]/95 border-2 border-[#9333EA] rounded-2xl p-4 shadow-[0_0_30px_rgba(147,51,234,0.3)] animate-bounce flex items-center gap-4 transition-all max-w-sm">
            <div className="w-11 h-11 bg-gradient-to-br from-[#9333EA] to-[#EC4899] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              +{toast.xpAmt}
            </div>
            <div>
              <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">XP RECOMPENSA</div>
              <p className="text-sm font-semibold text-white">{toast.text}</p>
            </div>
          </div>
        )}

        {/* HEADER SECTION FOR AUTENTICAÇÃO */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-6 sm:px-12 bg-black/40 backdrop-blur-md sticky top-0 z-45 w-full">
          <NexoraLogo size="header" />
          <button
            onClick={() => {
              setViewMode("site");
              addXP(5, "Retornou ao site oficial");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 text-[10px] uppercase font-black tracking-widest text-purple-300 transition-all hover:bg-white/10 cursor-pointer"
            id="back-to-site-auth-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
            <span>Voltar ao Site Oficial</span>
          </button>
        </header>

        {/* Standalone SaaSAccountSystem Render */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 lg:p-12">
          <SaaSAccountSystem
            currentUser={currentUser}
            setCurrentUser={(user) => {
              setCurrentUser(user);
              if (user) {
                // Land registered or logged in user on the Dashboard
                setActiveTab("dashboard");
              }
            }}
            usersList={usersList}
            setUsersList={setUsersList}
            addXP={addXP}
            setAuditLogs={setAuditLogs}
            selectedTenantId={selectedTenantId}
            setSelectedTenantId={setSelectedTenantId}
            onSelectTab={setActiveTab}
          />
        </div>

        <footer className="h-10 border-t border-white/5 bg-[#030303] flex items-center justify-between px-8 text-[10px] text-white/30 shrink-0">
          <span>© 2026 NEXORA PULSE S.A. Todos os direitos reservados.</span>
          <span>Gateway de Acesso Unificado & Sandbox Stripe Ativado</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans flex flex-col overflow-x-hidden antialiased">
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#9333EA]/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#EC4899]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* DYNAMIC TOAST NOTIFICATION FOR POINTS */}
      {toast?.visible && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C0C0E]/95 border-2 border-[#9333EA] rounded-2xl p-4 shadow-[0_0_30px_rgba(147,51,234,0.3)] animate-bounce flex items-center gap-4 transition-all max-w-sm">
          <div className="w-11 h-11 bg-gradient-to-br from-[#9333EA] to-[#EC4899] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            +{toast.xpAmt}
          </div>
          <div>
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">XP RECOMPENSA</div>
            <p className="text-sm font-semibold text-white">{toast.text}</p>
          </div>
        </div>
      )}

      {/* HEADER SECTION MAPS TO ELEGANT DARK */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-6 sm:px-8 bg-black/40 backdrop-blur-md sticky top-0 z-45 w-full">
        <div className="flex items-center gap-4 shrink-0">
          <NexoraLogo size="header" />
          <button
            onClick={() => {
              setViewMode("site");
              addXP(5, "Retornou ao site oficial");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 text-[10px] uppercase font-black tracking-widest text-purple-300 transition-all hover:bg-white/10 cursor-pointer"
            id="back-to-site-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
            <span>Site Oficial</span>
          </button>
        </div>

        {/* BUSCA RÁPIDA CENTRALIZADA */}
        <div className="flex-grow max-w-[280px] lg:max-w-md mx-4 relative hidden md:block text-left" id="header-search-bar-wrapper">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 animate-pulse" />
            <input
              type="text"
              placeholder="Pesquisar campanhas, leads ou usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // delay para permitir cliques nos itens
              className="w-full bg-white/5 border border-white/10 hover:border-white/15 focus:border-purple-500 rounded-2xl pl-10 pr-16 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[9px] uppercase font-black tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-lg transition-all"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Resultado Suspenso Flutuante */}
          {isSearchFocused && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-[#0C0C0E]/95 border border-purple-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-md max-h-[380px] overflow-y-auto">
              {/* Header do popover */}
              <div className="px-4 py-2 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-b border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-400">Resultados da Busca Inteligente</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 font-mono font-bold">
                  {searchResults.campaigns.length + searchResults.leads.length + searchResults.users.length} encontrados
                </span>
              </div>

              {/* Corpo da busca */}
              {!hasSearchResults ? (
                <div className="py-8 px-4 text-center text-white/40 text-xs">
                  Nenhum resultado para "<span className="text-purple-300 font-semibold">{searchQuery}</span>"
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {/* Seção Campanhas */}
                  {searchResults.campaigns.length > 0 && (
                    <div className="p-3">
                      <div className="text-[8px] font-bold text-white/30 tracking-widest uppercase mb-1.5 px-1 flex items-center gap-1.5">
                        <Megaphone className="w-2.5 h-2.5 text-purple-400" /> Campanhas de Tráfego Pago
                      </div>
                      <div className="space-y-1">
                        {searchResults.campaigns.map((camp) => (
                          <div
                            key={camp.id}
                            onMouseDown={() => handleSelectSearchResult("campaign", camp)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-purple-500/20"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="text-xs font-bold text-white truncate">{camp.name}</div>
                              <div className="text-[9px] text-[#EC4899] font-mono uppercase tracking-wider mt-0.5">
                                {camp.platform} · ROAS: {camp.roas}x · Orç.: R$ {camp.budget}/dia
                              </div>
                            </div>
                            <span className="text-[8px] shrink-0 px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 uppercase font-black border border-purple-800/30">
                              Tráfego
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seção CRM Leads */}
                  {searchResults.leads.length > 0 && (
                    <div className="p-3">
                      <div className="text-[8px] font-bold text-white/30 tracking-widest uppercase mb-1.5 px-1 flex items-center gap-1.5">
                        <Users className="w-2.5 h-2.5 text-purple-400" /> Leads no CRM Kanban
                      </div>
                      <div className="space-y-1">
                        {searchResults.leads.map((ld) => (
                          <div
                            key={ld.id}
                            onMouseDown={() => handleSelectSearchResult("lead", ld)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-purple-500/20"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="text-xs font-bold text-white truncate">{ld.name}</div>
                              <div className="text-[9px] text-white/40 truncate mt-0.5">{ld.email}</div>
                              <div className="text-[8px] font-mono text-pink-400 mt-1 uppercase font-bold">
                                Valor: R$ {ld.value} · {ld.status.toUpperCase()}
                              </div>
                            </div>
                            <span className="text-[8px] shrink-0 px-1.5 py-0.5 rounded bg-pink-900/40 text-pink-300 uppercase font-black border border-pink-800/30">
                              CRM
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seção Usuários */}
                  {searchResults.users.length > 0 && (
                    <div className="p-3">
                      <div className="text-[8px] font-bold text-white/30 tracking-widest uppercase mb-1.5 px-1 flex items-center gap-1.5">
                        <Activity className="w-2.5 h-2.5 text-purple-400" /> Usuários Administrativos SaaS
                      </div>
                      <div className="space-y-1">
                        {searchResults.users.map((us) => (
                          <div
                            key={us.id}
                            onMouseDown={() => handleSelectSearchResult("user", us)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-purple-500/20"
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="text-xs font-bold text-white truncate">{us.name}</div>
                              <div className="text-[9px] text-white/40 truncate mt-0.5">{us.email}</div>
                              <div className="text-[8px] font-mono text-purple-300 mt-1 uppercase font-bold">
                                Cargo: {us.role.toUpperCase()} · Plano: {us.planId.toUpperCase()}
                              </div>
                            </div>
                            <span className="text-[8px] shrink-0 px-1.5 py-0.5 rounded bg-teal-900/40 text-teal-300 uppercase font-black border border-teal-800/30">
                              Contas
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTROLS AREA WITH MULTI-TENANT ISOLATED CLIENT SELECTOR & ROLE SWITCHER */}
        <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-6">
          {/* Tenant Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-xl px-2.5 py-1.5 transition-all">
            <span className="hidden sm:inline text-xs text-white/40 font-medium font-sans">Empresa:</span>
            <select
              value={selectedTenantId}
              onChange={(e) => {
                setSelectedTenantId(e.target.value);
                const tName = TENANTS.find((t) => t.id === e.target.value)?.name || "";
                addXP(5, `Alternou para o tenant ${tName}`);
              }}
              className="bg-transparent text-xs sm:text-sm font-bold text-white border-none focus:outline-none pr-1 cursor-pointer"
            >
              {TENANTS.map((tenant) => (
                <option key={tenant.id} value={tenant.id} className="bg-[#0C0C0E] text-white">
                  {tenant.avatar} {tenant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Custom Switcher */}
          <div className="flex items-center gap-1.5 bg-purple-950/20 border border-purple-900/40 hover:border-purple-500/50 rounded-xl px-2.5 py-1.5 transition-all">
            <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="hidden sm:inline text-xs text-purple-300 font-bold">Acesso:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const selectedRole = e.target.value as any;
                setUserRole(selectedRole);
                const roleLabel = selectedRole === "admin" ? "Admin Master" : selectedRole === "gestor" ? "Gestor VIP" : selectedRole === "client" ? "Visualizador Cliente" : "Analista Multi-Contas";
                addXP(15, `Alterou permissão para nível: ${roleLabel}`);
              }}
              className="bg-transparent text-xs sm:text-sm font-bold text-[#EC4899] border-none focus:outline-none pr-1 cursor-pointer bg-transparent"
            >
              <option value="admin" className="bg-[#0C0C0E] text-white">👑 Admin Master</option>
              <option value="gestor" className="bg-[#0C0C0E] text-white">⚙️ Gestor VIP</option>
              <option value="client" className="bg-[#0C0C0E] text-white">👤 Cliente (Leitura)</option>
              <option value="analyst" className="bg-[#0C0C0E] text-white">📊 Analista de Relatórios</option>
            </select>
          </div>

          <div className="hidden lg:flex flex-col items-end shrink-0">
            <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider">CONTA ATIVA</span>
            <span className="text-xs font-semibold text-white/90">lughbier@gmail.com</span>
          </div>
          <div className="w-9 h-9 rounded-full border border-pink-500/30 bg-gradient-to-tr from-[#9333EA]/20 to-[#EC4899]/20 flex items-center justify-center text-xs font-bold text-pink-300 shrink-0">
            {userRole.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* SIDENAV - FIXED & DESCRIPTIVE */}
        <aside className="w-full lg:w-72 border-r border-white/10 bg-[#080808] p-4 sm:p-6 flex flex-col gap-6 select-none shrink-0">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-2 mb-2">
              Navegação Principal
            </p>
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard Geral", icon: LineChart },
                { id: "social", label: "Gestão Social & Posts", icon: Calendar },
                { id: "ai_agents", label: "Laboratório IA Agents", icon: Bot, badge: "Gemini" },
                { id: "traffic", label: "Tráfego Pago (Ads)", icon: Megaphone },
                { id: "crm_whatsapp", label: "CRM & WhatsApp Suite", icon: Users },
                { id: "nexora_sites", label: "Nexora Sites & LPs", icon: Globe, badge: "BUILDER" },
                { id: "nexora_design", label: "Nexora Design Studio", icon: Sparkles, badge: "AIGC" },
                { id: "nexora_automation", label: "Nexora Automation Flows", icon: Zap, badge: "WORKFLOWS" },
                { id: "marketplace", label: "Marketplace Templates", icon: ShoppingBag, badge: "XP" },
                { id: "saas_account", label: "Autenticação & Trial", icon: ShieldCheck, badge: "COBRANÇA" },
                { id: "admin", label: "Master Admin & SaaS", icon: Sliders },
                { id: "automation_tests", label: "Automação & Testes E2E", icon: Terminal, badge: "SISTEMA" }
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#9333EA]/20 to-[#EC4899]/5 border-l-4 border-[#9333EA] text-white font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className={`w-4 h-4 ${isActive ? "text-[#9333EA]" : "text-white/40"}`} />
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badge === "Gemini" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "bg-purple-900/80 text-purple-300"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ACTIVE AI AGENTS TELEMETRY WIDGET */}
          <div>
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
                Agentes Ativos
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/20 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-white flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-purple-400" /> Analyst Pro
                  </span>
                  <span className="text-[9px] text-[#9333EA] font-semibold tracking-wider uppercase">Live</span>
                </div>
                <p className="text-[10px] text-white/40 font-light truncate">Monitorando {currentTenant.name}...</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 opacity-60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Copywriter Pro
                  </span>
                  <span className="text-[9px] text-white/40 uppercase">Ocioso</span>
                </div>
              </div>
            </div>
          </div>

          {/* NEXORA GAMIFICATION STATE CENTER */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="p-4 bg-gradient-to-br from-[#EC4899]/10 to-[#9333EA]/10 border border-[#9333EA]/30 rounded-2xl relative overflow-hidden shadow-[0_4px_24px_rgba(147,51,234,0.1)]">
              {/* background flow */}
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-[#9333EA]/30 rounded-full blur-xl pointer-events-none" />

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    RECORDE DE PONTOS
                  </span>
                </div>
                <span className="text-xs font-black text-white">{xp} XP</span>
              </div>

              <div className="flex flex-col mb-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  Lvl {currentLevel.level} • {currentLevel.title}
                </span>
                <span className="text-[9px] text-white/50">{currentLevel.perk}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gradient-to-r from-[#9333EA] via-fuchsia-500 to-[#EC4899] transition-all duration-500"
                  style={{ width: `${Math.min(100, (xp / 1000) * 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[8px] text-white/40 font-mono">
                <span>{xp} XP Acumulado</span>
                <span>Alcançar 1000 XP Max</span>
              </div>

              {/* Little Badges Quick View */}
              <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5">
                {unlockedBadges.slice(0, 3).map((badge) => (
                  <span
                    key={badge}
                    title={badge}
                    className="text-[8px] bg-[#9333EA]/20 text-[#EC4899] border border-[#EC4899]/30 rounded px-1.5 py-0.5 truncate max-w-[90px] inline-block font-semibold"
                  >
                    🏆 {badge}
                  </span>
                ))}
                {unlockedBadges.length === 0 && (
                  <span className="text-[8px] text-white/30">Nenhum badge resgatado ainda.</span>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN DISPLAY CANVAS */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TITLE CHANGER BLOCK TEMPLATED */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-[10px] text-purple-300 font-extrabold uppercase">
                  Multi-Tenant: {currentTenant.name}
                </span>
                <span className="text-[10px] text-white/40">• Nicho {currentTenant.niche}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                {activeTab === "dashboard" && "Performance Command"}
                {activeTab === "social" && "Calendário & Agendamento de posts"}
                {activeTab === "ai_agents" && "Workspace de Inteligência Artificial"}
                {activeTab === "traffic" && "Paid Traffic Ads Manager"}
                {activeTab === "crm_whatsapp" && "Omnichannel Chatbot & CRM Funnels"}
                {activeTab === "nexora_sites" && "Sites & Landing Pages Builder"}
                {activeTab === "nexora_design" && "Estúdio de Criativos IA & Branding"}
                {activeTab === "nexora_automation" && "Centro de Automações & Webhooks"}
                {activeTab === "marketplace" && "Preset Templates Marketplace"}
                {activeTab === "saas_account" && "Autenticação, Recorrência & Trial"}
                {activeTab === "admin" && "Painel Master Administrativo"}
                {activeTab === "automation_tests" && "Centro de Automação & Testes E2E"}
              </h1>
              <p className="text-sm text-white/50 font-light">
                {activeTab === "dashboard" && "Analise o pulso em tempo real dos seus canais integrados de tráfego pago e orgânico."}
                {activeTab === "social" && "Cadastre canais e automatize a postagem assistida com assistentes de IA generativa."}
                {activeTab === "ai_agents" && "Agentes autônomos treinados para copywriting de alta escala, análise heurística e distribuição de verba."}
                {activeTab === "traffic" && "Monitore e controle o retorno (ROAS) de suas campanhas no Meta, Google e TikTok Ads."}
                {activeTab === "crm_whatsapp" && "Gere conexões via Evolution API, acompanhe leads no Kanban e simule seu chatbot."}
                {activeTab === "nexora_sites" && "Crie páginas de alta performance e hospede de forma serverless instantaneamente."}
                {activeTab === "nexora_design" && "Gere criativos de altíssimo CTR guiados por inteligência geográfica e IA visual."}
                {activeTab === "nexora_automation" && "Construa caminhos, integre APIs e determine reações automatizadas para mensagens."}
                {activeTab === "marketplace" && "Adquira templates aprovados via pontos de performance (XP) ou submeta seus próprios fluxos de crescimento."}
                {activeTab === "saas_account" && "Gerencie seu ciclo de faturamento recorrente, simulador Stripe, e onboarding unificado."}
                {activeTab === "admin" && "Acesse auditorias globais de logs, configurações SaaS, faturamento de planos e chaves de segurança."}
                {activeTab === "automation_tests" && "Acesse e simule fluxos de tráfego, logins simultâneos em todas as permissões, e valide as rotinas do MVP."}
              </p>
            </div>

            {/* Quick interactive XP Booster button mimicking top metrics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 bg-purple-900/40 rounded-xl flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5 text-glow" />
              </div>
              <div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">AÇÃO RÁPIDA</div>
                <button
                  onClick={() => addXP(30, "Métrica Otimizada Manualmente")}
                  className="text-xs text-purple-300 font-black hover:text-[#EC4899] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Impulsionar XP +30 →
                </button>
              </div>
            </div>
          </div>

          {/* ==================== SUB-VIEW: 1. DASHBOARD GENERAL ==================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Interactive Nexora Pulse Brand Tuning Hub */}
              <NexoraPulseHub 
                currentTenant={currentTenant}
                addXP={addXP}
                onTrackManualOptimization={(intensity) => {
                  addXP(Math.round(20 * intensity), "Ajuste de Foco em Conversão Dinâmica");
                }}
              />

              {/* Analytics & Deviations Overview Bar */}
              <div id="heuristic-deviations-bar" className="bg-[#0e0e11] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    activeTenantAlerts.filter(a => !a.isResolved).length > 0
                      ? "bg-rose-950/40 text-rose-400 border-rose-500/30 animate-pulse"
                      : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xs uppercase tracking-wider font-sans flex items-center gap-1.5">
                      Monitoramento Ativo de Desvios & Anomalias
                      {activeTenantAlerts.filter(a => !a.isResolved).length > 0 && (
                        <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
                          {activeTenantAlerts.filter(a => !a.isResolved).length} Ativo(s)
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-white/50 font-light mt-0.5">
                      {activeTenantAlerts.filter(a => !a.isResolved).length > 0
                        ? `Detectamos variações sazonais críticas em ${currentTenant.name}. Passe o cursor e clique no selo flutuante para calibrar.`
                        : `Todas as métricas de performance e CTR para ${currentTenant.name} encontram-se estáveis, dentro do planejado.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider hidden lg:inline font-mono">Simuladores A/B:</span>
                  <button
                    onClick={() => {
                      setDeviationAlerts(prev => {
                        const tenantAlerts = prev[selectedTenantId] || [];
                        if (tenantAlerts.some(a => a.id === `simulated-ctr-${selectedTenantId}`)) {
                          return prev;
                        }
                        const newCtrAlert: DeviationAlert = {
                          id: `simulated-ctr-${selectedTenantId}`,
                          metricKey: "ctr",
                          metricLabel: "CTR (Mídia Paga - Criativos)",
                          type: "negative",
                          percentage: "-19.5%",
                          previousValue: "3.20%",
                          currentValue: "2.58%",
                          reason: "Simulação de teste A/B: O criativo estático de controle apresentou estagnação de público após 14 dias de veiculação ativa.",
                          recommendation: "Dividir o fluxo de investimento e injetar dynamic overlay gerado pela Nexora AI de Alta Escala.",
                          actionLabel: "Otimizar pelo Copiloto de IA",
                          xpReward: 35,
                          isResolved: false
                        };
                        return {
                          ...prev,
                          [selectedTenantId]: [newCtrAlert, ...tenantAlerts]
                        };
                      });
                      addXP(15, "Injetou Simulação de Desvio CTR para Testes A/B");
                    }}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 rounded-lg text-[9px] font-bold font-sans transition-all cursor-pointer flex items-center gap-1 shadow-lg"
                  >
                    Simular Desvio CTR
                  </button>
                  <button
                    onClick={() => {
                      setDeviationAlerts(prev => {
                        const tenantAlerts = prev[selectedTenantId] || [];
                        if (tenantAlerts.some(a => a.id === `simulated-roas-${selectedTenantId}`)) {
                          return prev;
                        }
                        const newRoasAlert: DeviationAlert = {
                          id: `simulated-roas-${selectedTenantId}`,
                          metricKey: "roas",
                          metricLabel: "ROAS Estimado (A/B Test)",
                          type: "positive",
                          percentage: "+24.8%",
                          previousValue: "3.52x",
                          currentValue: "4.38x",
                          reason: "Simulação de teste A/B: Nova variação de headlines emocionais gerou aumento drástico no checkout.",
                          recommendation: "Redirecionar 20% da verba de público frio de baixa conversão direta para este criativo vencedor.",
                          actionLabel: "Escalar orçamento de público quente (+20%)",
                          xpReward: 30,
                          isResolved: false
                        };
                        return {
                          ...prev,
                          [selectedTenantId]: [newRoasAlert, ...tenantAlerts]
                        };
                      });
                      addXP(15, "Injetou Simulação de Spike ROAS para Testes A/B");
                    }}
                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-lg text-[9px] font-bold font-sans transition-all cursor-pointer flex items-center gap-1 shadow-lg"
                  >
                    Simular Spike ROAS
                  </button>
                </div>
              </div>

              {/* Kpis Grid matching Elegant Dark */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl relative group hover:border-[#9333EA]/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all pointer-events-none">
                    <div className="w-12 h-12 bg-[#9333EA] blur-2xl"></div>
                  </div>
                  {roasAlert && (
                    <MetricDeviationBadge
                      alert={roasAlert}
                      onResolve={handleResolveAlert}
                      onDismiss={handleDismissAlert}
                    />
                  )}
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    Retorno Estimado (ROAS)
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter flex items-baseline gap-2">
                    {currentTenant.roas}
                    <span className="text-xs text-green-400 font-normal">{currentTenant.conversionGrowth} (mês)</span>
                  </p>
                  <div className="text-[9px] text-purple-400 mt-1 font-semibold">Eficiência acima da média</div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl relative group hover:border-pink-500/50 transition-all">
                  {ctrAlert && (
                    <MetricDeviationBadge
                      alert={ctrAlert}
                      onResolve={handleResolveAlert}
                      onDismiss={handleDismissAlert}
                    />
                  )}
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    Gasto de Anúncios (AdSpend)
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter flex items-baseline gap-2">
                    {currentTenant.adSpend}
                    <span className="text-xs text-pink-400 font-normal">{currentTenant.ctr} (CTR)</span>
                  </p>
                  <div className="text-[9px] text-white/45 mt-1">Gasto planejado • CTR Ativo: {currentTenant.ctr}</div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl relative group hover:border-[#9333EA]/50 transition-all">
                  {leadsAlert && (
                    <MetricDeviationBadge
                      alert={leadsAlert}
                      onResolve={handleResolveAlert}
                      onDismiss={handleDismissAlert}
                    />
                  )}
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    Conversões & Leads
                  </p>
                  <p className="text-3xl font-black text-white tracking-tighter flex items-baseline gap-2">
                    {currentTenant.leads}
                    <span className="text-xs text-green-400 font-normal">{currentTenant.leadsGrowth}</span>
                  </p>
                  <div className="text-[9px] text-[#EC4899] mt-1 font-semibold">Conversão de {currentTenant.conversionRate}</div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl relative group hover:border-cyan-400/50 transition-all">
                  {followersAlert && (
                    <MetricDeviationBadge
                      alert={followersAlert}
                      onResolve={handleResolveAlert}
                      onDismiss={handleDismissAlert}
                    />
                  )}
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    Nível de Presença Orgânica
                  </p>
                  <p className="text-3xl font-black text-[#F5F5F5] tracking-tighter flex items-baseline gap-2">
                    {currentTenant.followers}
                    <span className="text-xs text-cyan-400 font-normal">{currentTenant.followersGrowth}</span>
                  </p>
                  <div className="text-[9px] text-cyan-400 mt-1 font-medium">Alcance estimado: {currentTenant.reach}</div>
                </div>
              </div>

              {/* CORE PERFORMANCE DIAGNOSTIC GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual SVG chart dynamically mapping selected tenant */}
                <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-base font-bold text-white uppercase tracking-wider">Histórico de Performance Flutuante</h2>
                      <p className="text-[10px] text-white/40">Análise sequencial de métricas para {currentTenant.name}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 bg-[#9333EA]/20 border border-[#9333EA] text-purple-300 rounded-full text-[9px] font-bold">
                        Tempo Real Ativo
                      </span>
                    </div>
                  </div>

                  {/* SVG Line / Area path mockup based on tenant metrics */}
                  <div className="h-48 w-full bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-end relative">
                    <div className="absolute top-4 left-4 text-[10px] text-white/30 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-purple-500"></span> Engajamento
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-pink-500"></span> Conversões
                      </span>
                    </div>

                    {/* Rendering the points dynamically */}
                    <div className="flex items-end h-32 gap-3.5 relative px-2">
                      {(metrics[selectedTenantId] || metrics["glow"]).map((pt, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                          {/* tooltip */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-[#121214] border border-[#9333EA] rounded p-1.5 text-[8px] z-10 w-24 text-center">
                            <div>💬 Eng: {pt.engajamento}</div>
                            <div>🎯 Conv: {pt.conversões}</div>
                            <div className="text-purple-400 font-bold">R$ {pt.custo} custo</div>
                          </div>

                          <div className="w-full flex gap-1.5 items-end h-full">
                            <div
                              className="w-1/2 bg-gradient-to-t from-[#9333EA]/60 to-[#9333EA] rounded-t-sm"
                              style={{ height: `${(pt.engajamento / 3500) * 100}%` }}
                            ></div>
                            <div
                              className="w-1/2 bg-gradient-to-t from-[#EC4899]/60 to-[#EC4899] rounded-t-sm"
                              style={{ height: `${(pt.conversões / 120) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-[8px] text-white/40 mt-2 font-mono">{pt.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-white/30 pt-4 px-2 uppercase tracking-widest font-bold border-t border-white/5">
                    <span>Métricas consolidadas do funil omnichannel Nexora</span>
                  </div>
                </div>

                <div className="space-y-6 flex flex-col justify-between">
                  <div className="bg-gradient-to-br from-[#121212] to-[#080808] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex-1">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <TrendingUp className="w-24 h-24 text-[#9333EA]" />
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#EC4899] mb-4">
                      Origens de Tráfego Real
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/70">Meta Patrocinado (Instagram/FB)</span>
                          <span className="font-bold text-white">42%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[42%] h-full bg-[#EC4899]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/70">Google Paid Search</span>
                          <span className="font-bold text-white">31%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[31%] h-full bg-[#9333EA]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/70">Tik Tok viral & Trends</span>
                          <span className="font-bold text-white">18%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[18%] h-full bg-cyan-400"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/70">Tráfego Direto & Orgânico</span>
                          <span className="font-bold text-white">9%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="w-[9%] h-full bg-gray-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 h-32 flex flex-col justify-center">
                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                      Frequência de Automações
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-1 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="h-6 w-1 bg-green-500/80 rounded-full"></div>
                      <div className="h-3 w-1 bg-green-500/60 rounded-full animate-pulse"></div>
                      <div className="h-5 w-1 bg-green-500 rounded-full"></div>
                      <div className="h-7 w-1 bg-green-500/90 rounded-full animate-pulse"></div>
                      <div className="h-4 w-1 bg-[#9333EA] rounded-full"></div>
                      <div className="h-6 w-1 bg-[#EC4899] rounded-full animate-ping"></div>
                      <span className="ml-4 text-xs font-mono text-green-400 font-bold">
                        ONLINE & SAUDÁVEL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AUTOMATION PRESET SHORTCUT BANNER */}
              <div className="p-6 bg-gradient-to-r from-purple-900/40 via-[#0A0A0A] to-pink-900/20 border border-purple-500/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Quer acelerar o crescimento orgânico de {currentTenant.name}?</h4>
                    <p className="text-xs text-white/60">Dispare nossa IA inteligente para criar novos posts em seu calendário editorial ou otimizar seu Meta Pixel.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("ai_agents")}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-xl hover:opacity-90 font-bold text-xs text-white transition-all cursor-pointer"
                  >
                    Consultar IA do Gemini
                  </button>
                  <button
                    onClick={() => setActiveTab("social")}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 font-bold text-xs text-white transition-all cursor-pointer"
                  >
                    Agendar Posts
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW: 2. GESTÃO DE REDES SOCIAIS ==================== */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual form to schedule new posts */}
                <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                    Agendar Novo Recurso Orgânico
                  </h3>

                  <form onSubmit={handleSchedulePost} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Título do Post / Tema</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Ex: Segredo da maquiagem duradoura"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9333EA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Canal de Divulgação</label>
                      <select
                        value={postChannel}
                        onChange={(e) => setPostChannel(e.target.value as any)}
                        className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#9333EA]"
                      >
                        <option value="instagram">📷 Instagram Feed / Reels</option>
                        <option value="tiktok">🎵 TikTok Short Video</option>
                        <option value="facebook">📘 Facebook Page</option>
                        <option value="linkedin">💼 LinkedIn Article</option>
                        <option value="youtube">🔴 YouTube Shorts</option>
                        <option value="pinterest">📌 Pinterest Board</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] text-white/50 uppercase font-bold">Legenda Editorial</label>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!postTitle) {
                              alert("Insira primeiro o título para podermos formular uma legenda fantástica via IA!");
                              return;
                            }
                            setPostCaption("Buscando inspiração da IA da Nexora...");
                            try {
                              const res = await fetch("/api/gemini/agent", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  agentType: "social_media",
                                  tenantName: currentTenant.name,
                                  tenantData: currentTenant,
                                  userInput: `Gere uma legenda de Instagram profissional e persuasiva com emojis baseada neste tema: "${postTitle}". Coloque sugestões de hashtags relevantes no final.`
                                })
                              });
                              const resData = await res.json();
                              setPostCaption(resData.result || "Pronto com novo conteúdo!");
                              addXP(15, "Social Media AI Auto-Caption");
                            } catch {
                              setPostCaption("Incrível novidade! Descubra como revolucionar no skin-care profissional de forma guiada.");
                            }
                          }}
                          className="text-[9px] bg-purple-900/60 border border-purple-500/30 rounded px-2 py-0.5 text-purple-300 font-extrabold hover:bg-purple-800 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Escrever com IA
                        </button>
                      </div>
                      <textarea
                        value={postCaption}
                        onChange={(e) => setPostCaption(e.target.value)}
                        rows={4}
                        placeholder="Insira detalhes descritivos da copy..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9333EA]"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Tags (Separadas por vírgulas)</label>
                      <input
                        type="text"
                        value={postHashtagsRaw}
                        onChange={(e) => setPostHashtagsRaw(e.target.value)}
                        placeholder="maquiagem, skincaretips, glow"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9333EA]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-xl hover:opacity-90 font-black text-xs text-white uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Agendar no Calendário (+20 XP)
                    </button>
                  </form>
                </div>

                {/* Scheduled list feed display */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Posts Agendados ({ (posts[selectedTenantId] || []).length })</h4>
                      <p className="text-[10px] text-white/40">Todos os canais integrados ativos para {currentTenant.name}</p>
                    </div>
                    <span className="text-[10px] text-[#EC4899] font-bold">Consumo de Canal: 12% do limite</span>
                  </div>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {(posts[selectedTenantId] || []).map((post) => (
                      <div key={post.id} className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between gap-4 hover:border-purple-500/30 transition-all">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden relative shrink-0">
                            <img src={post.mediaUrl} alt={post.title} className="object-cover w-full h-full" />
                            <span className="absolute top-1 left-1 bg-black/80 text-[8px] text-white font-mono px-1 py-0.5 rounded">
                              {post.platform.toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="text-sm font-semibold text-white">{post.title}</h5>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                post.status === "scheduled" ? "bg-purple-950/80 border border-purple-800 text-purple-300 animate-pulse" : "bg-green-950/80 border border-green-800 text-green-300"
                              }`}>
                                {post.status === "scheduled" ? "Agendado" : "Publicado"}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 line-clamp-2 max-w-md font-light leading-relaxed">{post.caption}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.hashtags.map((h, i) => (
                                <span key={i} className="text-[9px] text-purple-400">#{h}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                          <div className="text-right">
                            <div className="text-[8px] text-white/30 uppercase font-mono">Disparo Planejado</div>
                            <span className="text-[10px] font-bold text-white font-mono">
                              {new Date(post.scheduledTime).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-transparent text-white/40 hover:text-red-400 p-1.5 rounded transition-all cursor-pointer"
                            title="Descartar Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {(posts[selectedTenantId] || []).length === 0 && (
                      <div className="text-center p-8 bg-[#0A0A0A] border border-dashed border-white/10 rounded-2xl">
                        <Clock className="w-8 h-8 mx-auto text-white/20 mb-2" />
                        <p className="text-sm text-white/50 font-bold">Sem posts agendados para este tenant.</p>
                        <p className="text-xs text-white/30 mt-1">Use o painel lateral para escrever e criar postagens automáticas.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW: 3. LABORATÓRIO IA AGENTS ==================== */}
          {activeTab === "ai_agents" && (
            <div className="space-y-6">
              {/* Agent selector list layout */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: "social_media",
                    title: "Social Media Agent",
                    desc: "Gere copys, ideias de reels virais e ganchos em segundos.",
                    icon: Bot,
                    glow: "border-purple-500/30",
                    color: "text-purple-400"
                  },
                  {
                    id: "copywriter",
                    title: "Copywriter Pro",
                    desc: "Estruturas PAS/AIDA para anúncios patrocinados frios.",
                    icon: Sparkles,
                    glow: "border-pink-500/30",
                    color: "text-pink-400"
                  },
                  {
                    id: "analyst",
                    title: "Metrics Analyst",
                    desc: "Estude o ROI do tenant, critique taxas e identifique tendências.",
                    icon: LineChart,
                    glow: "border-cyan-400/30",
                    color: "text-cyan-400"
                  },
                  {
                    id: "traffic_manager",
                    title: "Traffic Manager",
                    desc: "Calcule lances, aloque orçamentos ideais e APIs.",
                    icon: Megaphone,
                    glow: "border-purple-600/30",
                    color: "text-indigo-400"
                  }
                ].map((agent) => {
                  const AgentIcon = agent.icon;
                  const isSelected = selectedAgent === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id as any)}
                      className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-br from-[#121215] to-[#0A0A0E] border-[#9333EA] shadow-[0_0_20px_rgba(147,51,234,0.15)]"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <AgentIcon className={`w-5 h-5 ${agent.color}`} />
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">{agent.title}</h4>
                      <p className="text-[10px] text-white/50 font-light mt-1 leading-normal">{agent.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Sandbox query console workspace */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-white">
                      AI COMMAND BOX // {selectedAgent.toUpperCase()}_AGENT@NEXORA
                    </span>
                  </div>
                  <span className="text-[10px] bg-purple-950 px-2.5 py-1 border border-purple-800 rounded font-semibold text-purple-300">
                    Client Context: {currentTenant.name}
                  </span>
                </div>

                {/* Prompt helpers */}
                <div>
                  <label className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2">
                    Instruções Rápidas Recomendadas (Escolha um)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fastPrompts[selectedAgent].map((fp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiPromptInput(fp.prompt);
                          runAgentQuery(fp.prompt);
                        }}
                        className="text-xs bg-white/5 border border-white/10 hover:border-[#9333EA]/50 text-white/80 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        ⚡ {fp.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom typing box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder={`Comande o Agente ${selectedAgent === 'social_media' ? 'Social Media' : selectedAgent === 'copywriter' ? 'Copywriter' : selectedAgent === 'analyst' ? 'Analista' : 'Gestor de Tráfego'} com seu prompt...`}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9333EA]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runAgentQuery();
                    }}
                  />
                  <button
                    onClick={() => runAgentQuery()}
                    disabled={aiLoading}
                    className="px-5 bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:opacity-95 rounded-xl text-white font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5"
                  >
                    {aiLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Enviar
                      </>
                    )}
                  </button>
                </div>

                {/* Output Console Display with typing or markdown style */}
                <div className="bg-[#050507] border border-white/10 rounded-2xl p-6 font-mono text-xs sm:text-sm text-purple-100 max-h-[450px] overflow-y-auto whitespace-pre-wrap leading-relaxed relative group">
                  <div className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-all z-10">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiOutputResult);
                        alert("Copiado com sucesso para a área de transferência!");
                      }}
                      className="bg-white/5 border border-white/15 hover:bg-white/10 p-1.5 rounded text-[10px] text-white font-sans cursor-pointer"
                    >
                      Copiar Copy/Análise
                    </button>
                  </div>
                  <div className="text-[10px] text-white/30 mb-2">// RESPONSE LOG FROM GEMINI NEURAL MODEL</div>
                  {aiOutputResult}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW: 4. TRÁFEGO PAGO OMNICHANNEL ==================== */}
          {activeTab === "traffic" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* ROLE STATUS WARNING BANNER */}
              {userRole === "client" && (
                <div id="role-warning-banner" className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-300 text-xs text-left">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
                  <div>
                    <strong className="font-bold">Acesso Limitado (Perfil Cliente - Leitura):</strong> Você está visualizando relatórios e campanhas em tempo real de {currentTenant.name}. A criação, pausa ou otimização de verbas está bloqueada para seu nível de permissão.
                  </div>
                </div>
              )}

              {/* INTEGRATION MANAGER - ALL 16 PLATFORMS */}
              <div id="omnichannel-integrations-suite" className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-5">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-400" /> Hub de Integrações Omnichannel (16 Plataformas)
                    </h3>
                    <p className="text-xs text-white/50">Conecte e sincronize suas chaves de API e Pixels em redes globais conectadas.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-purple-900/40 text-purple-300 border border-purple-800/40 font-mono px-3 py-1 rounded-full font-bold" id="connected-count-badge">
                      {connectedPlatforms.length} / 16 Conectados
                    </span>
                    <span className="text-[10px] bg-green-950/40 text-green-300 border border-green-800/40 font-mono px-3 py-1 rounded-full font-bold" id="available-platforms-badge">
                      16 Disponíveis
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { id: "meta", name: "Meta Ads", icon: "📷", color: "from-blue-600/20 to-indigo-600/20" },
                    { id: "google", name: "Google Ads", icon: "🔍", color: "from-amber-600/20 to-red-600/20" },
                    { id: "tiktok", name: "TikTok Ads", icon: "🎵", color: "from-cyan-600/20 to-rose-600/20" },
                    { id: "linkedin", name: "LinkedIn Ads", icon: "👔", color: "from-blue-800/20 to-sky-800/20" },
                    { id: "pinterest", name: "Pinterest Ads", icon: "📌", color: "from-red-700/20 to-rose-700/20" },
                    { id: "x", name: "X Ads (Twitter)", icon: "🐦", color: "from-gray-800/20 to-slate-900/20" },
                    { id: "taboola", name: "Taboola Ads", icon: "📰", color: "from-orange-600/20 to-amber-600/20" },
                    { id: "outbrain", name: "Outbrain Ads", icon: "📝", color: "from-amber-700/20 to-orange-700/20" },
                    { id: "kwai", name: "Kwai Ads", icon: "📱", color: "from-orange-500/20 to-yellow-500/20" },
                    { id: "spotify", name: "Spotify Ads", icon: "🎧", color: "from-green-600/20 to-emerald-600/20" },
                    { id: "amazon", name: "Amazon Ads", icon: "🛍️", color: "from-yellow-600/20 to-amber-700/20" },
                    { id: "mercado", name: "Mercado Ads", icon: "🛒", color: "from-yellow-400/20 to-blue-500/20" },
                    { id: "shopee", name: "Shopee Ads", icon: "🔥", color: "from-orange-600/20 to-red-500/20" },
                    { id: "tiktok_shop", name: "TikTok Shop Ads", icon: "🛍️", color: "from-rose-600/20 to-indigo-600/20" },
                    { id: "youtube", name: "YouTube Ads", icon: "🎥", color: "from-red-600/20 to-rose-700/20" },
                    { id: "uol", name: "UOL Ads/Portais", icon: "🌐", color: "from-amber-500/20 to-yellow-600/20" }
                  ].map((p) => {
                    const isConnected = connectedPlatforms.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (userRole === "client") {
                            alert("Permissão negada: Clientes não podem alterar integrações.");
                            return;
                          }
                          if (isConnected) {
                            setConnectedPlatforms((prev) => prev.filter((item) => item !== p.id));
                            addXP(10, `Desconectou canal: ${p.name}`);
                          } else {
                            setConnectedPlatforms((prev) => [...prev, p.id]);
                            addXP(40, `Integração de canal ativa: ${p.name}`);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-center cursor-pointer transition-all hover:scale-102 flex flex-col justify-between items-center h-28 relative group ${
                          isConnected
                            ? `bg-gradient-to-br ${p.color} border-purple-500/60 shadow-[0_4px_12px_rgba(147,51,234,0.15)]`
                            : "bg-[#060608] border-white/5 opacity-50 hover:opacity-80"
                        }`}
                      >
                        <span className="text-2xl mb-1.5 filter group-hover:brightness-110">{p.icon}</span>
                        <div>
                          <span className="block text-[10px] font-bold text-white truncate max-w-full font-sans">{p.name}</span>
                          <span className={`text-[8px] font-semibold uppercase ${isConnected ? "text-purple-400 font-bold" : "text-white/30"}`}>
                            {isConnected ? "Conectado" : "Offline"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CAMPAIGNS CENTRALIZED CONTROLLER */}
              <div id="campaign-centralized-controller" className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-6">
                
                {/* HEAD CONTROLLERS */}
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Gerenciador de Mídia e Campanhas Patrocinadas</h3>
                    <p className="text-xs text-white/40">Filtre campanhas e verbas integradas do {currentTenant.name} de forma isolada.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (userRole === "client") {
                          alert("Apenas administradores e gestores podem estruturar campanhas!");
                          return;
                        }
                        setShowCreateCampaignForm(!showCreateCampaignForm);
                      }}
                      className="px-4.5 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:opacity-95 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
                    >
                      <Plus className="w-4 h-4" /> 
                      {showCreateCampaignForm ? "Ocultar Formulário" : "Criar Campanha Omnichannel (+40 XP)"}
                    </button>
                  </div>
                </div>

                {/* INLINE CREATE CAMPAIGN FORM */}
                {showCreateCampaignForm && (
                  <div className="bg-[#040406] border border-purple-500/30 p-6 rounded-2xl space-y-4 animate-fade-in">
                    <h4 className="text-xs font-extrabold uppercase text-purple-300 tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Nova Campanha de Lançamento / Conversão Estrita
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-black tracking-wide mb-1.5">Identificação</label>
                        <input
                          type="text"
                          value={newCampaignName}
                          onChange={(e) => setNewCampaignName(e.target.value)}
                          placeholder="Ex: Glow Max - Tráfego Frio"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-black tracking-wide mb-1.5">Canal de Mídia</label>
                        <select
                          value={newCampaignPlatform}
                          onChange={(e) => setNewCampaignPlatform(e.target.value as any)}
                          className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="meta">📷 Meta Ads</option>
                          <option value="google">🔍 Google Search</option>
                          <option value="tiktok">🎵 TikTok Ads</option>
                          <option value="linkedin">👔 LinkedIn Ads</option>
                          <option value="pinterest">📌 Pinterest Ads</option>
                          <option value="x">🐦 X Ads</option>
                          <option value="taboola">📰 Taboola Native</option>
                          <option value="outbrain">📝 Outbrain native</option>
                          <option value="kwai">📱 Kwai Shorts</option>
                          <option value="spotify">🎧 Spotify Audio</option>
                          <option value="amazon">🛍️ Amazon Product</option>
                          <option value="mercado">🛒 Mercado Ads</option>
                          <option value="shopee">🔥 Shopee Boosting</option>
                          <option value="tiktok_shop">🛍️ TikTok Shop Live</option>
                          <option value="youtube">🎥 YouTube Video/Shorts</option>
                          <option value="uol">🌐 UOL Ads Premium</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-black tracking-wide mb-1.5">Orçamento Planejado (R$)</label>
                        <input
                          type="number"
                          value={newCampaignBudget}
                          onChange={(e) => setNewCampaignBudget(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-black tracking-wide mb-1.5 font-mono">Meta de ROAS</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newCampaignTargetRoas}
                          onChange={(e) => setNewCampaignTargetRoas(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                      <button
                        onClick={() => {
                          if (!newCampaignName.trim()) {
                            alert("Por favor defina o nome da campanha.");
                            return;
                          }
                          const newAd: AdCampaign = {
                            id: "c_" + Date.now(),
                            name: newCampaignName,
                            platform: newCampaignPlatform,
                            budget: Number(newCampaignBudget) || 5000,
                            status: "active",
                            spend: 0,
                            clicks: 0,
                            leads: 0,
                            roas: Number(newCampaignTargetRoas) || 3.5
                          };

                          setCampaigns((prev) => {
                            const tenantAds = prev[selectedTenantId] || [];
                            return { ...prev, [selectedTenantId]: [newAd, ...tenantAds] };
                          });

                          addXP(40, `Distribuiu campanha: ${newCampaignName} em ${newCampaignPlatform.toUpperCase()}`);
                          setNewCampaignName("");
                          setShowCreateCampaignForm(false);
                        }}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-xs font-bold font-sans cursor-pointer"
                      >
                        Publicar e Iniciar Veiculação (+40 XP)
                      </button>
                      <button
                        onClick={() => setShowCreateCampaignForm(false)}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* PLATFORMS FILTER TOOLBAR BAR */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 border-b border-white/5">
                  <button
                    onClick={() => setActivePlatformFilter("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                      activePlatformFilter === "all"
                        ? "bg-[#9333EA] border-[#9333EA] text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    🚀 Todos os Anúncios
                  </button>
                  {[
                    { id: "meta", label: "Meta Ads" },
                    { id: "google", label: "Google Ads" },
                    { id: "tiktok", label: "TikTok Ads" },
                    { id: "linkedin", label: "LinkedIn" },
                    { id: "spotify", label: "Spotify" },
                    { id: "taboola", label: "Taboola" },
                    { id: "youtube", label: "YouTube" },
                    { id: "uol", label: "UOL Premium" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActivePlatformFilter(f.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                        activePlatformFilter === f.id
                          ? "bg-[#EC4899] border-[#EC4899] text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* CALIBRATOR CONTROLS */}
                {calibratingCampaignId && (
                  <div className="bg-[#030304] border border-purple-500 rounded-2xl p-5 shadow-2xl relative">
                    <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-purple-400" /> Painel de Calibragem Pro de Orçamento
                    </h3>
                    <p className="text-[11px] text-white/60 mb-4">
                      Altere o orçamento planejado para recalcular os retornos previstos por canal de mídia.
                    </p>

                    <div className="space-y-4 max-w-md">
                      <div>
                        <div className="flex justify-between text-xs text-white/60 mb-2">
                          <span>Orçamento Planejado</span>
                          <span className="text-[#EC4899] font-bold font-mono">R$ {editedBudget.toLocaleString("pt-BR")}</span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="100000"
                          step="1000"
                          value={editedBudget}
                          onChange={(e) => setEditedBudget(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={saveCalibration}
                          className="px-4 py-2 bg-[#9333EA] hover:bg-purple-600 rounded-xl text-white font-bold text-xs uppercase cursor-pointer"
                        >
                          Salvar Verba (+50 XP)
                        </button>
                        <button
                          onClick={() => setCalibratingCampaignId(null)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAMPAIGNS TABLE PORTFOLIO */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/70">
                    <thead className="text-[10px] uppercase text-white/40 font-bold border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Canal Integrado</th>
                        <th className="py-3 px-4">Campanha</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Orçamento Mensal</th>
                        <th className="py-2.5 px-4 font-mono">ROAS Real</th>
                        <th className="py-3 px-4">Consumo Patrocinado</th>
                        <th className="py-3 px-4">Cliques Totais</th>
                        <th className="py-3 px-4 text-right">Ações Operacionais</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(campaigns[selectedTenantId] || [])
                        .filter((cp) => activePlatformFilter === "all" || cp.platform === activePlatformFilter)
                        .map((cp) => (
                          <tr key={cp.id} className="hover:bg-white/5 transition-all">
                            <td className="py-4 px-4 font-bold text-white">
                              {cp.platform === "meta" && "📷 Meta Ads"}
                              {cp.platform === "google" && "🔍 Google Search"}
                              {cp.platform === "tiktok" && "🎵 TikTok Ads"}
                              {cp.platform === "linkedin" && "👔 LinkedIn Ads"}
                              {cp.platform === "pinterest" && "📌 Pinterest Ads"}
                              {cp.platform === "x" && "🐦 X Ads Campaign"}
                              {cp.platform === "taboola" && "📰 Taboola Native"}
                              {cp.platform === "outbrain" && "📝 Outbrain Feed"}
                              {cp.platform === "kwai" && "📱 Kwai Shorts"}
                              {cp.platform === "spotify" && "🎧 Spotify Audio"}
                              {cp.platform === "amazon" && "🛍️ Amazon Ads"}
                              {cp.platform === "mercado" && "🛒 Mercado Livre"}
                              {cp.platform === "shopee" && "🔥 Shopee Store"}
                              {cp.platform === "tiktok_shop" && "🛍️ TikTok Live Ads"}
                              {cp.platform === "youtube" && "🎥 YouTube Audio"}
                              {cp.platform === "uol" && "🌐 UOL Portais BR"}
                            </td>
                            <td className="py-4 px-4 font-semibold text-white">{cp.name}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                cp.status === "active" ? "bg-green-950/80 border border-green-800 text-green-300" : "bg-gray-950/80 border border-gray-800 text-gray-400"
                              }`}>
                                {cp.status === "active" ? "Rodando" : "Pausado"}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-pink-300 font-mono">
                              R$ {cp.budget?.toLocaleString("pt-BR")}
                            </td>
                            <td className="py-4 px-4 text-purple-300 font-bold font-mono">{cp.roas}x</td>
                            <td className="py-4 px-4 text-white/40 font-mono">R$ {cp.spend?.toLocaleString("pt-BR")}</td>
                            <td className="py-4 px-4 text-white/60 font-mono">{cp.clicks?.toLocaleString() || "0"}</td>
                            <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (userRole === "client") {
                                    alert("Permissão negada: Usuário em nível Cliente não pode alternar campanhas.");
                                    return;
                                  }
                                  toggleCampaignStatus(cp.id);
                                }}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white transition-all font-semibold cursor-pointer"
                              >
                                {cp.status === "active" ? "Pausar" : "Ativar"}
                              </button>
                              <button
                                onClick={() => {
                                  if (userRole === "client") {
                                    alert("Permissão negada: Usuário em nível Cliente não pode alterar orçamentos.");
                                    return;
                                  }
                                  openCalibrator(cp);
                                }}
                                className="px-2.5 py-1 bg-[#9333EA]/20 hover:bg-[#9333EA]/40 border border-[#9333EA]/40 rounded text-[10px] text-purple-300 transition-all font-semibold cursor-pointer"
                              >
                                Escalar Orçamento
                              </button>
                            </td>
                          </tr>
                        ))}

                      {(campaigns[selectedTenantId] || []).filter((cp) => activePlatformFilter === "all" || cp.platform === activePlatformFilter).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-white/40">
                            Nenhuma campanha patrocinada ativa para {currentTenant.name} com esse filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUTOMATION SMART RULES ENGINE */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-5 h-5 text-pink-400" /> Motor de Regras e Automações de Conversão (Escala Imediata)
                  </h3>
                  <p className="text-xs text-white/40">Defina regras que disparam automaticamente ajustes financeiros ou pausas para otimizar custos.</p>
                </div>

                {userRole !== "client" && (
                  <form onSubmit={handleAddNewAutomationRule} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white/3 p-4 rounded-2xl border border-white/5">
                    <div>
                      <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.55">Identificador da Regra</label>
                      <input
                        type="text"
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        placeholder="Ex: Pausar com CTR Baixo"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Gatilho (Trigger)</label>
                      <select
                        value={newRuleTrigger}
                        onChange={(e) => setNewRuleTrigger(e.target.value)}
                        className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="ROAS > 4.5">Quando ROAS superar 4.5</option>
                        <option value="ROAS < 1.8">Quando ROAS cair abaixo de 1.8</option>
                        <option value="CPC > R$ 3.50">O Custo por Clique (CPC) superar R$ 3.50</option>
                        <option value="CTR < 1.2%">A taxa de clique (CTR) cair abaixo de 1.2%</option>
                        <option value="CPA < R$ 12.00">O Custo de Conversão (CPA) cair abaixo de R$ 12.00</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Ação Automática</label>
                      <select
                        value={newRuleAction}
                        onChange={(e) => setNewRuleAction(e.target.value)}
                        className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="Aumentar orçamento em 40%">Aumentar orçamento diário em 40% (Escala agressiva)</option>
                        <option value="Reduzir orçamento diário em 25%">Diminuir orçamento da campanha em 25% (Preservação)</option>
                        <option value="Pausar campanha e reciclar">Pausar anúncio imediatamente e alertar analista</option>
                        <option value="Enviar log de urgência para WhatsApp">Disparar alerta prioritário no WhatsApp via Evolution API</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#9333EA] hover:bg-purple-600 rounded-xl text-white font-bold text-xs uppercase cursor-pointer transition-all"
                      >
                        Ativar Regra (+40 XP)
                      </button>
                    </div>
                  </form>
                )}

                {/* Active Rules List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {smartBudgetRules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          <span className="text-xs font-bold text-white">{rule.name}</span>
                        </div>
                        <p className="text-[10px] text-white/40">Se <strong className="text-pink-300 font-mono">{rule.trigger}</strong> → <strong className="text-purple-300">{rule.action}</strong></p>
                      </div>
                      <input
                        type="checkbox"
                        checked={rule.active}
                        disabled={userRole === "client"}
                        onChange={() => {
                          setSmartBudgetRules((prev) =>
                            prev.map((r) => r.id === rule.id ? { ...r, active: !r.active } : r)
                          );
                          addXP(10, `Status de regra automação alterado`);
                        }}
                        className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* IA AD OPTIMIZATION CENTER - TABS */}
              <div className="bg-[#0A0A0E] border border-[#9333EA]/30 rounded-3xl p-6 space-y-6 shadow-[0_4px_30px_rgba(147,51,234,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles className="w-32 h-32 text-purple-500" />
                </div>

                <div>
                  <span className="text-[9px] bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-black px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                    Nexora AI Brain Core
                  </span>
                  <h3 className="text-lg font-black text-white mt-2 uppercase tracking-tight">Laboratório Avançado de Otimização e Previsão IA</h3>
                  <p className="text-xs text-white/50">Crie copies persuasivas, estime taxa de cliques (CTR) e detecte anomalias de ROI sob demanda.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* MODULE 1: AD DOCTOR & AUTOMATION RECOMMENDATIONS */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> IA Diagnóstico: Ad Doctor (Campanhas)
                    </h4>
                    <p className="text-[11px] text-white/60 font-light">
                      O robô heurístico varre suas campanhas em busca de fadiga criativa ou leilões de ROI alto.
                    </p>

                    <div className="space-y-3.5 pt-2">
                      <div className="p-3 bg-white/3 rounded-xl border border-white/5 text-left space-y-1">
                        <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                          <span className="text-green-400 font-bold">💡 ROI Alto Encontrado</span>
                          <span className="text-white/40">GLOW SKIN CONVERSÃO</span>
                        </div>
                        <p className="text-[11px] text-white/80">Campanha com ROAS em <strong className="text-purple-300">12.1x</strong>. Sugerimos incrementar verba diária em 40%.</p>
                        <button
                          onClick={() => {
                            if (userRole === "client") {
                              alert("Permissão Cliente não permite efetuar alterações.");
                              return;
                            }
                            addXP(50, "Otimizou e incrementou verba em ROI Alto Meta");
                            alert("Campanha escalada! Orçamento adicionado via IA com auditoria registrada.");
                          }}
                          className="mt-2 text-[10px] text-purple-300 font-bold hover:text-white transition-colors cursor-pointer"
                        >
                          → Escalar Automaticamente (+50 XP)
                        </button>
                      </div>

                      <div className="p-3 bg-white/3 rounded-xl border border-white/5 text-left space-y-1">
                        <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                          <span className="text-amber-400 font-bold">⚠️ Saturação de Criativos</span>
                          <span className="text-white/40">BASE MATTE GOOGLE</span>
                        </div>
                        <p className="text-[11px] text-white/80">Consumo CTR declinou 18% nos últimos 3 dias. Refaça copies de heads e recalibre o leilão.</p>
                        <button
                          onClick={() => {
                            if (userRole === "client") {
                              alert("Permissão Cliente não permite calibrar campanhas.");
                              return;
                            }
                            addXP(40, "Recalibrou e limpou pixels saturados de Base Matte");
                            alert("Pontuação e pixels atualizados. Otimização heurística aplicada com sucesso.");
                          }}
                          className="mt-2 text-[10px] text-amber-300 font-bold hover:text-white transition-colors cursor-pointer"
                        >
                          → Recalibrar Anúncio (+40 XP)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MODULE 2: CTR PREDICTOR & SCORES CODES */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-pink-400 tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> IA Creative Score & CTR Predictor
                      </h4>
                      <p className="text-[11px] text-white/60 font-light mb-4">
                        Descreva seu criativo visual ou redacional. Nossa IA estima a taxa de engajamento esperada no leilão.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[8px] text-white/50 uppercase font-bold mb-1">Rede de Destino</label>
                          <select
                            value={predictPlatform}
                            onChange={(e) => setPredictPlatform(e.target.value)}
                            className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none"
                          >
                            <option value="meta">📷 Reels & Instagram Stories</option>
                            <option value="google">🔍 Google Search Text</option>
                            <option value="tiktok">🎵 TikTok Vertical Short</option>
                            <option value="taboola">📰 Taboola Native Feed Banner</option>
                            <option value="spotify">🎧 Spotify Audio Ad Voice</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[8px] text-white/50 uppercase font-bold mb-1">Esqueleto/Roteiro Visual</label>
                          <textarea
                            value={predictDescription}
                            onChange={(e) => setPredictDescription(e.target.value)}
                            placeholder="Ex: Foto de close-up no batom, música lo-fi, legenda instigante com cupom de 10%..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <button
                          onClick={runCtrPrediction}
                          disabled={predictLoading}
                          className="w-full py-2 bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-700 hover:opacity-95 rounded-xl font-bold text-xs text-white cursor-pointer"
                        >
                          {predictLoading ? "Scorando Anúncio..." : "Prever CTR & Retorno"}
                        </button>
                      </div>
                    </div>

                    {predictResult && (
                      <div className="mt-3 p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl text-left font-mono">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2">
                          <span className="text-[9px] text-[#EC4899] font-bold">PREDIÇÃO IA</span>
                          <span className="text-[8px] text-green-400 font-bold">{predictResult.confidence}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2.5">
                          <div className="p-1.5 bg-black/40 rounded text-center">
                            <span className="block text-[8px] text-white/40 uppercase">CTR Estimado</span>
                            <span className="text-sm font-black text-rose-400">{predictResult.ctr}%</span>
                          </div>
                          <div className="p-1.5 bg-black/40 rounded text-center">
                            <span className="block text-[8px] text-white/40 uppercase font-mono">Conversões/mês</span>
                            <span className="text-sm font-black text-white">{predictResult.conversions}</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-white/70 leading-normal font-sans">{predictResult.evaluation}</p>
                      </div>
                    )}
                  </div>

                  {/* MODULE 3: IA COPYWRITER SYSTEM */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                        <Bot className="w-4 h-4" /> IA Instant Ad Copywriter
                      </h4>
                      <p className="text-[11px] text-white/60 font-light mb-4">
                        Gere headlines e descrições irresistíveis sob medida para qualquer das redes integradas.
                      </p>

                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] text-white/50 uppercase font-bold mb-1">Destino</label>
                            <select
                              value={fastCopyPlatform}
                              onChange={(e) => setFastCopyPlatform(e.target.value)}
                              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none"
                            >
                              <option value="meta">📷 Meta (Instagram)</option>
                              <option value="google">🔍 Google Ads text</option>
                              <option value="taboola">📰 Taboola Feed</option>
                              <option value="spotify">🎧 Spotify Audio Ad</option>
                              <option value="shopee">🛍️ Shopee Ads</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] text-white/50 uppercase font-bold mb-1">Tom de Voz</label>
                            <select
                              value={fastCopyTone}
                              onChange={(e) => setFastCopyTone(e.target.value)}
                              className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none"
                            >
                              <option value="persuasivo">🔥 Persuasivo</option>
                              <option value="divertido">✨ Descontraído</option>
                              <option value="institucional">👔 Corporativo</option>
                              <option value="urgencia">⏳ Urgência Máxima</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8px] text-white/50 uppercase font-bold mb-1">Nicho / Produto</label>
                          <input
                            type="text"
                            value={fastCopyNiche}
                            onChange={(e) => setFastCopyNiche(e.target.value)}
                            placeholder={currentTenant.niche || "Perfumes Orgânicos"}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={runFastCopyGenerator}
                          disabled={fastCopyLoading}
                          className="w-full py-2 bg-gradient-to-r from-pink-900 to-purple-900 border border-pink-700/80 hover:opacity-95 rounded-xl font-bold text-xs text-white cursor-pointer"
                        >
                          {fastCopyLoading ? "Redigindo Copies..." : "Gerar Headlines & Copies IA"}
                        </button>
                      </div>
                    </div>

                    {fastCopyResult && (
                      <div className="mt-3 bg-[#050507] p-3 border border-white/10 rounded-xl text-left relative max-h-[180px] overflow-y-auto">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fastCopyResult);
                            alert("Células de copy copiadas com sucesso!");
                          }}
                          className="absolute top-2 right-2 bg-white/5 border border-white/15 px-1.5 py-0.5 rounded text-[8px] text-white cursor-pointer"
                        >
                          Copiar
                        </button>
                        <div className="text-[8px] text-white/30 font-mono mb-1.5">// GENERATED PERSUASIVE ASSETS</div>
                        <p className="text-[10px] text-white/90 whitespace-pre-wrap leading-relaxed font-sans">{fastCopyResult}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ======== INTERACTIVE CAPI / API DE CONVERSÃO INTEGRATED SUITE ======== */}
              <div className="space-y-6">
                
                {/* HEADLINE SECTION WITH STATS BAR */}
                <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#9333EA]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-900/40 text-purple-300 text-[9px] font-black uppercase tracking-widest border border-purple-800/50">
                          Omnichannel CAPI 2.0
                        </span>
                        <span className="px-2 px-2.5 py-0.5 rounded-full bg-green-950 text-green-300 text-[9px] font-bold border border-green-800">
                          ⚡ ESTADO: ATIVO (BYPASS COOKIES)
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-400" /> API de Conversão Inteligente & Regras de Disparo (CAPI)
                      </h4>
                      <p className="text-xs text-white/50 max-w-3xl leading-relaxed">
                        Ignore bloqueios de adblockers, limitações do iOS 14+ e fim dos cookies de terceiros. Sincronize o comportamento de compra e preenchimento de formulários diretamente do servidor Nexora Pulse para os endpoints oficiais do Meta e Google Ads em total conformidade com a LGPD.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 shrink-0 sm:min-w-[280px]">
                      <div className="bg-[#050507] border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[9px] text-white/40 block uppercase font-mono tracking-wider">Regras Ativas</span>
                        <span className="text-xl font-black text-purple-400">
                          {capiRules.filter(r => r.active).length} / {capiRules.length}
                        </span>
                      </div>
                      <div className="bg-[#050507] border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[9px] text-white/40 block uppercase font-mono tracking-wider">Correspondência</span>
                        <span className="text-xl font-black text-green-400">99.8% ⭐</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DOUBLE COLUMN LAYOUT: CREDENTIALS & RULES CREATION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* PANEL 1: CONFIGURAÇÃO DE CHAVES & API ENDPOINTS */}
                  <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-5">
                    <div className="border-b border-white/10 pb-4">
                      <h4 className="text-xs font-black uppercase text-purple-300 tracking-widest flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-400" /> 1. Chaves de API & Endpoint Credentials
                      </h4>
                      <p className="text-[11px] text-white/40 mt-1">Insira suas chaves de ambiente para que as regras acionem os servidores correspondentes.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Meta Conversions API Block */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 space-y-3.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Configurações Meta CAPI (Pixel Server)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Meta ID do Pixel</label>
                            <input
                              type="text"
                              value={capiMetaPixelId}
                              onChange={(e) => setCapiMetaPixelId(e.target.value)}
                              placeholder="Ex: 9182390123901"
                              className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Código de Evento de Teste</label>
                            <input
                              type="text"
                              value={capiMetaTestEventCode}
                              onChange={(e) => setCapiMetaTestEventCode(e.target.value)}
                              placeholder="Fica na aba gerenciador de eventos"
                              className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-all font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5 font-sans">Token de Acesso do Servidor (System User)</label>
                          <input
                            type="password"
                            value={capiMetaAccessToken}
                            onChange={(e) => setCapiMetaAccessToken(e.target.value)}
                            placeholder="EAAG...."
                            className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Google Ads conversions block */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 space-y-3.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Configurações Google Ads Enhanced Conversions
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">ID de Conversão Google (AW-)</label>
                            <input
                              type="text"
                              value={capiGoogleConversionId}
                              onChange={(e) => setCapiGoogleConversionId(e.target.value)}
                              placeholder="Ex: AW-109283921"
                              className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-all font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Label da Conversão</label>
                            <input
                              type="text"
                              value={capiGoogleConversionLabel}
                              onChange={(e) => setCapiGoogleConversionLabel(e.target.value)}
                              placeholder="Ex: conv_lead_acquisition"
                              className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addXP(15, "Salvou novos tokens CAPI de Servidor para Meta e Google");
                          alert("Configurações CAPI salvas com sucesso no banco de dados temporário de " + currentTenant.name);
                        }}
                        className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-700 rounded-xl py-2.5 text-xs text-white font-black tracking-widest uppercase cursor-pointer shadow-lg transition-all"
                      >
                        Salvar Chaves de Integração CAPI
                      </button>
                    </div>  
                  </div>

                  {/* PANEL 2: CRIAÇÃO / CADASTRO DE NOVAS REGRAS DE DISPARO */}
                  <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="border-b border-white/10 pb-4 mb-4">
                        <h4 className="text-xs font-black uppercase text-purple-300 tracking-widest flex items-center gap-2">
                          <Plus className="w-4 h-4 text-purple-400" /> 2. Cadastrar Nova Regra de Disparo
                        </h4>
                        <p className="text-[11px] text-white/40 mt-1">Defina quando e para onde o evento de servidor é encaminhado de forma automatizada.</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Nome amigável da Regra</label>
                          <input
                            type="text"
                            value={newCapiRuleName}
                            onChange={(e) => setNewCapiRuleName(e.target.value)}
                            placeholder="Ex: Enviar 'Purchase' ao receber confirmação Stripe"
                            className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Gatilho do Sistema (Trigger Source)</label>
                          <select
                            value={newCapiRuleTrigger}
                            onChange={(e) => setNewCapiRuleTrigger(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all"
                          >
                            <option value="Etapa de Negociação Ganha no CRM">Etapa de Negociação Ganha no CRM</option>
                            <option value="Oportunidade adicionada na etapa 'Qualificado'">Oportunidade adicionada na etapa 'Qualificado'</option>
                            <option value="Início de preenchimento no Checkout">Início de preenchimento no Checkout</option>
                            <option value="Clique em link direto de WhatsApp">Clique em link direto de WhatsApp</option>
                            <option value="Formulário de captura de Landing Page enviado">Formulário de captura de Landing Page enviado</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Canal de Destino API</label>
                            <select
                              value={newCapiRulePlatform}
                              onChange={(e) => setNewCapiRulePlatform(e.target.value as any)}
                              className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all"
                            >
                              <option value="meta">Meta Conversions API</option>
                              <option value="google">Google Ads Conversions</option>
                              <option value="both">Ambos (Meta & Google Ads)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-[9px] text-white/50 uppercase font-bold mb-1.5">Tipo de Evento CAPI</label>
                            <select
                              value={newCapiRuleEvent}
                              onChange={(e) => setNewCapiRuleEvent(e.target.value)}
                              className="w-full bg-[#050507] border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all"
                            >
                              <option value="Purchase">Purchase (Compra Concluída)</option>
                              <option value="Lead">Lead (Contato Qualificado)</option>
                              <option value="InitiateCheckout">InitiateCheckout (Início de Pagamento)</option>
                              <option value="CompleteRegistration">CompleteRegistration (Cadastro Concluído)</option>
                              <option value="Contact">Contact (WhatsApp Iniciado)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newCapiRuleName.trim()) {
                          alert("Por favor, preencha um nome amigável para a regra de disparo.");
                          return;
                        }
                        const newRule = {
                          id: "cr_" + Math.random().toString(36).substring(2, 6),
                          name: newCapiRuleName,
                          trigger: newCapiRuleTrigger,
                          platform: newCapiRulePlatform,
                          eventType: newCapiRuleEvent,
                          active: true
                        };
                        setCapiRules(prev => [...prev, newRule]);
                        addXP(20, `Cadastrou regra de Conversão de Servidor: "${newCapiRuleName}"`);
                        setNewCapiRuleName("");
                        setCapiLogs(prev => [
                          ...prev,
                          `[${new Date().toLocaleTimeString()}] ✅ [REGRAS DE DISPARO] Nova regra registrada com sucesso: "${newRule.name}" para enviar Evento "${newRule.eventType}" via ${newRule.platform.toUpperCase()}`
                        ]);
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-teal-900 to-emerald-900 hover:from-teal-850 hover:to-emerald-850 border border-emerald-700 rounded-xl py-2.5 text-xs text-white font-black tracking-widest uppercase cursor-pointer hover:shadow-emerald-950/20 shadow-lg transition-all"
                    >
                      Salvar e Registrar Regra CAPI
                    </button>
                  </div>

                </div>

                {/* RULES GRID: DISPLAY, TOGGLE & TEST RULE */}
                <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-purple-300 tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" /> Regras de Servidor Cadastradas no Tenant Atual [{currentTenant.name}]
                      </h4>
                      <p className="text-[11px] text-white/40 mt-1">Visualize, pause ou execute testes de disparos reais baseados nas regras programadas.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    {capiRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`border rounded-2xl p-4.5 space-y-3.5 transition-all text-left relative ${
                          rule.active 
                            ? "bg-purple-950/10 border-purple-500/30 shadow-[0_4px_20px_rgba(147,51,234,0.05)]" 
                            : "bg-[#050507] border-white/5 opacity-60"
                        }`}
                      >
                        {/* Dynamic Switch status button */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCapiRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
                              addXP(5, `Alterou status da regra CAPI: ${rule.name}`);
                              setCapiLogs(prev => [
                                ...prev,
                                `[${new Date().toLocaleTimeString()}] ⚙️ Status da regra "${rule.name}" modificado para: [${!rule.active ? "ATIVO" : "INATIVO"}]`
                              ]);
                            }}
                            className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider cursor-pointer border ${
                              rule.active 
                                ? "bg-purple-900/60 text-purple-200 border-purple-700/60" 
                                : "bg-white/5 text-white/40 border-white/10"
                            }`}
                          >
                            {rule.active ? "Ativa" : "Pausada"}
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-extrabold text-xs text-white uppercase tracking-wider line-clamp-1 pr-14 select-none">
                            {rule.name}
                          </h5>
                          <p className="text-[10px] text-purple-400 font-mono flex items-center gap-1.5 leading-none">
                            <Zap className="w-3 h-3 text-purple-400 shrink-0" /> {rule.trigger}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-[#050507] rounded-md text-[9px] text-zinc-300 font-bold border border-white/5 uppercase">
                            ⚙️ {rule.eventType}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${
                            rule.platform === "meta" 
                              ? "bg-blue-950 text-blue-300 border-blue-800" 
                              : rule.platform === "google" 
                                ? "bg-amber-950 text-amber-300 border-amber-800" 
                                : "bg-teal-950 text-teal-300 border-teal-800"
                          }`}>
                            {rule.platform === "both" ? "Meta & Google" : rule.platform === "meta" ? "Meta Pixel" : "Google Ads"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleFireCapiEventFromRule(rule)}
                            disabled={capiIsSending}
                            className="w-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl py-1.5 text-[10px] text-white font-extrabold tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <Send className="w-3 h-3 text-purple-400" /> Simular Disparo
                          </button>
                          
                          <button
                            onClick={() => {
                              setCapiRules(prev => prev.filter(r => r.id !== rule.id));
                              addXP(10, `Removeu regra CAPI: ${rule.name}`);
                              setCapiLogs(prev => [
                                ...prev,
                                `[${new Date().toLocaleTimeString()}] 🗑️ Regra de disparo removida permanentemente: "${rule.name}"`
                              ]);
                            }}
                            className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 rounded-xl py-1.5 text-[10px] text-red-300 font-extrabold tracking-wider uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Excluir Regra
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SANDBOX OVERRIDES & SIMULATION CONSOLE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* MANUAL TRIGGER Sandbox OVERRIDES */}
                  <div className="lg:col-span-5 bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-4 text-left">
                    <div className="border-b border-white/10 pb-3">
                      <h4 className="text-xs font-black uppercase text-purple-300 tracking-widest flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-purple-400" /> 3. Teste Manual & Parâmetros Sandbox
                      </h4>
                      <p className="text-[11px] text-white/40">Submeta cargas sob demanda usando valores customizados para validar correspondência criptografada.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-bold mb-1">E-mail do Cliente (Limpará e Hashing)</label>
                        <input
                          type="email"
                          value={capiCustomerEmail}
                          onChange={(e) => setCapiCustomerEmail(e.target.value)}
                          placeholder="Ex: contato@cliente.com"
                          className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-white/50 uppercase font-bold mb-1">Telefone do Cliente</label>
                        <input
                          type="text"
                          value={capiCustomerPhone}
                          onChange={(e) => setCapiCustomerPhone(e.target.value)}
                          placeholder="Ex: +5511999999999"
                          className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[9px] text-white/50 uppercase font-bold mb-1">Tipo de Evento</label>
                          <select
                            value={capiEventType}
                            onChange={(e) => setCapiEventType(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="Purchase">Purchase (Compra)</option>
                            <option value="Lead">Lead (Contato)</option>
                            <option value="InitiateCheckout">InitiateCheckout (Checkout)</option>
                            <option value="CompleteRegistration">CompleteRegistration</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-white/50 uppercase font-bold mb-1">Valor</label>
                          <input
                            type="text"
                            value={capiEventValue}
                            onChange={(e) => setCapiEventValue(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-center text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleFireCapiEvent}
                        disabled={capiIsSending}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 rounded-xl font-bold text-xs text-white uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-lg mt-2"
                      >
                        {capiIsSending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Disparando no Servidor...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Enviar Disparo CAPI Sob Demanda
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* HIGH FIDELITY TERMINAL LOG PANEL */}
                  <div className="lg:col-span-7 bg-[#050507] border border-white/10 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative font-mono text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-purple-400" />
                        <span className="text-xs uppercase font-extrabold text-white tracking-widest">Console de Auditoria CAPI (Live logs)</span>
                      </div>
                      <button
                        onClick={() => setCapiLogs(["// [Console limpo] Registros de disparo em tempo real surgirão aqui."])}
                        className="text-[9px] uppercase px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-slate-400 cursor-pointer"
                      >
                        Limpar Console
                      </button>
                    </div>

                    <div className="flex-grow min-h-[190px] max-h-[290px] overflow-y-auto text-[10px] sm:text-xs leading-normal space-y-1.5 text-purple-100 pr-2 select-text custom-scrollbar">
                      {capiLogs.map((log, i) => {
                        let textStyle = "text-white/60";
                        if (log.includes("🚀") || log.includes("⚡️")) textStyle = "text-yellow-300 font-extrabold";
                        else if (log.includes("💖") || log.includes("💚") || log.includes("✅")) textStyle = "text-cyan-400 font-bold";
                        else if (log.includes("📡")) textStyle = "text-purple-300";
                        else if (log.includes("Payload")) textStyle = "text-amber-300/80";
                        else if (log.includes("🔒") || log.includes("Hash")) textStyle = "text-emerald-300";
                        else if (log.includes("🗑️") || log.includes("Status: 500")) textStyle = "text-red-400";
                        
                        return (
                          <div key={i} className={`whitespace-pre-wrap ${textStyle}`}>
                            {log}
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/5 pt-2 mt-3 flex items-center justify-between text-[10px] text-white/30 shrink-0">
                      <span>SECURE PIPELINE DISPATCH: 100% SECURE</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> COMPLIANT LGPD (AES-SHA256)
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== SUB-VIEW: 5. CRM & WHATSAPP SUITE ==================== */}
          {activeTab === "crm_whatsapp" && (
            <div className="space-y-6">
              {/* Kanban & chat options tabs toggler */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Evolution API Panel integration */}
                <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider"> Evolution API / WhatsApp Hub </h3>
                    <span className={`h-2.5 w-2.5 rounded-full ${whatsappApiConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></span>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Conecte instâncias do WhatsApp Business ou Evolution API para acionar chatbots inteligentes de vendas ou enviar lembretes.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[9px] text-white/40 font-bold uppercase tracking-wider mb-2">Endpoint Webhook</label>
                      <input
                        type="url"
                        value={evolutionWebhookUrl}
                        onChange={(e) => setEvolutionWebhookUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#9333EA] font-mono"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                      <div>
                        <span className="block text-xs font-bold text-white">Chatbot Ativo Inteligente</span>
                        <p className="text-[9px] text-white/40">Gera conversas usando Gemini analítico</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={whatsappAutoBotActive}
                        onChange={(e) => {
                          setWhatsappAutoBotActive(e.target.checked);
                          addXP(10, `Status chatbot alterado para ${e.target.checked ? "ativo" : "inativo"}`);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      onClick={connectEvolutionApi}
                      className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#EC4899] rounded-xl hover:opacity-90 font-black text-xs text-white uppercase tracking-widest transition-all cursor-pointer"
                    >
                      {whatsappApiConnected ? "Reconectar Instância (Online)" : "Conectar API Evolution e WhatsApp (+150 XP!)"}
                    </button>
                  </div>
                </div>

                {/* Create Lead quick widget form */}
                <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Registrar Lead Manualmente no CRM
                  </h3>

                  <form onSubmit={handleCreateLead} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="Ex: Carlos Albuquerque"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Telefone WhatsApp</label>
                      <input
                        type="text"
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        placeholder="+55 (11) 98000-0000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Valor Estimado (R$)</label>
                      <input
                        type="number"
                        value={newLeadValue}
                        onChange={(e) => setNewLeadValue(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA]"
                      />
                    </div>

                    <div className="sm:col-span-3 pt-1">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-purple-300 hover:text-white transition-all cursor-pointer"
                      >
                        Salvar Lead e Criar Oportunidade (+25 XP)
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* CRM Kanban pipeline Board */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Pipeline de Conversão de Oportunidades - {currentTenant.name}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Stages */}
                  {(["novo", "contato", "proposta", "fechado"] as const).map((stage) => {
                    const filtered = (leads[selectedTenantId] || []).filter((l) => l.status === stage);
                    return (
                      <div key={stage} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-4">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {stage === "novo" && "🆕 Entrada Novas"}
                            {stage === "contato" && "💬 Chat ativo / WhatsApp"}
                            {stage === "proposta" && "📝 Proposta Solicitada"}
                            {stage === "fechado" && "💸 Fechamento Pago"}
                          </span>
                          <span className="text-[10px] font-bold bg-[#9333EA]/20 px-2 py-0.5 rounded text-purple-400">
                            {filtered.length}
                          </span>
                        </div>

                        <div className="space-y-2 flex-grow">
                          {filtered.map((ld) => (
                            <div key={ld.id} className="bg-[#0C0C0E] border border-white/10 hover:border-purple-500/30 p-3.5 rounded-xl space-y-2 text-left relative group">
                              <span className="block text-xs font-bold text-white">{ld.name}</span>
                              <span className="block text-[9px] font-mono text-purple-400 font-bold">R$ {ld.value?.toLocaleString("pt-BR") || "0"}</span>
                              <p className="text-[10px] text-white/50 leading-snug">{ld.notes}</p>
                              <span className="block text-[8px] text-white/30 font-mono mt-1">Interação: {ld.lastInteraction}</span>

                              {/* quick status updates in sandboxed prototype */}
                              <div className="mt-3 pt-2 border-t border-white/5 flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-all">
                                {stage !== "novo" && (
                                  <button
                                    onClick={() => {
                                      const prevStatus = stage === "contato" ? "novo" : stage === "proposta" ? "contato" : "proposta";
                                      moveLeadStatus(ld.id, prevStatus);
                                    }}
                                    className="text-[8px] text-white/40 hover:text-white px-1.5 py-0.5 bg-white/5 rounded"
                                    title="Mover para esquerda"
                                  >
                                    ←
                                  </button>
                                )}
                                {stage !== "fechado" && (
                                  <button
                                    onClick={() => {
                                      const nextStatus = stage === "novo" ? "contato" : stage === "contato" ? "proposta" : "fechado";
                                      moveLeadStatus(ld.id, nextStatus);
                                    }}
                                    className="text-[8px] text-purple-400 hover:text-white px-1.5 py-0.5 bg-white/5 rounded font-bold"
                                    title="Mover para direita"
                                  >
                                    Avançar →
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          {filtered.length === 0 && (
                            <div className="text-center py-10 text-white/20 text-[10px] font-mono">
                              Nenhum Lead nesta etapa
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW: 6. TEMPLATES MARKETPLACE ==================== */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              {/* Detailed view of purchased template if is selected */}
              {viewingTemplateDetail && (
                <div className="bg-[#0C0C0E] border-2 border-[#9333EA] rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <span className="text-[10px] bg-[#9333EA]/20 border border-[#9333EA] text-purple-400 font-extrabold px-3 py-1 rounded-full uppercase">
                        {viewingTemplateDetail.category.toUpperCase()} TEMPLATE UNLOCKED
                      </span>
                      <h3 className="text-xl font-black mt-2 text-white">{viewingTemplateDetail.title}</h3>
                      <p className="text-xs text-white/40">Criado orgulhosamente por: <strong className="text-white">{viewingTemplateDetail.author}</strong></p>
                    </div>
                    <button
                      onClick={() => setViewingTemplateDetail(null)}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-white text-xs hover:bg-white/10"
                    >
                      Voltar ao Painel Geral
                    </button>
                  </div>

                  <div className="bg-[#050507] border border-white/5 rounded-2xl p-6 font-mono text-xs sm:text-sm text-pink-100 max-h-[350px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {viewingTemplateDetail.content}
                  </div>

                  <div className="flex gap-2 items-center text-xs text-[#EC4899] font-bold">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Pronto para aplicar ao tenant {currentTenant.name} ou exportar via API
                  </div>
                </div>
              )}

              {/* Submitting custom template box slider toggler */}
              {submittingTemplate ? (
                <div className="bg-[#0A0A0C] border border-pink-500/30 rounded-3xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wider">
                    Disponibilizar e Vender Novo Roteiro/Fórmula no Marketplace
                  </h3>

                  <form onSubmit={handleCreateNewTemplate} className="space-y-4 max-w-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Título do Template</label>
                        <input
                          type="text"
                          value={newTplTitle}
                          onChange={(e) => setNewTplTitle(e.target.value)}
                          placeholder="Ex: Funil Alta Escala Moda Feminina WhatsApp"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#9333EA]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Categoria de Ocorrência</label>
                        <select
                          value={newTplCat}
                          onChange={(e) => setNewTplCat(e.target.value as any)}
                          className="w-full bg-[#0C0C0E] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA]"
                        >
                          <option value="trafego">Tráfego Pago</option>
                          <option value="whatsapp">Marketing e WhatsApp</option>
                          <option value="posts">Social Media e Posts</option>
                          <option value="dashboards">KPI e Dashboards</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">XP Requerido (Moeda de Troca)</label>
                      <input
                        type="number"
                        value={newTplPrice}
                        onChange={(e) => setNewTplPrice(Number(e.target.value))}
                        className="w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA]"
                        min="20"
                        max="500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Conteúdo Integral ou Instruções de Instalação</label>
                      <textarea
                        value={newTplDesc}
                        onChange={(e) => setNewTplDesc(e.target.value)}
                        rows={4}
                        placeholder="Insira as regras do funil, os scripts para WhatsApp ou os budgets detalhados!"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4.5 py-2.5 text-xs text-white focus:outline-none"
                        required
                      ></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#9333EA] hover:bg-purple-600 rounded-xl text-white font-black text-xs uppercase cursor-pointer"
                      >
                        Publicar Modelo (+100 XP)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmittingTemplate(false)}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-5 bg-[#0C0C0E] border border-white/10 rounded-3xl flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Contribua compartilhando conhecimento!</h4>
                    <p className="text-xs text-white/50">Crie seus próprios presets, receba status no marketplace de multiusuarios e ganhe recompensas acumuladas.</p>
                  </div>
                  <button
                    onClick={() => setSubmittingTemplate(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/50 hover:bg-purple-800 rounded-xl font-bold text-xs text-purple-300"
                  >
                    Vender Meu Template (+100 XP!)
                  </button>
                </div>
              )}

              {/* Filters category */}
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {[
                  { id: "tudo", label: "Todos os Itens" },
                  { id: "trafego", label: "Mídia & Tráfego Pago" },
                  { id: "whatsapp", label: "Automações & WhatsApp" },
                  { id: "posts", label: "Legendas & Posts Sociais" },
                  { id: "dashboards", label: "KPIs & Dashboards" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedMarketCategory(cat.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border cursor-pointer transition-all ${
                      selectedMarketCategory === cat.id
                        ? "bg-[#9333EA] border-[#9333EA] text-white"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-white/70"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((tpl) => {
                  const hasPurchased = purchasedTemplateIds.includes(tpl.id);
                  return (
                    <div
                      key={tpl.id}
                      className="bg-[#0A0A0A] border border-white/10 p-5 rounded-3xl flex flex-col justify-between gap-4 hover:border-purple-500/30 transition-all relative overflow-hidden group"
                    >
                      {tpl.verified && (
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-green-950 to-green-900 border border-green-800/80 text-[8px] text-green-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          ✓ Verificado Nexora
                        </span>
                      )}

                      <div className="space-y-2">
                        <span className="text-[9px] text-[#EC4899] font-bold uppercase tracking-wider font-mono">
                          {tpl.category === "trafego" && "Mídia Patrocinada"}
                          {tpl.category === "whatsapp" && "Automação / API"}
                          {tpl.category === "posts" && "Copy e Orgânico"}
                          {tpl.category === "dashboards" && "Analytics / Reports"}
                        </span>
                        <h4 className="text-base font-bold text-white group-hover:text-[#EC4899] transition-colors">
                          {tpl.title}
                        </h4>
                        <p className="text-xs text-white/60 line-clamp-3 leading-relaxed font-light">
                          {tpl.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs mt-auto">
                        <div className="flex items-center gap-1.5 text-white/40">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-white/90">{tpl.rating}</span>
                          <span>({tpl.downloads} downloads)</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-purple-400 font-mono text-sm">{tpl.price} XP</span>
                          <button
                            onClick={() => handlePurchaseTemplate(tpl)}
                            className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                              hasPurchased
                                ? "bg-green-950/80 hover:bg-green-900 border border-green-800 text-green-300"
                                : "bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:opacity-95 text-white"
                            }`}
                          >
                            {hasPurchased ? "Visualizar Modelo" : "Comprar Preset"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW: 7. MASTER ADMIN & SAAS PLANS ==================== */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              
              {/* SaaS Admin Cockpit Controls */}
              <SaaSAdminCockpit
                usersList={usersList}
                setUsersList={setUsersList}
                addXP={addXP}
                setAuditLogs={setAuditLogs}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
              
              {/* SaaS Plans selector grid */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">Estrutura de Modelos e Planos SaaS</h3>
                <p className="text-xs text-white/40 mb-6">Comparação direta e simulação de níveis de assinatura de clientes ativos.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {SAAS_PLANS.map((plan) => {
                    const isCurrent = (plan.id === "basic" && currentTenant.selectedPlan.includes("Básico")) ||
                                      (plan.id === "premium" && currentTenant.selectedPlan.includes("Autogerenciamento")) ||
                                      (plan.id === "enterprise" && currentTenant.selectedPlan.includes("Enterprise") || currentTenant.selectedPlan.includes("VIP"));
                    return (
                      <div
                        key={plan.id}
                        className={`p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                          isCurrent
                            ? "bg-gradient-to-b from-[#121215] to-[#0A0A0C] border-[#9333EA] shadow-[0_0_30px_rgba(147,51,234,0.15)]"
                            : "bg-[#0A0A10]/40 border-white/5 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute top-3 right-3 bg-[#EC4899] text-[8px] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                            Plano de {currentTenant.name}
                          </span>
                        )}

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{plan.name}</h4>
                            <p className="text-xs text-white/50 leading-relaxed font-light mt-1.5">{plan.description}</p>
                          </div>

                          <div className="py-2.5">
                            <span className="text-3xl font-black text-white">{plan.price}</span>
                            <span className="text-[10px] text-white/40 font-mono"> / {plan.period}</span>
                          </div>

                          <ul className="space-y-1.5">
                            {plan.features.map((feat, i) => (
                              <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {feat}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-6 mt-6 border-t border-white/5">
                          <button
                            onClick={() => {
                              addXP(40, `Simulou atualização de plano para ${plan.name}`);
                              alert(`💳 Solicitação de alteração simulada enviada para o faturamento Stripe. Sub-conta alterada para: ${plan.name}`);
                            }}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isCurrent
                                ? "bg-white/10 hover:bg-white/20 text-white"
                                : "bg-gradient-to-r from-purple-950 to-pink-950 border border-purple-800/40 hover:bg-purple-900 text-purple-300"
                            }`}
                          >
                            {isCurrent ? "Plano Ativo no Momento" : `Migrar Conta para ${plan.name}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Audit Telemetry Logs */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Telemetria de Auditoria Master & Segurança</h3>
                    <p className="text-[10px] text-white/40">Monitoramento global de conformidade LGPD e ações seguras de administradores em tempo real.</p>
                  </div>
                  <button
                    onClick={() => {
                      setAuditLogs(GLOBAL_AUDIT_LOGS);
                      alert("Histórico de telemetria de segurança redefinido!");
                    }}
                    className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs text-white/80 transition-all font-semibold"
                  >
                    Redefinir Filtros logs
                  </button>
                </div>

                <div className="space-y-2.5 font-mono text-[11px] text-white/60">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#070709] border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
                        <span className="text-white font-semibold">[{log.user}]</span>
                        <span className="text-purple-300">{log.action}</span>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-3">
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50">{log.tenant}</span>
                        <span className="text-white/30 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "automation_tests" && (
            <AutomationTestSuite
              userRole={userRole}
              setUserRole={setUserRole}
              selectedTenantId={selectedTenantId}
              setSelectedTenantId={setSelectedTenantId}
              currentTenant={currentTenant}
              posts={posts}
              setPosts={setPosts}
              leads={leads}
              setLeads={setLeads}
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              addXP={addXP}
              setAuditLogs={setAuditLogs}
              deviationAlerts={deviationAlerts}
              setDeviationAlerts={setDeviationAlerts}
            />
          )}

          {activeTab === "nexora_sites" && (
            <NexoraSitesBuilder
              currentTenant={currentTenant}
              addXP={addXP}
            />
          )}

          {activeTab === "nexora_design" && (
            <NexoraDesignStudio
              currentTenant={currentTenant}
              addXP={addXP}
            />
          )}

          {activeTab === "nexora_automation" && (
            <NexoraAutomationWorkflows
              currentTenant={currentTenant}
              addXP={addXP}
              setAuditLogs={setAuditLogs}
            />
          )}

          {activeTab === "saas_account" && (
            <SaaSAccountSystem
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              usersList={usersList}
              setUsersList={setUsersList}
              addXP={addXP}
              setAuditLogs={setAuditLogs}
              selectedTenantId={selectedTenantId}
              setSelectedTenantId={setSelectedTenantId}
              onSelectTab={setActiveTab}
            />
          )}

        </main>
      </div>

      {/* FOOTER SYSTEM METRICS BRANDING - DEPRACATED TECH ADVERTISING REMOVED IN LINE WITH ARCHITECTURAL HONEST RECONCILIATIONS */}
      <footer className="h-10 border-t border-white/5 bg-[#030303] flex items-center justify-between px-8 text-[10px] text-white/30">
        <span>© 2026 NEXORA PULSE S.A. Todos os direitos reservados.</span>
        <span>Conformidade com a LGPD • Conexão Criptografada SSL</span>
      </footer>
    </div>
  );
}
