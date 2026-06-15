import React, { useState, useEffect } from "react";
import { Settings, User, Building2, Bell, Shield, Key, Save, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../hooks/useApi";

type SettingsTab = "profile" | "company" | "notifications" | "security" | "api";

interface TenantInfo {
  id: string;
  name: string;
  niche: string | null;
  plan: string;
  status: string;
  primary_color: string | null;
  timezone: string | null;
  language: string | null;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { get, patch } = useApi();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    niche: "",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    primary_color: "#7C3AED",
  });

  const [notifForm, setNotifForm] = useState({
    emailAlerts: true,
    campaignReports: true,
    leadNotifications: true,
    aiInsights: false,
    weeklyDigest: true,
  });

  useEffect(() => {
    const load = async () => {
      const res = await get<{ data: TenantInfo }>("/tenant");
      if (res.data?.data) {
        const t = res.data.data;
        setTenant(t);
        setCompanyForm({
          name: t.name ?? "",
          niche: t.niche ?? "",
          timezone: t.timezone ?? "America/Sao_Paulo",
          language: t.language ?? "pt-BR",
          primary_color: t.primary_color ?? "#7C3AED",
        });
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    await patch("/tenant/users/me", profileForm);
    updateUser({ name: profileForm.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveCompany = async () => {
    await patch("/tenant", companyForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Perfil", icon: <User className="w-4 h-4" /> },
    { id: "company", label: "Empresa", icon: <Building2 className="w-4 h-4" /> },
    { id: "notifications", label: "Notificações", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "Segurança", icon: <Shield className="w-4 h-4" /> },
    { id: "api", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Configurações</h1>
        <p className="text-xs text-white/40 mt-0.5">Personalize sua conta e plataforma</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#0A0A0F] border border-white/5 rounded-2xl p-6 space-y-5">
          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-xs bg-green-950/30 border border-green-500/20 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4" />
              Configurações salvas com sucesso!
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Informações do Perfil</h2>
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-white/40">{user?.email}</p>
                  <p className="text-[10px] text-purple-400 mt-0.5 capitalize">Plano {user?.plan} · {user?.role}</p>
                </div>
              </div>
              {[
                { field: "name", label: "Nome Completo", type: "text" },
                { field: "email", label: "E-mail", type: "email" },
                { field: "phone", label: "Telefone", type: "tel" },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(profileForm as Record<string, string>)[field]}
                    onChange={(e) => setProfileForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              ))}
              <button onClick={saveProfile} className="flex items-center gap-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                Salvar Perfil
              </button>
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Configurações da Empresa</h2>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Nome da Empresa</label>
                <input
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Segmento</label>
                <select
                  value={companyForm.niche}
                  onChange={(e) => setCompanyForm((f) => ({ ...f, niche: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="" className="bg-[#0A0A0F]">Selecione</option>
                  {["E-commerce", "Agência Digital", "SaaS / Tech", "Imobiliário", "Saúde & Bem-Estar", "Educação", "Varejo"].map((n) => (
                    <option key={n} value={n} className="bg-[#0A0A0F]">{n}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Fuso Horário</label>
                  <select
                    value={companyForm.timezone}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, timezone: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {["America/Sao_Paulo", "America/Fortaleza", "America/Manaus", "America/Belem"].map((tz) => (
                      <option key={tz} value={tz} className="bg-[#0A0A0F]">{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Idioma</label>
                  <select
                    value={companyForm.language}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, language: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="pt-BR" className="bg-[#0A0A0F]">Português (BR)</option>
                    <option value="en-US" className="bg-[#0A0A0F]">English (US)</option>
                    <option value="es-ES" className="bg-[#0A0A0F]">Español</option>
                  </select>
                </div>
              </div>
              <button onClick={saveCompany} className="flex items-center gap-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 transition-colors">
                <Save className="w-3.5 h-3.5" />
                Salvar Empresa
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Preferências de Notificação</h2>
              <div className="space-y-3">
                {[
                  { key: "emailAlerts", label: "Alertas por e-mail", description: "Receba alertas críticos no seu e-mail" },
                  { key: "campaignReports", label: "Relatórios de campanhas", description: "Relatórios semanais de performance" },
                  { key: "leadNotifications", label: "Novos leads", description: "Notificação quando um lead é criado" },
                  { key: "aiInsights", label: "Insights de IA", description: "Recomendações automáticas dos agentes IA" },
                  { key: "weeklyDigest", label: "Digest semanal", description: "Resumo semanal de métricas" },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{description}</p>
                    </div>
                    <button
                      onClick={() => setNotifForm((f) => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                      className={`relative w-9 h-5 rounded-full transition-colors ${notifForm[key as keyof typeof notifForm] ? "bg-purple-600" : "bg-white/10"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifForm[key as keyof typeof notifForm] ? "left-4.5 left-[calc(100%-1.25rem)]" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Segurança da Conta</h2>
              <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-400">JWT Auth ativo</p>
                  <p className="text-[10px] text-white/30">Tokens de acesso com expiração de 15 minutos</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Senha Atual</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Nova Senha</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Confirmar Nova Senha</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" />
                </div>
                <button className="flex items-center gap-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2.5 transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  Alterar Senha
                </button>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Chaves de API</h2>
              <p className="text-xs text-white/40">Conecte plataformas externas à Nexora Pulse</p>
              {[
                { name: "GEMINI_API_KEY", label: "Google Gemini AI", description: "Para os agentes de IA avançados", link: "https://aistudio.google.com" },
                { name: "STRIPE_SECRET_KEY", label: "Stripe", description: "Para processamento de pagamentos", link: "https://dashboard.stripe.com" },
                { name: "META_ACCESS_TOKEN", label: "Meta Business", description: "Para sincronização de campanhas do Meta Ads", link: "https://developers.facebook.com" },
                { name: "GOOGLE_ADS_TOKEN", label: "Google Ads", description: "Para sincronização de campanhas do Google", link: "https://ads.google.com" },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-white">{api.label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{api.description}</p>
                    <a href={api.link} target="_blank" rel="noopener noreferrer" className="text-[9px] text-purple-400 hover:text-purple-300 transition-colors">
                      Obter chave →
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/20 bg-white/5 border border-white/8 rounded-lg px-2 py-1 font-mono">
                      Configure via Secrets
                    </span>
                  </div>
                </div>
              ))}
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-400">
                💡 Configure chaves de API no painel de Secrets do Replit para maior segurança.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
