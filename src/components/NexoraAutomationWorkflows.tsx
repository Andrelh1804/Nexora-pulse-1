import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  GitFork, 
  GitPullRequest, 
  Play, 
  Zap, 
  Settings, 
  CheckCircle2, 
  Calendar, 
  Volume2, 
  Workflow, 
  ArrowRight, 
  FileCode, 
  Activity, 
  Trash2, 
  Plus 
} from "lucide-react";

interface NexoraAutomationWorkflowsProps {
  currentTenant: { name: string; companyName?: string };
  addXP: (amount: number, reason: string) => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action";
  title: string;
  description: string;
  icon: string;
}

export default function NexoraAutomationWorkflows({ currentTenant, addXP, setAuditLogs }: NexoraAutomationWorkflowsProps) {
  const [activeWorkflow, setActiveWorkflow] = useState("Pipeline de Boas-vindas VIP");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("tr-1");
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: "tr-1", type: "trigger", title: "Evolution Webhook Recebido", description: "Disparado quando um lead envia mensagem no WhatsApp", icon: "💬" },
    { id: "cond-1", type: "condition", title: "Verificar Intenção De Compra", description: "Análise semântica por IA detecta urgência", icon: "🧠" },
    { id: "act-1", type: "action", title: "Adicionar Lead na Coluna VIP", description: "Coloca prospect no funil de negociação do CRM", icon: "📋" },
    { id: "act-2", type: "action", title: "Responder via Evolution API", description: "Envia mensagem humanizada em menos de 10 segundos", icon: "✉️" }
  ]);

  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    "Workflow inicializado em modo de escuta global...",
    "Instância Evolution API conectada e pronta para triggers."
  ]);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);

  // Parameter states for selected node
  const [paramDelay, setParamDelay] = useState(5);
  const [paramAiModel, setParamAiModel] = useState("gemini-3.5-flash");
  const [paramCrmStage, setParamCrmStage] = useState("novo");

  const handleRunSimulation = () => {
    setIsRunningSimulation(true);
    setSimulationLogs(prev => [
      `[Trigger] Evolution Webhook acionado para novo lead do WhatsApp...`,
      ...prev
    ]);

    setTimeout(() => {
      setSimulationLogs(prev => [
        `[IA Analisando] Verificando sentimentos comerciais com modelo ${paramAiModel}...`,
        `[Inteligência] Intenção de compra avaliada em: "Alta Prioridade"`,
        ...prev
      ]);
    }, 800);

    setTimeout(() => {
      setSimulationLogs(prev => [
        `[CRM Registro] Lead adicionado na etapa "${paramCrmStage === "novo" ? "Entrada Novas" : paramCrmStage}" com sucesso!`,
        `[Evolution Disparo] Resposta formulada e disparada via canal ativo de WhatsApp. Delay configurado: ${paramDelay}s`,
        `🎉 Automação simulada com 100% de aproveitamento em conformidade LGPD.`,
        ...prev
      ]);
      setIsRunningSimulation(false);
      addXP(120, "Simulou execução de workflow integrado com Evolution API e CRM");

      // Inject system log inside audit logger
      setAuditLogs(prevLogs => [
        {
          id: `workflow-sim-${Date.now()}`,
          user: "Automação Integrada",
          action: "Simulou pipeline Evolution API -> CRM -> Responder WhatsApp",
          tenant: currentTenant.name,
          timestamp: new Date().toISOString(),
          status: "success"
        },
        ...prevLogs
      ]);
    }, 1800);
  };

  const handleAddActionNode = () => {
    const newNode: WorkflowNode = {
      id: `act-${Date.now()}`,
      type: "action",
      title: "Notificar via Discord/Slack",
      description: "Envia log detalhado para o time comercial no canal corporativo",
      icon: "📣"
    };
    setNodes(prev => [...prev, newNode]);
    addXP(30, "Adicionou nó de ação ao pipeline do Flow Builder");
  };

  return (
    <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-6 animate-fade-in" id="nexora-automation-workspace">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-[10px] text-emerald-300 font-extrabold uppercase flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Nexora Automation (Flow Builder Módulo)
          </span>
          <h2 className="text-xl font-black text-white mt-1 uppercase tracking-wider">Criação De Workflows Operacionais</h2>
          <p className="text-xs text-white/50">Crie regras, conecte webhooks retroalimentados por IA e organize a jornada comercial.</p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunningSimulation}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 rounded-xl text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
        >
          <Play className={`w-4 h-4 ${isRunningSimulation ? "animate-spin" : ""}`} /> 
          {isRunningSimulation ? "Executando..." : "Simular Pipeline Integrada (+120 XP)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH FLOW MAP INTERACTIVE CANVAS */}
        <div className="lg:col-span-8 bg-[#050505] p-6 border border-white/10 rounded-3xl flex flex-col justify-between relative min-h-[460px]">
          {/* background design vectors */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] bg-[size:20px_20px] opacity-25 pointer-events-none" />

          <div className="flex justify-between items-center mb-6 z-10">
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase font-bold">Fluxo Ativo</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">{activeWorkflow}</h3>
            </div>
            <button
              onClick={handleAddActionNode}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-emerald-400 font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Ação (+30 XP)
            </button>
          </div>

          {/* Connected visual map */}
          <div className="space-y-4 my-auto z-10 py-4">
            {nodes.map((n, idx) => {
              const isSelected = selectedNodeId === n.id;
              return (
                <div key={n.id} className="flex flex-col items-center">
                  <div
                    onClick={() => {
                      setSelectedNodeId(n.id);
                      addXP(10, `Visualizou propriedades: ${n.title}`);
                    }}
                    className={`w-full max-w-md p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-4 ${
                      isSelected
                        ? "bg-[#10B981]/15 border-emerald-500/70 shadow-[0_4px_16px_rgba(16,185,129,0.15)] scale-101"
                        : "bg-neutral-900/80 border-white/5 hover:border-white/10 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="text-2xl h-10 w-10 bg-neutral-950 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                      {n.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white tracking-wide">{n.title}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          n.type === "trigger" ? "bg-amber-950/40 text-amber-400 border border-amber-800/20" :
                          n.type === "condition" ? "bg-indigo-950/40 text-indigo-400 border border-indigo-800/20" :
                          "bg-emerald-950/40 text-emerald-400 border border-emerald-800/20"
                        }`}>
                          {n.type === "trigger" ? "Trigger" : n.type === "condition" ? "Condition" : "Action"}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-1 leading-normal font-light">{n.description}</p>
                    </div>
                  </div>

                  {idx < nodes.length - 1 && (
                    <div className="flex flex-col items-center py-2">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/40 to-emerald-500/10"></div>
                      <ArrowRight className="w-3 h-3 text-emerald-500/40 rotate-90 my-0.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 z-10 flex justify-between text-[8px] font-mono text-white/40">
            <span>Flow Builder v1.0 • Multi-tenant Sincronizado</span>
            <span>Total: {nodes.length} nós ativos na esteira</span>
          </div>
        </div>

        {/* WORKFLOW PROPERTY CONFIGS & SIMULATION LOGS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Node parameter controls */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">Propriedades Do Nó Selecionado</span>
            
            {nodes.find(n => n.id === selectedNodeId) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <span className="text-lg">{nodes.find(n => n.id === selectedNodeId)?.icon}</span>
                  <div>
                    <span className="block text-xs font-bold text-white">{nodes.find(n => n.id === selectedNodeId)?.title}</span>
                    <span className="text-[9px] text-white/40">{nodes.find(n => n.id === selectedNodeId)?.type.toUpperCase()} NODE</span>
                  </div>
                </div>

                {/* Simulated parameter fields context dependent */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[9px] text-white/50 font-black uppercase mb-1">Delay de Resposta (segundos)</label>
                    <input
                      type="number"
                      value={paramDelay}
                      onChange={(e) => setParamDelay(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-white/50 font-black uppercase mb-1">Motor Conversacional da IA</label>
                    <select
                      value={paramAiModel}
                      onChange={(e) => setParamAiModel(e.target.value)}
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash Model (Veloz)</option>
                      <option value="gemini-3.5-pro">Gemini 3.5 Pro (Ultra Raciocínio)</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-white/50 font-black uppercase mb-1">Funil de Destino CRM</label>
                    <select
                      value={paramCrmStage}
                      onChange={(e) => setParamCrmStage(e.target.value)}
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="novo">🆕 Entrada de Oportunidades</option>
                      <option value="contato">💬 Chat Ativo WhatsApp</option>
                      <option value="proposta">📝 Proposta Elaborada</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Selecione um nó do fluxo no mapa para calibrar seus gatilhos e integrações.</p>
            )}
          </div>

          {/* Workflow Live Monitor Execution logs */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h4 className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-between">
              <span>Painel Executivo De Eventos & Logs</span>
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full inline-block"></span>
            </h4>

            <div className="bg-neutral-950 border border-white/5 rounded-xl p-3.5 max-h-[190px] overflow-y-auto space-y-1.5 font-mono text-[9px] text-white/80 leading-relaxed text-left">
              {simulationLogs.map((log, ix) => (
                <div key={ix} className={`${log.startsWith("🎉") ? "text-emerald-400 font-bold" : log.startsWith("[Trigger") ? "text-amber-300" : "text-white/60"}`}>
                  👉 {log}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSimulationLogs([
                  "Triggers redefinidos.",
                  "Sistema em modo de escuta global ativo."
                ]);
                addXP(5, "Limpou painel de logs de execução do Flow");
              }}
              className="w-full py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-[9px] text-white/50 hover:text-white text-center font-bold"
            >
              Limpar Monitor
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
