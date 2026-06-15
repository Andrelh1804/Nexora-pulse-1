import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot, Send, Sparkles, TrendingUp, PenTool, BarChart2, Megaphone,
  Loader2, Copy, Check, AlertCircle, Zap, History, X, ChevronRight,
  Cpu, Activity
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";
import { getUsageBarColor, getUsageColor } from "../../lib/usageEngine";

type AgentType = "social_media" | "copywriter" | "analyst" | "traffic_manager" | "general";

interface Agent {
  type: AgentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examplePrompts: string[];
  plan?: "premium";
}

const AGENTS: Agent[] = [
  {
    type: "social_media",
    name: "Agente Social Media",
    description: "Estratégias de conteúdo orgânico, Reels, TikTok, hashtags e SEO social",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-purple-600 to-pink-600",
    examplePrompts: [
      "Crie um plano de conteúdo para Instagram por 30 dias",
      "Sugira 10 ideias de Reels virais para e-commerce",
      "Como aumentar o engajamento no TikTok?",
    ],
    plan: "premium",
  },
  {
    type: "copywriter",
    name: "Agente Copywriter",
    description: "Copies de alta conversão para anúncios Meta, Google, TikTok e landing pages",
    icon: <PenTool className="w-5 h-5" />,
    color: "from-blue-600 to-cyan-600",
    examplePrompts: [
      "Crie 3 copies para Meta Ads de um produto de beleza",
      "Escreva um headline com técnica AIDA para e-commerce",
      "Copy para WhatsApp de reativação de clientes",
    ],
    plan: "premium",
  },
  {
    type: "analyst",
    name: "Agente Analista",
    description: "Diagnóstico de performance, análise de mercado e tendências estratégicas",
    icon: <BarChart2 className="w-5 h-5" />,
    color: "from-green-600 to-emerald-600",
    examplePrompts: [
      "Analise meu ROAS e sugira otimizações",
      "Quais são as 3 tendências de marketing para 2026?",
      "Diagnóstico completo do meu funil de vendas",
    ],
    plan: "premium",
  },
  {
    type: "traffic_manager",
    name: "Gestor de Tráfego",
    description: "Distribuição de verba entre plataformas, estrutura de campanhas e licitação",
    icon: <Megaphone className="w-5 h-5" />,
    color: "from-orange-600 to-red-600",
    examplePrompts: [
      "Como distribuir R$ 5.000 de verba entre Meta e Google?",
      "Estrutura ideal de campanhas para e-commerce",
      "Como reduzir o CPL mantendo volume?",
    ],
    plan: "premium",
  },
  {
    type: "general",
    name: "Agente Geral",
    description: "Assistente de marketing autônomo para qualquer dúvida estratégica",
    icon: <Bot className="w-5 h-5" />,
    color: "from-gray-600 to-gray-700",
    examplePrompts: [
      "Quais são as melhores práticas de marketing digital em 2026?",
      "Como criar uma estratégia de lançamento de produto?",
      "Dicas para aumentar conversões no e-commerce",
    ],
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  isSimulated?: boolean;
  processingMs?: number;
}

interface QuotaData {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
  resetDate: string;
  plan: string;
}

interface HistoryItem {
  id: string;
  agentType: string;
  prompt: string;
  response: string | null;
  model: string;
  isSimulated: boolean;
  processingMs: number;
  status: string;
  createdAt: string;
}

export default function AIAgentsPage() {
  const { get, post } = useApi();
  const { user } = useAuth();
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isPremium = user?.plan === "premium" || user?.plan === "enterprise";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchQuota = useCallback(async () => {
    const res = await get<{ quota: QuotaData; geminiEnabled: boolean }>("/ai/quota");
    if (res.data) {
      setQuota(res.data.quota);
      setGeminiEnabled(res.data.geminiEnabled);
    }
  }, [get]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const res = await get<{ interactions: HistoryItem[] }>("/ai/history?pageSize=30");
    if (res.data) setHistory(res.data.interactions);
    setHistoryLoading(false);
  }, [get]);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory, fetchHistory]);

  const sendMessage = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;
    if (activeAgent.plan === "premium" && !isPremium) return;
    if (quota?.isExceeded) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const res = await post<{
      result: string;
      model?: string;
      note?: string;
      fallback?: boolean;
      processingMs?: number;
      quota?: { used: number; limit: number; remaining: number };
    }>("/ai/agent", {
      agentType: activeAgent.type,
      tenantName: user?.name ?? "Cliente Nexora",
      tenantData: { plan: user?.plan, followers: "12.4k", roas: "3.8x", leads: "1.240", conversionRate: "2.4%" },
      userInput: text,
    });

    if (res.status === 429) {
      const errMsg: Message = {
        role: "assistant",
        content: "⚠️ **Limite de chamadas de IA atingido** para este mês.\n\nFaça upgrade do seu plano para continuar usando os agentes.",
        timestamp: new Date(),
        isSimulated: true,
      };
      setMessages((prev) => [...prev, errMsg]);
      await fetchQuota();
      setLoading(false);
      return;
    }

    const assistantMsg: Message = {
      role: "assistant",
      content: res.data?.result ?? res.error ?? "Erro ao obter resposta.",
      timestamp: new Date(),
      model: res.data?.model,
      isSimulated: !!res.data?.note,
      processingMs: res.data?.processingMs,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    if (res.data?.quota) {
      setQuota((prev) => prev ? {
        ...prev,
        used: res.data!.quota!.used,
        remaining: res.data!.quota!.remaining,
        percentUsed: prev.limit > 0 ? Math.min(100, Math.round((res.data!.quota!.used / prev.limit) * 100)) : 0,
        isExceeded: res.data!.quota!.remaining <= 0,
      } : prev);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMessage = (idx: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const switchAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setMessages([]);
    setInput("");
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-sm font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-sm font-bold text-purple-300 mt-4 mb-2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-white/80">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 text-purple-300 px-1 rounded font-mono text-[10px]">$1</code>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n- (.*?)(\n|$)/g, '<li class="ml-4 text-white/70 list-disc">$1</li>');
  };

  const agentLabel: Record<string, string> = {
    social_media: "Social Media",
    copywriter: "Copywriter",
    analyst: "Analista",
    traffic_manager: "Tráfego",
    general: "Geral",
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col md:flex-row">
      {/* Agent Selector */}
      <div className="md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#080810] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-white/50">Agentes IA</h2>
              <p className="text-[10px] text-white/30 mt-0.5">
                {geminiEnabled ? (
                  <span className="text-green-400/70">● Gemini 2.5 ativo</span>
                ) : (
                  <span className="text-yellow-400/60">● Modo simulação</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-lg transition-colors ${showHistory ? "bg-purple-600/30 text-purple-400" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
              title="Histórico de conversas"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quota bar */}
          {quota && quota.limit > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">Uso mensal de IA</span>
                <span className={`text-[9px] font-bold ${getUsageColor(quota.percentUsed)}`}>
                  {quota.used}/{quota.limit}
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getUsageBarColor(quota.percentUsed)}`}
                  style={{ width: `${quota.percentUsed}%` }}
                />
              </div>
              {quota.isExceeded && (
                <p className="text-[9px] text-red-400/80">Limite atingido · Renova em {quota.resetDate}</p>
              )}
              {!quota.isExceeded && quota.remaining <= 10 && (
                <p className="text-[9px] text-yellow-400/70">{quota.remaining} chamadas restantes</p>
              )}
            </div>
          )}
          {quota && quota.limit === -1 && (
            <div className="mt-2 flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-green-400/60" />
              <span className="text-[9px] text-green-400/60">{quota.used} chamadas · ilimitado</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {AGENTS.map((agent) => {
            const locked = agent.plan === "premium" && !isPremium;
            return (
              <button
                key={agent.type}
                onClick={() => !locked && switchAgent(agent)}
                className={`w-full text-left rounded-xl p-3 transition-all border ${
                  activeAgent.type === agent.type
                    ? "bg-purple-600/20 border-purple-500/30"
                    : "border-transparent hover:bg-white/5 hover:border-white/8"
                } ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shrink-0`}>
                    {agent.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{agent.name}</p>
                    {locked && <span className="text-[8px] text-yellow-500/70 font-black uppercase">Plano Pro</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="md:w-80 border-r border-white/5 bg-[#060610] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Histórico de Interações</h3>
            <button onClick={() => setShowHistory(false)} className="text-white/30 hover:text-white/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-[10px] text-white/30">Nenhuma interação ainda</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/3 border border-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/5 transition-colors group"
                  onClick={() => {
                    const agent = AGENTS.find((a) => a.type === item.agentType);
                    if (agent) {
                      switchAgent(agent);
                      if (item.response) {
                        setMessages([
                          { role: "user", content: item.prompt, timestamp: new Date(item.createdAt) },
                          {
                            role: "assistant",
                            content: item.response,
                            timestamp: new Date(item.createdAt),
                            isSimulated: item.isSimulated,
                            processingMs: item.processingMs,
                          },
                        ]);
                      }
                      setShowHistory(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      item.isSimulated ? "bg-yellow-900/30 text-yellow-400/70" : "bg-purple-900/30 text-purple-400"
                    }`}>
                      {agentLabel[item.agentType] ?? item.agentType}
                    </span>
                    <span className="text-[8px] text-white/20">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60 line-clamp-2 group-hover:text-white/80 transition-colors">
                    {item.prompt}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <ChevronRight className="w-2.5 h-2.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                    <span className="text-[8px] text-white/20">Reabrir conversa</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Agent header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeAgent.color} flex items-center justify-center text-white`}>
              {activeAgent.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{activeAgent.name}</p>
              <p className="text-[10px] text-white/30">{activeAgent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {geminiEnabled ? (
              <div className="flex items-center gap-1 text-[9px] text-green-400/70 bg-green-900/10 border border-green-500/10 rounded-lg px-2 py-1">
                <Cpu className="w-2.5 h-2.5" />
                Gemini 2.5 Flash
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[9px] text-yellow-400/60 bg-yellow-900/10 border border-yellow-500/10 rounded-lg px-2 py-1">
                <Activity className="w-2.5 h-2.5" />
                Modo demonstração
              </div>
            )}
            {activeAgent.plan === "premium" && !isPremium && (
              <div className="flex items-center gap-1.5 text-[9px] text-yellow-400 bg-yellow-900/20 border border-yellow-500/20 rounded-lg px-2.5 py-1.5">
                <Zap className="w-3 h-3" />
                Requer Plano Pro
              </div>
            )}
          </div>
        </div>

        {/* Quota exceeded banner */}
        {quota?.isExceeded && (
          <div className="mx-4 mt-3 flex items-center gap-3 bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-400 font-bold">Limite mensal atingido</p>
              <p className="text-[10px] text-red-400/70">Renova em {quota.resetDate} · <a href="/app/billing" className="underline hover:text-red-300">Fazer upgrade</a></p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-12">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeAgent.color} flex items-center justify-center text-white shadow-lg`}>
                <div className="scale-150">{activeAgent.icon}</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{activeAgent.name}</h3>
                <p className="text-xs text-white/40 mt-1 max-w-xs">{activeAgent.description}</p>
              </div>
              {activeAgent.plan !== "premium" || isPremium ? (
                <div className="space-y-2 w-full max-w-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Sugestões de perguntas</p>
                  {activeAgent.examplePrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      disabled={quota?.isExceeded}
                      className="w-full text-left text-xs text-white/60 hover:text-white bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 rounded-xl px-4 py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-xs text-yellow-400 font-bold">Este agente requer o Plano Pro</p>
                  <a href="/app/billing" className="text-[10px] text-yellow-400/70 hover:text-yellow-300 mt-1 block">
                    Fazer upgrade →
                  </a>
                </div>
              )}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeAgent.color} flex items-center justify-center text-white shrink-0 mr-2.5 mt-0.5`}>
                  {React.cloneElement(activeAgent.icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
                </div>
              )}
              <div className={`max-w-[75%] group ${msg.role === "user" ? "" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600/30 border border-purple-500/30 text-white ml-auto"
                      : "bg-[#0D0D18] border border-white/5 text-white/80"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div
                      className="prose prose-invert max-w-none text-xs"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[9px] text-white/20">
                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {msg.isSimulated && (
                    <span className="text-[8px] text-yellow-500/60 font-bold">simulação</span>
                  )}
                  {msg.processingMs && !msg.isSimulated && (
                    <span className="text-[8px] text-white/20">{msg.processingMs}ms</span>
                  )}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyMessage(idx, msg.content)}
                      className="text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeAgent.color} flex items-center justify-center text-white shrink-0`}>
                {React.cloneElement(activeAgent.icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
              </div>
              <div className="bg-[#0D0D18] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span className="text-xs text-white/40">Gerando resposta...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4 shrink-0">
          {activeAgent.plan === "premium" && !isPremium ? (
            <div className="text-center py-3">
              <p className="text-xs text-yellow-400/70">
                <a href="/app/billing" className="hover:text-yellow-300 transition-colors underline">Faça upgrade para Pro</a>
                {" "}para usar este agente
              </p>
            </div>
          ) : quota?.isExceeded ? (
            <div className="text-center py-3">
              <p className="text-xs text-red-400/70">
                Limite atingido ·{" "}
                <a href="/app/billing" className="hover:text-red-300 transition-colors underline">Fazer upgrade</a>
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-3 bg-white/3 border border-white/8 rounded-2xl p-3 focus-within:border-purple-500/40 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pergunte ao ${activeAgent.name}...`}
                rows={1}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none resize-none max-h-32"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
          <p className="text-[9px] text-white/20 text-center mt-2">Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      </div>
    </div>
  );
}
