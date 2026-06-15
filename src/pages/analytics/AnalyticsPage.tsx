import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Calendar, Download } from "lucide-react";
import { useApi } from "../../hooks/useApi";

interface CampaignRow {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  roas: number;
  ctr: number;
  cpl: number;
}

const MONTHS_DATA = [
  { month: "Jan", leads: 42, spend: 1200, roas: 3.2, ctr: 1.8, cpl: 28.5 },
  { month: "Fev", leads: 58, spend: 1800, roas: 3.8, ctr: 2.1, cpl: 31.0 },
  { month: "Mar", leads: 71, spend: 2100, roas: 4.1, ctr: 2.4, cpl: 29.6 },
  { month: "Abr", leads: 65, spend: 1950, roas: 3.9, ctr: 2.2, cpl: 30.0 },
  { month: "Mai", leads: 89, spend: 2800, roas: 4.5, ctr: 2.8, cpl: 31.5 },
  { month: "Jun", leads: 94, spend: 3100, roas: 4.8, ctr: 3.1, cpl: 32.9 },
  { month: "Jul", leads: 110, spend: 3400, roas: 5.1, ctr: 3.4, cpl: 30.9 },
];

const PLATFORM_COLORS: Record<string, string> = {
  meta: "#1877F2",
  google: "#EA4335",
  tiktok: "#010101",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
};

const PIE_COLORS = ["#9333EA", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"];

function MetricCard({ label, value, change, suffix = "", color = "purple" }: {
  label: string; value: string | number; change?: number; suffix?: string; color?: string;
}) {
  return (
    <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
      <p className="text-xl font-black text-white mt-1">
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        {suffix && <span className="text-sm text-white/40 ml-1">{suffix}</span>}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}% vs mês anterior
        </div>
      )}
    </div>
  );
}

type Period = "7d" | "30d" | "90d" | "12m";

export default function AnalyticsPage() {
  const { get } = useApi();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    const load = async () => {
      const res = await get<{ data: CampaignRow[] }>("/campaigns?limit=50");
      if (res.data) setCampaigns(res.data.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const avgRoas = campaigns.length > 0 ? campaigns.reduce((s, c) => s + (c.roas || 0), 0) / campaigns.length : 0;

  const platformData = campaigns.reduce((acc: Record<string, number>, c) => {
    acc[c.platform] = (acc[c.platform] ?? 0) + (c.spend ?? 0);
    return acc;
  }, {});
  const pieData = Object.entries(platformData).map(([name, value]) => ({ name, value }));

  const platformLeads = campaigns.reduce((acc: Record<string, number>, c) => {
    acc[c.platform] = (acc[c.platform] ?? 0) + (c.leads ?? 0);
    return acc;
  }, {});
  const barData = Object.entries(platformLeads).map(([platform, leads]) => ({ platform, leads }));

  const chartData = MONTHS_DATA.slice(period === "7d" ? -1 : period === "30d" ? -1 : period === "90d" ? -3 : -7);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Analytics</h1>
          <p className="text-xs text-white/40 mt-0.5">Performance consolidada de campanhas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/3 border border-white/8 rounded-xl p-1">
            {(["7d", "30d", "90d", "12m"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all ${
                  period === p ? "bg-purple-600 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-[10px] font-black text-white/40 border border-white/8 rounded-xl px-3 py-2 hover:bg-white/5 transition-all">
            <Download className="w-3 h-3" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Investimento Total" value={totalSpend} suffix="R$" change={12} />
        <MetricCard label="Leads Gerados" value={totalLeads} change={18} />
        <MetricCard label="Cliques" value={totalClicks} change={8} />
        <MetricCard label="ROAS Médio" value={avgRoas.toFixed(2)} suffix="x" change={5} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads trend */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-white mb-4">Evolução de Leads</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHS_DATA}>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="month" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0C0C12", border: "1px solid #ffffff10", borderRadius: 10, fontSize: 10 }} />
              <Area type="monotone" dataKey="leads" stroke="#9333EA" strokeWidth={2} fill="url(#lg1)" name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS trend */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-white mb-4">ROAS & CPL</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
              <XAxis dataKey="month" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0C0C12", border: "1px solid #ffffff10", borderRadius: 10, fontSize: 10 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: "#ffffff50" }} />
              <Line yAxisId="left" type="monotone" dataKey="roas" stroke="#EC4899" strokeWidth={2} dot={{ fill: "#EC4899", r: 3 }} name="ROAS" />
              <Line yAxisId="right" type="monotone" dataKey="cpl" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 3 }} name="CPL (R$)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spend by platform pie */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-white mb-4">Investimento por Plataforma</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0C0C12", border: "1px solid #ffffff10", borderRadius: 10, fontSize: 10 }}
                    formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Investimento"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-white/50 capitalize">{item.name}</span>
                    </div>
                    <span className="text-white/70 font-bold">R$ {(item.value as number).toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">Sem dados de campanhas</p>
            </div>
          )}
        </div>

        {/* Leads by platform */}
        <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/5 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-white mb-4">Leads por Plataforma</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="platform" tick={{ fill: "#ffffff40", fontSize: 9 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ background: "#0C0C12", border: "1px solid #ffffff10", borderRadius: 10, fontSize: 10 }} />
                <Bar dataKey="leads" fill="#9333EA" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">Crie campanhas para ver dados aqui</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign table */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-xs font-bold text-white">Campanhas</h3>
          <span className="text-[10px] text-white/30">{campaigns.length} campanhas</span>
        </div>
        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Campanha", "Plataforma", "Status", "Investimento", "Leads", "ROAS", "CTR"].map((h) => (
                    <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-white/30 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-white max-w-[180px] truncate">{c.name}</td>
                    <td className="px-4 py-3 text-xs text-white/50 capitalize">{c.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        c.status === "active" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                        c.status === "paused" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                        "text-white/30 bg-white/5 border-white/10"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">R$ {(c.spend || 0).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-xs font-bold text-purple-400">{c.leads || 0}</td>
                    <td className="px-4 py-3 text-xs font-bold text-green-400">{(c.roas || 0).toFixed(1)}x</td>
                    <td className="px-4 py-3 text-xs text-white/50">{((c.ctr || 0) * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">Nenhuma campanha encontrada</p>
            <a href="/app/traffic" className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors block">
              Criar primeira campanha →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
