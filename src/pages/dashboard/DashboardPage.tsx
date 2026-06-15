import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  Users, Megaphone, MessageSquare, Globe, TrendingUp, TrendingDown,
  Bot, Zap, ArrowUpRight, RefreshCw, AlertCircle
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";

interface Stats {
  leads: { total: number; closed: number; pipelineValue: number };
  campaigns: { total: number; active: number; totalSpend: number; totalLeads: number };
  posts: { total: number; published: number; scheduled: number };
  messages: { total: number; unread: number };
}

interface AIUsage {
  totalInteractions: number;
  totalTokens: number;
  avgProcessingMs: number;
  byAgent: Record<string, number>;
  last30Days: number;
}

const SAMPLE_CHART_DATA = [
  { name: "Jan", leads: 42, spend: 1200, roas: 3.2 },
  { name: "Fev", leads: 58, spend: 1800, roas: 3.8 },
  { name: "Mar", leads: 71, spend: 2100, roas: 4.1 },
  { name: "Abr", leads: 65, spend: 1950, roas: 3.9 },
  { name: "Mai", leads: 89, spend: 2800, roas: 4.5 },
  { name: "Jun", leads: 94, spend: 3100, roas: 4.8 },
  { name: "Jul", leads: 110, spend: 3400, roas: 5.1 },
];

function StatCard({
  label, value, sub, icon, trend, color = "purple"
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  trend?: number; color?: "purple" | "pink" | "blue" | "green";
}) {
  const colors = {
    purple: "from-purple-600/20 to-purple-900/10 border-purple-500/20",
    pink: "from-pink-600/20 to-pink-900/10 border-pink-500/20",
    blue: "from-blue-600/20 to-blue-900/10 border-blue-500/20",
    green: "from-green-600/20 to-green-900/10 border-green-500/20",
  };
  const iconColors = { purple: "text-purple-400", pink: "text-pink-400", blue: "text-blue-400", green: "text-green-400" };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
          <p className="text-2xl font-black text-white mt-1">{value}</p>
          {sub && <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>}
        </div>
        <div className={`${iconColors[color]} opacity-70`}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-bold ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% vs mês anterior
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { get } = useApi();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const [statsRes, aiRes] = await Promise.all([
      get<Stats>("/tenant/stats"),
      get<AIUsage>("/ai/usage"),
    ]);
    if (statsRes.error) {
      setError(statsRes.error);
    } else {
      setStats(statsRes.data);
      setError(null);
    }
    if (!aiRes.error && aiRes.data) setAiUsage(aiRes.data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">
            {greeting}, {user?.name?.split(" ")[0] ?? "usuário"} 👋
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Visão geral da sua plataforma em tempo real</p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white/80 border border-white/8 rounded-xl px-3 py-2 hover:bg-white/5 transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-950/30 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error} — mostrando dados de exemplo.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Leads Ativos"
          value={loading ? "—" : String(stats?.leads.total ?? 0)}
          sub={stats ? `${stats.leads.closed} fechados` : undefined}
          icon={<Users className="w-6 h-6" />}
          trend={12}
          color="purple"
        />
        <StatCard
          label="Campanhas"
          value={loading ? "—" : String(stats?.campaigns.total ?? 0)}
          sub={stats ? `${stats.campaigns.active} ativas` : undefined}
          icon={<Megaphone className="w-6 h-6" />}
          trend={8}
          color="pink"
        />
        <StatCard
          label="Posts Sociais"
          value={loading ? "—" : String(stats?.posts.total ?? 0)}
          sub={stats ? `${stats.posts.scheduled} agendados` : undefined}
          icon={<MessageSquare className="w-6 h-6" />}
          trend={5}
          color="blue"
        />
        <StatCard
          label="Chamadas IA"
          value={loading ? "—" : String(aiUsage?.last30Days ?? 0)}
          sub="últimos 30 dias"
          icon={<Bot className="w-6 h-6" />}
          trend={22}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main chart */}
        <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Performance de Campanhas</h2>
              <p className="text-[10px] text-white/30">Leads gerados por mês</p>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 border border-purple-500/20 rounded-lg px-2 py-1">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SAMPLE_CHART_DATA}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0C0C12", border: "1px solid #ffffff15", borderRadius: 12, fontSize: 11 }}
                labelStyle={{ color: "#ffffff80" }}
              />
              <Area type="monotone" dataKey="leads" stroke="#9333EA" strokeWidth={2} fill="url(#leadGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spend by platform */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-white">Investimento</h2>
            <p className="text-[10px] text-white/30">Por mês (R$)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SAMPLE_CHART_DATA.slice(-5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0C0C12", border: "1px solid #ffffff15", borderRadius: 12, fontSize: 11 }}
                formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Investimento"]}
              />
              <Bar dataKey="spend" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline + AI Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline value */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">Pipeline de Vendas</h2>
          <div className="space-y-3">
            {[
              { label: "Leads Novos", value: stats?.leads.total ?? 0, color: "bg-purple-500", max: stats?.leads.total ?? 1 },
              { label: "Leads Fechados", value: stats?.leads.closed ?? 0, color: "bg-green-500", max: stats?.leads.total ?? 1 },
              { label: "Pipeline R$", value: stats?.leads.pipelineValue ?? 0, color: "bg-pink-500", max: 100000, isCurrency: true },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{item.label}</span>
                  <span className="text-white font-semibold">
                    {item.isCurrency
                      ? `R$ ${(item.value as number).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
                      : item.value}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, ((item.value as number) / item.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Activity */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Atividade dos Agentes IA</h2>
          </div>
          {aiUsage ? (
            <div className="space-y-3">
              {Object.entries(aiUsage.byAgent).length > 0 ? (
                Object.entries(aiUsage.byAgent).map(([agent, count]) => (
                  <div key={agent} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-xs text-white/60 capitalize">{agent.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, (count / (aiUsage.totalInteractions || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Bot className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">Nenhuma interação ainda.</p>
                  <p className="text-[10px] text-white/20">Use os Agentes IA para começar.</p>
                </div>
              )}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
                <span>{aiUsage.totalInteractions} total</span>
                <span>{aiUsage.last30Days} nos últimos 30 dias</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">Carregando dados de IA...</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/15 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Comece a crescer agora</h3>
            <p className="text-xs text-white/40 mt-0.5">Execute suas próximas ações de marketing</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: "Criar Campanha", to: "/app/traffic" },
              { label: "Novo Lead", to: "/app/crm" },
              { label: "Agentes IA", to: "/app/ai" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.to}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl px-3 py-2 text-white/60 hover:text-white transition-all"
              >
                {action.label}
                <ArrowUpRight className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
