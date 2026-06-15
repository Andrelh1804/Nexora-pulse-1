import React, { useEffect, useState } from "react";
import {
  Plus, Search, Phone, Mail, DollarSign, ChevronRight,
  User, Filter, RefreshCw, X, AlertCircle, TrendingUp
} from "lucide-react";
import { useApi } from "../../hooks/useApi";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: "novo" | "contato" | "qualificado" | "proposta" | "negociacao" | "fechado" | "perdido";
  value: number;
  notes: string | null;
  created_at: string;
}

interface LeadsResponse {
  data: Lead[];
  pagination: { page: number; limit: number; total: number };
}

const STATUS_CONFIG: Record<Lead["status"], { label: string; color: string; bg: string }> = {
  novo: { label: "Novo", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  contato: { label: "Contato", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  qualificado: { label: "Qualificado", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  proposta: { label: "Proposta", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  negociacao: { label: "Negociação", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  fechado: { label: "Fechado", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  perdido: { label: "Perdido", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const PIPELINE_STAGES: Lead["status"][] = ["novo", "contato", "qualificado", "proposta", "negociacao", "fechado"];

function LeadCard({ lead, onUpdate }: { lead: Lead; onUpdate: () => void }) {
  const { patch } = useApi();
  const cfg = STATUS_CONFIG[lead.status];

  const moveToNext = async () => {
    const idx = PIPELINE_STAGES.indexOf(lead.status);
    if (idx < PIPELINE_STAGES.length - 1) {
      await patch(`/leads/${lead.id}`, { status: PIPELINE_STAGES[idx + 1] });
      onUpdate();
    }
  };

  return (
    <div className="bg-[#0D0D14] border border-white/5 rounded-xl p-4 space-y-3 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{lead.name}</p>
            {lead.company && <p className="text-[10px] text-white/40 truncate">{lead.company}</p>}
          </div>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider shrink-0 border rounded px-1.5 py-0.5 ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <div className="space-y-1">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Phone className="w-3 h-3 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1 text-xs font-bold text-green-400">
          <DollarSign className="w-3 h-3" />
          R$ {(lead.value || 0).toLocaleString("pt-BR")}
        </div>
        {lead.status !== "fechado" && lead.status !== "perdido" && (
          <button
            onClick={moveToNext}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
          >
            Avançar <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function NewLeadModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { post } = useApi();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", value: "", status: "novo" as Lead["status"], notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    setSaving(true);
    const res = await post("/leads", { ...form, value: parseFloat(form.value) || 0 });
    if (res.error) { setError(res.error); setSaving(false); return; }
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Novo Lead</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        <div className="space-y-3">
          {[
            { field: "name", label: "Nome*", type: "text" },
            { field: "email", label: "E-mail", type: "email" },
            { field: "phone", label: "Telefone", type: "tel" },
            { field: "company", label: "Empresa", type: "text" },
            { field: "value", label: "Valor (R$)", type: "number" },
          ].map(({ field, label, type }) => (
            <div key={field}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">{label}</label>
              <input
                type={type}
                value={(form as Record<string, string>)[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Lead["status"] }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s} className="bg-[#0A0A0F]">{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 text-xs font-bold text-white/40 hover:text-white/70 border border-white/10 rounded-xl py-2.5 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2.5 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Criar Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const { get } = useApi();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Lead["status"] | "all">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const loadLeads = async () => {
    setLoading(true);
    const res = await get<LeadsResponse>("/leads?limit=100");
    if (res.error) { setError(res.error); }
    else { setLeads(res.data?.data ?? []); setError(null); }
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, []);

  const filtered = leads.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPipeline = leads.filter(l => !["fechado", "perdido"].includes(l.status)).reduce((s, l) => s + (l.value || 0), 0);
  const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === "fechado").length / leads.length) * 100) : 0;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white">CRM</h1>
          <p className="text-xs text-white/40 mt-0.5">Gerencie leads e pipeline de vendas</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total de Leads", value: String(leads.length), color: "text-purple-400" },
          { label: "Pipeline", value: `R$ ${totalPipeline.toLocaleString("pt-BR")}`, color: "text-green-400" },
          { label: "Taxa de Conversão", value: `${conversionRate}%`, color: "text-pink-400" },
          { label: "Fechados", value: String(leads.filter(l => l.status === "fechado").length), color: "text-blue-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{kpi.label}</p>
            <p className={`text-xl font-black mt-1 ${kpi.color}`}>{loading ? "—" : kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-white/30 focus:outline-none flex-1"
          />
          {search && <button onClick={() => setSearch("")}><X className="w-3 h-3 text-white/30 hover:text-white/60" /></button>}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", ...PIPELINE_STAGES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                filterStatus === s
                  ? "bg-purple-600/30 text-purple-300 border-purple-500/40"
                  : "text-white/30 border-white/8 hover:border-white/20"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {(["kanban", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                view === v ? "bg-white/10 text-white border-white/20" : "text-white/30 border-white/8"
              }`}
            >
              {v === "kanban" ? "Kanban" : "Lista"}
            </button>
          ))}
          <button onClick={loadLeads} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 border border-white/8 hover:bg-white/5 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-950/30 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filtered.filter(l => l.status === stage);
            const cfg = STATUS_CONFIG[stage];
            return (
              <div key={stage} className="min-w-[160px]">
                <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg border ${cfg.bg}`}>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                  <span className={`text-[9px] font-bold ${cfg.color}`}>{stageLeads.length}</span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onUpdate={loadLeads} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="border border-dashed border-white/5 rounded-xl p-4 text-center">
                      <p className="text-[9px] text-white/20">Sem leads</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Nome", "Empresa", "Status", "Valor", "Criado em"].map((h) => (
                  <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-white/30 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filtered.map((lead) => {
                const cfg = STATUS_CONFIG[lead.status];
                return (
                  <tr key={lead.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{lead.name}</p>
                          {lead.email && <p className="text-[9px] text-white/30">{lead.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">{lead.company ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-green-400">
                      R$ {(lead.value || 0).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-white/30">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">Nenhum lead encontrado</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Criar primeiro lead →
              </button>
            </div>
          )}
        </div>
      )}

      {showNewModal && <NewLeadModal onClose={() => setShowNewModal(false)} onSave={loadLeads} />}
    </div>
  );
}
