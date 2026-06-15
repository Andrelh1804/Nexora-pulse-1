import React, { useEffect, useState } from "react";
import { Plus, Megaphone, Play, Pause, Trash2, RefreshCw, X, TrendingUp } from "lucide-react";
import { useApi } from "../../hooks/useApi";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spend: number;
  clicks: number;
  leads: number;
  roas: number;
  impressions: number;
  objective: string | null;
  created_at: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  meta: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  google: "text-red-400 bg-red-500/10 border-red-500/20",
  tiktok: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  linkedin: "text-blue-500 bg-blue-600/10 border-blue-600/20",
  youtube: "text-red-500 bg-red-600/10 border-red-600/20",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  meta: "📘", google: "🔍", tiktok: "🎵", linkedin: "💼", youtube: "▶️", default: "📣"
};

function NewCampaignModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { post } = useApi();
  const [form, setForm] = useState({
    name: "", platform: "meta", budget: "", objective: "leads", status: "active"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    setSaving(true);
    const res = await post("/campaigns", { ...form, budget: parseFloat(form.budget) || 0 });
    if (res.error) { setError(res.error); setSaving(false); return; }
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Nova Campanha</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-white/30 hover:text-white/70" /></button>
        </div>
        {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Nome da campanha*</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Campanha Black Friday"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Plataforma</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {["meta", "google", "tiktok", "linkedin", "youtube"].map((p) => (
                  <option key={p} value={p} className="bg-[#0A0A0F] capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Orçamento/dia (R$)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                placeholder="100"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Objetivo</label>
            <select
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {["leads", "conversoes", "trafego", "alcance", "engajamento", "vendas"].map((o) => (
                <option key={o} value={o} className="bg-[#0A0A0F] capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs font-bold text-white/40 hover:text-white/70 border border-white/10 rounded-xl py-2.5 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2.5 transition-colors disabled:opacity-50"
          >
            {saving ? "Criando..." : "Criar Campanha"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrafficPage() {
  const { get, patch, del } = useApi();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await get<{ data: Campaign[] }>("/campaigns?limit=50");
    setCampaigns(res.data?.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id: string, status: string) => {
    await patch(`/campaigns/${id}`, { status: status === "active" ? "paused" : "active" });
    load();
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Deletar esta campanha?")) return;
    await del(`/campaigns/${id}`);
    load();
  };

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Gestor de Tráfego</h1>
          <p className="text-xs text-white/40 mt-0.5">Gerencie campanhas de tráfego pago</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Campanha
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Campanhas Ativas", value: String(activeCampaigns), color: "text-green-400" },
          { label: "Orçamento Total", value: `R$ ${totalBudget.toLocaleString("pt-BR")}`, color: "text-purple-400" },
          { label: "Investimento", value: `R$ ${totalSpend.toLocaleString("pt-BR")}`, color: "text-pink-400" },
          { label: "Leads Gerados", value: String(totalLeads), color: "text-blue-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{kpi.label}</p>
            <p className={`text-xl font-black mt-1 ${kpi.color}`}>{loading ? "—" : kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Campaigns */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-xs font-bold text-white">Campanhas ({campaigns.length})</h2>
          <button onClick={load} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Campanha", "Plataforma", "Status", "Orçamento", "Investimento", "Leads", "ROAS", "Ações"].map((h) => (
                    <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-white/30 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {campaigns.map((c) => {
                  const platformStyle = PLATFORM_COLORS[c.platform] ?? "text-white/50 bg-white/5 border-white/10";
                  return (
                    <tr key={c.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-white truncate max-w-[180px]">{c.name}</p>
                        {c.objective && <p className="text-[9px] text-white/30 capitalize">{c.objective}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 ${platformStyle}`}>
                          {PLATFORM_EMOJIS[c.platform] ?? PLATFORM_EMOJIS.default} {c.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          c.status === "active" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                          c.status === "paused" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                          "text-white/30 bg-white/5 border-white/10"
                        }`}>{c.status === "active" ? "Ativa" : c.status === "paused" ? "Pausada" : c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/50">R$ {(c.budget || 0).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-xs text-white/50">R$ {(c.spend || 0).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-xs font-bold text-purple-400">{c.leads || 0}</td>
                      <td className="px-4 py-3 text-xs font-bold text-green-400">{(c.roas || 0).toFixed(1)}x</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleStatus(c.id, c.status)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/70 transition-all"
                            title={c.status === "active" ? "Pausar" : "Ativar"}
                          >
                            {c.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteCampaign(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-950/30 text-white/20 hover:text-red-400 transition-all"
                            title="Deletar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">Nenhuma campanha criada</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Criar primeira campanha →
            </button>
          </div>
        )}
      </div>

      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
}
