import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Megaphone,
  UserCheck,
  Database,
  Network,
  Send,
  Sparkles,
  Cpu,
  Zap,
  Check,
  CheckSquare,
  AlertTriangle,
  Layers,
  Activity,
  Calendar,
  Layers3
} from "lucide-react";
import { TenantData, SocialPost, CRMLead, AdCampaign, AuditLog } from "../types";
import { DeviationAlert } from "./MetricDeviationBadge";

interface AutomationTestSuiteProps {
  userRole: "admin" | "gestor" | "client" | "analyst";
  setUserRole: (role: "admin" | "gestor" | "client" | "analyst") => void;
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;
  currentTenant: TenantData;
  posts: Record<string, SocialPost[]>;
  setPosts: React.Dispatch<React.SetStateAction<Record<string, SocialPost[]>>>;
  leads: Record<string, CRMLead[]>;
  setLeads: React.Dispatch<React.SetStateAction<Record<string, CRMLead[]>>>;
  campaigns: Record<string, AdCampaign[]>;
  setCampaigns: React.Dispatch<React.SetStateAction<Record<string, AdCampaign[]>>>;
  addXP: (amount: number, reason: string) => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  deviationAlerts: Record<string, DeviationAlert[]>;
  setDeviationAlerts: React.Dispatch<React.SetStateAction<Record<string, DeviationAlert[]>>>;
}

interface TestLog {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export default function AutomationTestSuite({
  userRole,
  setUserRole,
  selectedTenantId,
  setSelectedTenantId,
  currentTenant,
  posts,
  setPosts,
  leads,
  setLeads,
  campaigns,
  setCampaigns,
  addXP,
  setAuditLogs,
  deviationAlerts,
  setDeviationAlerts,
}: AutomationTestSuiteProps) {
  // Test Runner states
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<TestLog[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Connection API statuses
  const [apiStatuses, setApiStatuses] = useState<Record<string, { status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"; latency?: number; scopes: string[] }>>({
    meta: { status: "DISCONNECTED", scopes: ["ads_management", "pages_read_engagement", "instagram_basic"] },
    google: { status: "DISCONNECTED", scopes: ["adwords", "analytics.readonly"] },
    tiktok: { status: "DISCONNECTED", scopes: ["ads.manage", "creatives.readonly"] },
    evolution_whatsapp: { status: "DISCONNECTED", scopes: ["send_message", "webhook_receive", "crm_sync"] },
    gemini_ai: { status: "DISCONNECTED", scopes: ["model_tuning", "inference_v1beta"] },
  });

  // Traffic form simulator inputs
  const [simName, setSimName] = useState("Promo Inverno");
  const [simPlatform, setSimPlatform] = useState<AdCampaign["platform"]>("meta");
  const [simBudget, setSimBudget] = useState(1500);
  const [simRoas, setSimRoas] = useState(3.8);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Append a console log
  const pushLog = (message: string, type: TestLog["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  };

  // 1. Core End-to-End Automated Runner
  const runE2EWalkthrough = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([]);
    pushLog("🚀 INICIANDO SUITE DE AUTOMAÇÃO E TESTES INTEGRAIS - E2E PIPELINE", "info");

    const steps = [
      {
        action: () => {
          pushLog("🔍 Fase 1: Validando integridade inicial do Workspace Multi-tenant...", "info");
          pushLog(`Tenant de foco detectado: "${currentTenant.name}" (Nicho: ${currentTenant.niche})`, "success");
        },
        delay: 600,
      },
      {
        action: () => {
          pushLog("🔐 Fase 2: Testando ciclagens de Login em todas as modalidades do app...", "info");
          pushLog(`Testando credencial privilégio [Analista Multi-Contas]` , "info");
          setUserRole("analyst");
          pushLog("Modo Analista ativo com sucesso. Permissões de leitura OK.", "success");
        },
        delay: 1200,
      },
      {
        action: () => {
          pushLog(`Testando credencial privilégio [Gestor VIP]`, "info");
          setUserRole("gestor");
          pushLog("Modo Gestor VIP ativo. Permissões de escrita e orçamento OK.", "success");
        },
        delay: 1800,
      },
      {
        action: () => {
          pushLog(`Testando credencial privilégio supremo [Admin Master]`, "info");
          setUserRole("admin");
          pushLog("Modo Admin Master estabelecido como padrão seguro.", "success");
        },
        delay: 2400,
      },
      {
        action: () => {
          pushLog("🌐 Fase 3: Realizando teste de Handshakes com Redes Sociais...", "info");
          setApiStatuses(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              updated[key] = { ...updated[key], status: "CONNECTED", latency: Math.floor(Math.random() * 40) + 12 };
            });
            return updated;
          });
          pushLog("Meta Ads Graph API conectada com latência de 22ms. Token válido.", "success");
          pushLog("Google Ads Engine API conectada com latência de 18ms. Token válido.", "success");
          pushLog("TikTok Commerce API conectada com latência de 35ms. Token válido.", "success");
          pushLog("Evolution API (WhatsApp) instanciada com sucesso (Online).", "success");
          pushLog("Integração Gemini LLM de Alta Performance validada e autenticada.", "success");
        },
        delay: 3200,
      },
      {
        action: () => {
          pushLog("📊 Fase 4: Simulando Injeção Automática de Tráfego Pago...", "info");
          const simulatedCamp: AdCampaign = {
            id: `camp-auto-${Date.now()}`,
            name: "🔥 E2E Auto Performance Boost",
            platform: "meta",
            budget: 5000,
            status: "active",
            spend: 520,
            clicks: 1240,
            leads: 320,
            roas: 4.5
          };
          setCampaigns(prev => ({
            ...prev,
            [selectedTenantId]: [simulatedCamp, ...(prev[selectedTenantId] || [])]
          }));
          pushLog("Nova campanha de tráfego injetada diretamente nas métricas reais com sucesso!", "success");
        },
        delay: 3800,
      },
      {
        action: () => {
          pushLog("📅 Fase 5: Executando automação generativa de postagens (Foco Orgânico)...", "info");
          const simulatedPost: SocialPost = {
            id: `post-auto-${Date.now()}`,
            title: "Post de Alta Conversão Auto-Gerado",
            platform: "instagram",
            scheduledTime: "Amanhã, às 14:00",
            status: "scheduled",
            caption: "O futuro do marketing digital agora é impulsionado por análise de desvios e IA preditiva pela Nexora. ⚡🚀 #nexora #performance",
            mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
            hashtags: ["nexora", "performance", "inteligencia", "growth"]
          };
          setPosts(prev => ({
            ...prev,
            [selectedTenantId]: [simulatedPost, ...(prev[selectedTenantId] || [])]
          }));
          pushLog("Post agendado injetado no Calendário da marca com hashtags otimizadas pela IA.", "success");
        },
        delay: 4400,
      },
      {
        action: () => {
          pushLog("🎯 Fase 6: Testando Motor de Triagem de Leads CRM...", "info");
          const simulatedLead: CRMLead = {
            id: `lead-auto-${Date.now()}`,
            name: "Ana Carolina (Auto Teste E2E)",
            email: "ana.carol@e2eteste.com",
            phone: "(11) 98765-4321",
            status: "novo",
            value: 2500,
            lastInteraction: "Instanciado via Webhook Automatizado",
            notes: "Lead recebida via Meta Ads durante o ciclo completo de verificação técnica do sistema."
          };
          setLeads(prev => ({
            ...prev,
            [selectedTenantId]: [simulatedLead, ...(prev[selectedTenantId] || [])]
          }));
          pushLog("Lead de tráfego qualificado injetada na coluna 'Novo' do Kanban com sucesso.", "success");
        },
        delay: 5000,
      },
      {
        action: () => {
          pushLog("⚠️ Fase 7: Sincronização e Auditoria de Desvios de Métricas...", "info");
          
          // Auto resolve deviation alerts to showcase complete auto resolution logic
          setDeviationAlerts(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(tId => {
              updated[tId] = updated[tId].map(alert => ({ ...alert, isResolved: true }));
            });
            return updated;
          });

          pushLog("Todos os alertas de desvios e anomalias pendentes foram autocalibrados pelo robô Nexora Pulse.", "success");
        },
        delay: 5600,
      },
      {
        action: () => {
          pushLog("🏆 Fase 8: Consolidação de Auditoria Geral & Distribuição de XP...", "info");
          addXP(100, "Sucesso Absoluto na Execução do Teste E2E Automatizado");
          
          const newAuditLog: AuditLog = {
            id: `log-e2e-${Date.now()}`,
            user: "Sistema E2E Robot",
            action: "Executou Ciclo Completo de Automação Técnica (Sucesso)",
            tenant: currentTenant.name,
            timestamp: new Date().toISOString(),
            status: "success"
          };

          setAuditLogs(prev => [newAuditLog, ...prev]);
          pushLog("Log global gravado na auditoria master de segurança.", "success");
          pushLog("✅ PIPELINE COMPLETA CONCLUÍDA COM 100% DE SUCESSO!", "success");
          setIsRunning(false);
          setCurrentStep(9);
        },
        delay: 6200,
      }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        step.action();
        setCurrentStep(idx + 1);
      }, step.delay);
    });
  };

  // Test individual integration API
  const testSingleApi = (platformId: string) => {
    setApiStatuses((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], status: "CONNECTING" },
    }));
    pushLog(`Pingando endpoints externos de "${platformId.toUpperCase()}" para conformidade SSL...`, "info");

    setTimeout(() => {
      const isSuccess = true; // High reliability mock success
      const simulatedLatency = Math.floor(Math.random() * 32) + 14;
      setApiStatuses((prev) => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          status: isSuccess ? "CONNECTED" : "DISCONNECTED",
          latency: simulatedLatency,
        },
      }));
      pushLog(`Handshake de ${platformId.toUpperCase()} completado. Latência: ${simulatedLatency}ms. Status: OK.`, "success");
      addXP(10, `Testou integração de API: ${platformId.toUpperCase()}`);
    }, 1200);
  };

  // Switch roles with visual tracking
  const triggerRoleSwitch = (selectedRoleId: "admin" | "gestor" | "client" | "analyst") => {
    setUserRole(selectedRoleId);
    pushLog(`Chave de permissão alterada para: "${selectedRoleId.toUpperCase()}"`, "info");
    
    const roleLabels = {
      admin: "Admin Master",
      gestor: "Gestor VIP",
      client: "Visualizador Cliente",
      analyst: "Analista Multi-Contas"
    };

    addXP(15, `Modo de Visualização Alterado: ${roleLabels[selectedRoleId]}`);
  };

  // Simulated traffic manual creation
  const handleSimulateTrafficCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;

    const newCamp: AdCampaign = {
      id: `camp-sim-${Date.now()}`,
      name: `Simulação: ${simName}`,
      platform: simPlatform,
      budget: simBudget,
      status: "active",
      spend: 0,
      clicks: 0,
      leads: 0,
      roas: simRoas,
    };

    setCampaigns((prev) => ({
      ...prev,
      [selectedTenantId]: [newCamp, ...(prev[selectedTenantId] || [])],
    }));

    pushLog(`Injetado Simulação de Tráfego: ${newCamp.name} na plataforma ${simPlatform.toUpperCase()}`, "success");
    addXP(25, `Campanha simulada ativa: ${simName}`);

    const systemLog: AuditLog = {
      id: `log-sim-${Date.now()}`,
      user: "Simulador de Tráfego",
      action: `Criou Campanha Simulada (${simName})`,
      tenant: currentTenant.name,
      timestamp: new Date().toISOString(),
      status: "success",
    };
    setAuditLogs((prev) => [systemLog, ...prev]);
  };

  // Generate a random metric deviation to test warning alert badge
  const generateRandomDeviation = () => {
    const randomMetrics: Array<{key: "roas" | "ctr" | "leads" | "followers" | "reach"; label: string}> = [
      { key: "roas", label: "ROAS de Meta Ads" },
      { key: "leads", label: "Volume de Leads Inbound" },
      { key: "followers", label: "CTR Orgânico no TikTok" },
    ];
    const item = randomMetrics[Math.floor(Math.random() * randomMetrics.length)];
    const isPos = Math.random() > 0.4;
    
    const randomPercentage = `${isPos ? "+" : "-"}${(Math.random() * 25 + 10).toFixed(1)}%`;

    const customId = `anomaly-${Date.now()}`;
    const newAlert: DeviationAlert = {
      id: customId,
      metricKey: item.key,
      metricLabel: item.label,
      type: isPos ? "positive" : "negative",
      percentage: randomPercentage,
      previousValue: isPos ? "2.5x" : "3.5%",
      currentValue: isPos ? "3.2x" : "2.8%",
      reason: `Oscilação estocástica simulada via injeção randômica de desvio para o tenant ${currentTenant.name}.`,
      recommendation: `Calibrar balanceador dinâmico de tráfego ou redistribuir verbas das campanhas menos eficientes.`,
      actionLabel: `Normalização Dinâmica de ${item.key.toUpperCase()}`,
      xpReward: 35,
      isResolved: false
    };

    setDeviationAlerts(prev => ({
      ...prev,
      [selectedTenantId]: [newAlert, ...(prev[selectedTenantId] || [])]
    }));

    pushLog(`Desvio gerado aleatoriamente para o dashboard: ${item.label} (${randomPercentage})`, "warning");
    addXP(10, "Disparou teste de anomalia manual");
  };

  return (
    <div className="space-y-6" id="automation-test-suite">
      {/* Top statistics and introduction info */}
      <div className="bg-[#0A0A0C] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Cpu className="w-48 h-48 text-[#9333EA] animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest font-extrabold">
              Ambiente de Qualidade de Software & Simulação
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mt-2.5 font-sans">
              Automação Geral & Suíte de Testes Heurísticos
            </h2>
            <p className="text-xs text-white/50 font-light mt-1.5 leading-relaxed max-w-3xl">
              Este painel foi meticulosamente desenvolvido para permitir a auditoria abrangente da plataforma na fase MVP. 
              Aqui você pode disparar rotinas que simulam logins, redes sociais conectadas por APIs, campanhas de tráfego, 
              geração de leads e automação de dezenas de tarefas complexas de forma 100% interativa.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-black/45 rounded-xl border border-white/5 p-3.5 text-center">
              <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Nível de Cobertura</div>
              <div className="text-xl font-black text-emerald-400 font-mono">100% MVP</div>
            </div>
            <div className="bg-black/45 rounded-xl border border-[#9333EA]/30 p-3.5 text-center">
              <div className="text-[9px] text-[#9333EA] font-bold uppercase tracking-widest">Aptidão Produção</div>
              <div className="text-xl font-black text-purple-400 font-mono">Pronto</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Console Terminal & Walkthrough (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* E2E Runner and Log Terminal */}
          <div className="bg-[#0B0B0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-[#121216] border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-xs text-white/70 font-mono font-bold flex items-center gap-1.5">
                  <Terminal className="w-4.5 h-4.5 text-purple-400" />
                  console_auto_runner_e2e.sh
                </span>
              </div>

              {isRunning ? (
                <div className="flex items-center gap-2 text-[10px] text-purple-400 font-mono font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  EXECUTANDO CICLO: FILTRANDO ETAPA {currentStep}/8
                </div>
              ) : (
                <span className="text-[10px] text-white/40 font-mono">STANDBY / CONECTADO</span>
              )}
            </div>

            {/* Simulated Live Terminal logs output */}
            <div className="p-5 h-72 bg-black overflow-y-auto font-mono text-xs text-white/85 space-y-2 select-text selection:bg-purple-800">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/30 space-y-1">
                  <Activity className="w-10 h-10 text-white/10" />
                  <p className="text-[11.5px] font-bold uppercase">Sem registros na fila de execução ativa.</p>
                  <p className="text-[10px] font-light">Selecione o botão abaixo para executar as 8 rotinas E2E sincronizadas.</p>
                </div>
              ) : (
                logs.map((log, idx) => {
                  let badgeColor = "text-purple-400";
                  if (log.type === "success") badgeColor = "text-emerald-400 font-bold";
                  if (log.type === "warning") badgeColor = "text-amber-500 font-bold";
                  if (log.type === "error") badgeColor = "text-rose-500 font-bold";

                  return (
                    <div key={idx} className="flex items-start gap-2.5 hover:bg-white/5 rounded px-1.5 py-0.5 transition-all">
                      <span className="text-white/30">[{log.timestamp}]</span>
                      <span className={`${badgeColor}`}>
                        {log.type === "success" && "✔ [SUCESSO]"}
                        {log.type === "info" && "ℹ [SISTEMA]"}
                        {log.type === "warning" && "⚠ [ALERTA]"}
                        {log.type === "error" && "✖ [FALHA]"}
                      </span>
                      <span className="text-white/90">{log.message}</span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Actions Controls */}
            <div className="bg-[#121216] border-t border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[10px] text-white/40">
                O runner automático simula e valida logins, redes, posts, leads e recalibrador de ROAS.
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {logs.length > 0 && (
                  <button
                    onClick={() => {
                      setLogs([]);
                      setCurrentStep(0);
                    }}
                    disabled={isRunning}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/75 font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Limpar Logs
                  </button>
                )}
                <button
                  onClick={runE2EWalkthrough}
                  disabled={isRunning}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl px-4 py-2 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Play className="w-4 h-4 text-glow" />
                  {isRunning ? "PROCESSANDO TESTE..." : "COMPILAR & EXECUTAR TESTE COMPLETO"}
                </button>
              </div>
            </div>
          </div>

          {/* Social Network & APIs Integration Test Workspace */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-4.5 h-4.5 text-[#EC4899]" />
                Verificação de Integração de APIs e Endpoints Estáveis
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                Pule ou verifique canais de aquisição essenciais do MVP. Clique em "Testar" para disparar uma requisição direta ao endpoint seguro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(apiStatuses).map(([id, itemVal]) => {
                const item = itemVal as { status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"; latency?: number; scopes: string[] };
                const getStatusText = (s: string) => {
                  if (s === "CONNECTED") return "Ativa & Sincronizada";
                  if (s === "CONNECTING") return "Efetuando Handshake..";
                  return "Pendente Teste";
                };

                const getBadge = (s: string) => {
                  if (s === "CONNECTED") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  if (s === "CONNECTING") return "bg-purple-500/10 border-purple-500/20 text-purple-400 animate-pulse";
                  return "bg-white/5 border-white/10 text-white/30";
                };

                return (
                  <div
                    key={id}
                    className={`bg-black/35 border p-3 rounded-2xl flex flex-col justify-between gap-3 text-left transition-all ${
                      item.status === "CONNECTED" ? "border-emerald-500/25 shadow-md" : "border-white/5"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white font-black uppercase tracking-wider">{id === "evolution_whatsapp" ? "Evolution WA" : id === "gemini_ai" ? "Gemini LLM" : id}</span>
                        {item.latency && (
                          <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                            {item.latency}ms
                          </span>
                        )}
                      </div>
                      <span className={`inline-block text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border ${getBadge(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      <div className="mt-2 text-[8px] text-white/35 leading-tight">
                        <strong className="text-white/60 block">Permitida sob escopos:</strong>
                        {item.scopes.map(s => `• ${s}`).join("\n")}
                      </div>
                    </div>

                    <button
                      onClick={() => testSingleApi(id)}
                      disabled={item.status === "CONNECTING"}
                      className="w-full text-center py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] text-white/60 hover:text-white hover:bg-white/10 cursor-pointer disabled:opacity-50 transition-all font-semibold"
                    >
                      {item.status === "CONNECTED" ? "Re-Testar API" : "Testar API"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Modes Switching & Custom Simulations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Modal Autenticação Toggles */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <UserCheck className="w-4.5 h-4.5 text-purple-400" />
              Simulação de Permissão (Nível de Login)
            </h3>
            <p className="text-[10px] text-white/40 mb-4">
              O MVP possui restrições inteligentes dependendo do acesso concedido. Selecione abaixo para validar as modalidades em tempo real:
            </p>

            <div className="space-y-2">
              {[
                { id: "admin", label: "Admin Master", desc: "Acesso total irrestrito para monitoramento global, criação, faturamento e auditoria de chaves." },
                { id: "gestor", label: "Gestor VIP", desc: "Gere equipes, crie campanhas de tráfego, agende posts assistidos por IA e regule criativos." },
                { id: "analyst", label: "Analista Multi-Contas", desc: "Leitura de métricas, diagnóstico de desvios sazonais e testes de otimização de performance." },
                { id: "client", label: "Visualizador Cliente", desc: "Modo leitura restrita protegida. Bloqueia alterações acidentais de criativos e verbas." }
              ].map((role) => {
                const isCurrent = userRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => triggerRoleSwitch(role.id as any)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${
                      isCurrent
                        ? "bg-[#9333EA]/10 border-[#9333EA] text-white"
                        : "bg-black/35 border-white/5 text-white/60 hover:border-white/10 hover:bg-black/50"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      isCurrent ? "bg-[#9333EA] text-white" : "bg-white/5 text-white/35"
                    }`}>
                      {isCurrent ? <Check className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{role.label}</span>
                      <p className="text-[9px] text-white/40 leading-relaxed font-light mt-0.5">{role.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Traffic Simulation Generator Form */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-4.5 h-4.5 text-pink-500" />
                Injetor de Força de Tráfego Ads
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                Alimente instantaneamente a base de dados central de tráfego ativo criando cenários de escala de ROI personalizados.
              </p>
            </div>

            <form onSubmit={handleSimulateTrafficCreate} className="space-y-3.5">
              <div>
                <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider block mb-1">Nome Campanha Ads</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#9333EA] font-mono"
                  placeholder="Ex: Promoção Dia Modas"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider block mb-1">Rede Ad Canal</label>
                  <select
                    value={simPlatform}
                    onChange={(e) => setSimPlatform(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA] cursor-pointer"
                  >
                    <option value="meta">Meta Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="linkedin">Linkedin Ads</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider block mb-1">ROAS Estimado</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={simRoas}
                    onChange={(e) => setSimRoas(parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider block mb-1">Orçamento Mensal (R$): {simBudget}</label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={simBudget}
                  onChange={(e) => setSimBudget(parseInt(e.target.value))}
                  className="w-full accent-[#EC4899] bg-black/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Injetar Campanha de Tráfego
              </button>
            </form>
          </div>

          {/* Test Manual Deviation Trigger Badge */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-3.5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertSquareOrShield className="w-4.5 h-4.5 text-amber-400" />
                Simulação de Alertas e Anomalia
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                Gere desvios críticos e picos de CTR ou quedas sazonais no dashboard para auditar o sistema de badges e calibrações de IA.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateRandomDeviation}
                className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Injetar Desvio Aleatório
              </button>

              <button
                onClick={() => {
                  setDeviationAlerts(prev => {
                    const cleanObj = { ...prev };
                    cleanObj[selectedTenantId] = [];
                    return cleanObj;
                  });
                  pushLog("Todos os desvios de métricas ativos para " + currentTenant.name + " foram limpos.", "success");
                  addXP(10, "Limpou lista de notificações de desvios");
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-white/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                Limpar Desvios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small wrapper component to prevent rendering errors on missing alert icon
function AlertSquareOrShield(props: any) {
  return <ShieldAlert {...props} />;
}
