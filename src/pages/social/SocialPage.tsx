import React, { useState } from "react";
import { MessageSquare, Calendar, Send, Clock, CheckCircle, Instagram, Youtube, Linkedin, Plus, X } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "from-pink-500 to-purple-500", icon: <Instagram className="w-3.5 h-3.5" /> },
  { id: "facebook", label: "Facebook", color: "from-blue-600 to-blue-700", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: "linkedin", label: "LinkedIn", color: "from-blue-500 to-blue-600", icon: <Linkedin className="w-3.5 h-3.5" /> },
  { id: "youtube", label: "YouTube", color: "from-red-500 to-red-600", icon: <Youtube className="w-3.5 h-3.5" /> },
  { id: "tiktok", label: "TikTok", color: "from-gray-800 to-gray-900", icon: <MessageSquare className="w-3.5 h-3.5" /> },
];

const SAMPLE_POSTS = [
  { id: "1", platform: "instagram", content: "🚀 Transforme sua presença digital hoje! Descubra como nossa IA pode multiplicar seus resultados em 30 dias.", status: "scheduled", scheduledAt: "2026-07-20 10:00" },
  { id: "2", platform: "facebook", content: "📊 Relatório mensal: +240% de leads com tráfego pago otimizado por IA. Saiba como chegamos lá.", status: "published", scheduledAt: "2026-07-15 14:00" },
  { id: "3", platform: "linkedin", content: "Artigo: As 5 tendências de marketing digital que vão dominar o 2º semestre de 2026.", status: "draft", scheduledAt: "" },
];

function PostCard({ post }: { post: typeof SAMPLE_POSTS[0] }) {
  const platform = PLATFORMS.find((p) => p.id === post.platform);
  return (
    <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 space-y-3 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${platform?.color ?? "from-gray-600 to-gray-700"} flex items-center justify-center text-white shrink-0`}>
          {platform?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/70 line-clamp-2">{post.content}</p>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-wider border rounded px-1.5 py-0.5 shrink-0 ${
          post.status === "published" ? "text-green-400 bg-green-500/10 border-green-500/20" :
          post.status === "scheduled" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
          "text-white/30 bg-white/5 border-white/10"
        }`}>{post.status === "published" ? "Publicado" : post.status === "scheduled" ? "Agendado" : "Rascunho"}</span>
      </div>
      {post.scheduledAt && (
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <Clock className="w-3 h-3" />
          {post.scheduledAt}
        </div>
      )}
    </div>
  );
}

function NewPostModal({ onClose }: { onClose: () => void }) {
  const { post } = useApi();
  const [form, setForm] = useState({ platform: "instagram", content: "", status: "draft", scheduledAt: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async (status: "draft" | "scheduled") => {
    setSaving(true);
    await post("/social/posts", { ...form, status });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Novo Post</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-white/30 hover:text-white/70" /></button>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">Plataforma</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setForm((f) => ({ ...f, platform: p.id }))}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                  form.platform === p.id
                    ? `bg-gradient-to-r ${p.color} border-transparent text-white`
                    : "border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Conteúdo</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Escreva seu conteúdo aqui..."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
          <p className="text-[9px] text-white/20 mt-1">{form.content.length} / 2200 caracteres</p>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Agendar para</label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave("draft")} disabled={saving} className="flex-1 text-xs font-bold text-white/40 border border-white/10 rounded-xl py-2.5 hover:bg-white/5 transition-colors">
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSave("scheduled")}
            disabled={saving || !form.content.trim()}
            className="flex-1 text-xs font-black bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl py-2.5 transition-colors"
          >
            {saving ? "..." : form.scheduledAt ? "Agendar Post" : "Publicar Agora"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "scheduled" | "published" | "draft">("all");

  const filtered = SAMPLE_POSTS.filter((p) => activeFilter === "all" || p.status === activeFilter);

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Social Media</h1>
          <p className="text-xs text-white/40 mt-0.5">Gerencie e agende posts nas redes sociais</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Post
        </button>
      </div>

      {/* Platform connection status */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PLATFORMS.map((p) => (
          <div key={p.id} className="bg-[#0A0A0F] border border-white/5 rounded-xl p-3 flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white shrink-0`}>
              {p.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-white/70">{p.label}</p>
              <p className="text-[8px] text-yellow-500/70">Conectar</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Agendados", value: SAMPLE_POSTS.filter(p => p.status === "scheduled").length, color: "text-yellow-400" },
          { label: "Publicados", value: SAMPLE_POSTS.filter(p => p.status === "published").length, color: "text-green-400" },
          { label: "Rascunhos", value: SAMPLE_POSTS.filter(p => p.status === "draft").length, color: "text-white/50" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-white/30 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "scheduled", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
              activeFilter === f ? "bg-purple-600/30 text-purple-300 border-purple-500/40" : "text-white/30 border-white/8 hover:border-white/20"
            }`}
          >
            {f === "all" ? "Todos" : f === "scheduled" ? "Agendados" : f === "published" ? "Publicados" : "Rascunhos"}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((post) => <PostCard key={post.id} post={post} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">Nenhum post encontrado</p>
          </div>
        )}
      </div>

      {showModal && <NewPostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
