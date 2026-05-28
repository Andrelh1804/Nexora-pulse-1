import React, { useState } from "react";
import {
  Users,
  Building,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Info,
  Sliders,
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  RefreshCw,
  Terminal,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { SaaSUser } from "./SaaSAccountSystem";
import { AuditLog } from "../types";

interface SaaSAdminCockpitProps {
  usersList: SaaSUser[];
  setUsersList: React.Dispatch<React.SetStateAction<SaaSUser[]>>;
  addXP: (amount: number, reason: string) => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  currentUser: SaaSUser | null;
  setCurrentUser: (user: SaaSUser | null) => void;
}

export default function SaaSAdminCockpit({
  usersList,
  setUsersList,
  addXP,
  setAuditLogs,
  currentUser,
  setCurrentUser
}: SaaSAdminCockpitProps) {
  // Manual creation states
  const [mName, setMName] = useState("");
  const [mCompany, setMCompany] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mDocument, setMDocument] = useState("");
  const [mDuration, setMDuration] = useState(15);
  const [mPlan, setMPlan] = useState<"basic" | "premium" | "enterprise">("basic");

  // Modules toggles for manual trial
  const [modDashboard, setModDashboard] = useState(true);
  const [modSocial, setModSocial] = useState(true);
  const [modAI, setModAI] = useState(true);
  const [modTraffic, setModTraffic] = useState(false);
  const [modCRM, setModCRM] = useState(false);
  const [modMarketplace, setModMarketplace] = useState(false);

  // Edit states for user selection
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<"active_trial" | "active_paid" | "canceled" | "past_due">("active_trial");
  const [editDaysPassed, setEditDaysPassed] = useState(0);

  // Filter or tab state
  const [adminTab, setAdminTab] = useState<"users" | "provision" | "webhooks">("users");

  // Webhook sandbox state logger
  const [webhookLogs, setWebhookLogs] = useState<Array<{ id: string; event: string; status: "success" | "warning"; payload: string; time: string }>>([
    { id: "wh_01", event: "subscription.created", status: "success", payload: '{"customer": "cus_GLW_ANA123", "plan": "premium", "trial": true}', time: "Há 10 min" }
  ]);

  // Handle manual provision creation
  const handleCreateManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim() || !mCompany.trim() || !mEmail.trim() || !mPhone.trim() || !mDocument.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios da conta de teste.");
      return;
    }

    const uniqueId = `user-manual-trial-${Date.now()}`;
    const newManualUser: SaaSUser = {
      id: uniqueId,
      name: mName,
      companyName: mCompany,
      email: mEmail,
      phone: mPhone,
      document: mDocument,
      role: "client", // OPERATES ONLY IN SELF-MANAGEMENT CLIENT MODE
      trialStart: new Date().toISOString(),
      trialDays: mDuration,
      trialDaysPassed: 0,
      plan: mPlan,
      subscriptionStatus: "active_trial",
      customerStripeId: "cus_manual_free_trial", // No Stripe payment method required/initialized
      isCustomAdminTrial: true, // Marked with administrative trial tag
      allowedModules: {
        dashboard: modDashboard,
        social: modSocial,
        ai_agents: modAI,
        traffic: modTraffic,
        crm_whatsapp: modCRM,
        marketplace: modMarketplace
      }
    };

    setUsersList(prev => [...prev, newManualUser]);
    addXP(50, "Provisionada Conta de Teste Premium via Painel Adm (Tag: admin_trial_account)");

    // System audit log
    const systemLog: AuditLog = {
      id: `audit-prov-${Date.now()}`,
      user: currentUser ? currentUser.name : "Admin Master",
      action: `Provisionou Conta de Teste Gratuito Manual [${mName}] (Tag: admin_trial_account)`,
      tenant: mCompany,
      timestamp: new Date().toISOString(),
      status: "success"
    };
    setAuditLogs(prev => [systemLog, ...prev]);

    // reset fields
    setMName("");
    setMCompany("");
    setMEmail("");
    setMPhone("");
    setMDocument("");
    // switch back
    setAdminTab("users");
    alert(`Conta de teste para o cliente "${mName}" provisionada com sucesso! Ela possui a tag 'admin_trial_account' protegida e opera sem faturamento automático Stripe.`);
  };

  // Webhook action simulator trigger
  const triggerSimulatedWebhook = (eventType: string) => {
    let payloadStr = "{}";
    let status: "success" | "warning" = "success";

    switch (eventType) {
      case "subscription.created":
        payloadStr = JSON.stringify({
          id: `sub_${Math.random().toString(36).substring(5)}`,
          customer: "cus_mock_9912",
          status: "trialing",
          trial_start: Math.floor(Date.now() / 1000),
          trial_end: Math.floor(Date.now() / 1000) + 7 * 86400
        }, null, 2);
        addXP(10, "Disparou simulador stripe webhooks");
        break;
      case "payment_succeeded":
        payloadStr = JSON.stringify({
          id: `evt_${Math.random().toString(36).substring(5)}`,
          customer: "cus_GLW_ANA123",
          amount_paid: 49700,
          currency: "brl",
          invoice: "in_glow_99A12",
          payment_intent: "pi_intent_secure_920"
        }, null, 2);
        
        // Convert ana carolina to active_paid matching matching initial
        setUsersList(prev => prev.map(u => {
          if (u.id === "user-glow-owner") {
            return { ...u, subscriptionStatus: "active_paid", trialDaysPassed: 7 };
          }
          return u;
        }));
        
        addXP(30, "Simulou webhook de cobrança bem-sucedida Stripe");
        break;
      case "payment_failed":
        payloadStr = JSON.stringify({
          id: `evt_fail_${Math.random().toString(36).substring(5)}`,
          customer: "cus_GLW_ANA123",
          attempt_count: 3,
          next_retry: "tomorrow",
          invoice: "in_failed_stripe"
        }, null, 2);
        status = "warning";
        
        setUsersList(prev => prev.map(u => {
          if (u.id === "user-glow-owner") {
            return { ...u, subscriptionStatus: "past_due" };
          }
          return u;
        }));

        addXP(20, "Simulou webhook de falha no cartão Stripe");
        break;
      case "subscription.canceled":
        payloadStr = JSON.stringify({
          id: `evt_cancel_${Math.random().toString(36).substring(5)}`,
          customer: "cus_GLW_ANA123",
          cancel_at_period_end: true,
          status: "canceled"
        }, null, 2);
        status = "warning";
        
        setUsersList(prev => prev.map(u => {
          if (u.id === "user-glow-owner") {
            return { ...u, subscriptionStatus: "canceled" };
          }
          return u;
        }));

        addXP(25, "Simulou webhook de cancelamento imediato");
        break;
    }

    const newLog = {
      id: `wh_evt_${Date.now()}`,
      event: eventType,
      status,
      payload: payloadStr,
      time: "Agora"
    };

    setWebhookLogs(prev => [newLog, ...prev]);
  };

  // Admin metrics calculations
  const totalUsers = usersList.length;
  const activePaidUsers = usersList.filter(u => u.subscriptionStatus === "active_paid").length;
  const activeTrialUsers = usersList.filter(u => u.subscriptionStatus === "active_trial").length;
  const expTrialsUsers = usersList.filter(u => u.subscriptionStatus === "active_trial" && u.trialDaysPassed >= 4).length;

  const MRR = activePaidUsers * 497; // assume avg R$ 497
  const ARR = MRR * 12;
  const Churn = 8.5; // average constant

  return (
    <div className="space-y-6 select-none">
      {/* 1. Operational SaaS Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Trials Ativos (7d)", val: activeTrialUsers, desc: "Acessos Experimentais", color: "text-[#9333EA]", bColor: "border-purple-600/20" },
          { label: "Trials Expirando (Dia 4-6)", val: expTrialsUsers, desc: "Notificação Alerta Ativa", color: "text-amber-400", bColor: "border-amber-500/20" },
          { label: "Assinaturas Ativas (Dia 7+)", val: activePaidUsers, desc: "Clientes Convertidos", color: "text-emerald-400", bColor: "border-emerald-500/20" },
          { label: "Receita MRR Estimado", val: `R$ ${MRR.toLocaleString()}`, desc: "ARR: R$ " + ARR.toLocaleString(), color: "text-pink-500", bColor: "border-pink-600/20" },
          { label: "Churn Rate Global", val: Churn + "%", desc: "Perda sob controle", color: "text-white", bColor: "border-white/5" }
        ].map((c, i) => (
          <div key={i} className={`bg-[#0A0A0E] border ${c.bColor} rounded-2xl p-4 text-left space-y-1 shadow-sm hover:translate-y-[-1px] transition-all`}>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold font-sans">{c.label}</span>
            <div className={`text-xl font-black ${c.color} font-mono`}>{c.val}</div>
            <span className="text-[9px] text-white/30 tracking-tight block font-light">{c.desc}</span>
          </div>
        ))}
      </div>

      {/* Controller inner tabs */}
      <div className="flex bg-black border border-white/10 rounded-2xl p-1 gap-1">
        {[
          { id: "users", label: "Cadastro Global de Clientes / Tenants" },
          { id: "provision", label: "Provisionar Conta de Teste Grátis (admin_trial_account)" },
          { id: "webhooks", label: "Sandbox de Endpoints de Webhooks Stripe (/api/webhooks/stripe)" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`flex-1 py-2 text-[10.5px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
              adminTab === tab.id
                ? "bg-purple-950/40 text-purple-300 border border-purple-500/30"
                : "text-white/45 hover:text-white/75 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab A: Users administration list */}
      {adminTab === "users" && (
        <div className="bg-[#0A0A0C] border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-purple-400 shrink-0" /> Gestão Operacional de Contas de Assinantes
              </h3>
              <p className="text-[10px] text-white/40 font-light mt-0.5">
                Visualize, edite chaves, simule renovações ou cancele recorrências de cartões dos tenants e clientes cadastrados.
              </p>
            </div>
          </div>

          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#121217] text-white/40 text-[9px] font-mono uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Cliente / Marca</th>
                  <th className="p-4">Contato / CPF-CNPJ</th>
                  <th className="p-4 font-mono">Stripe ID / Tag</th>
                  <th className="p-4">Trial / Duração</th>
                  <th className="p-4">Validação Plano</th>
                  <th className="p-4 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/70 font-sans">
                {usersList.map((user) => {
                  const isEditing = editingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4">
                        <div className="text-left">
                          <strong className="block text-white uppercase font-sans tracking-wide">{user.name}</strong>
                          <span className="text-[9.5px] text-white/40 block font-light">{user.companyName}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-left font-mono text-[10.5px]">
                          <span className="block text-white/50">{user.email}</span>
                          <span className="block text-white/20 select-text">{user.document}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-left font-mono">
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/60">
                            {user.customerStripeId}
                          </span>
                          {user.isCustomAdminTrial && (
                            <span id="rmsu6t" className="block text-[8px] font-black text-purple-400 uppercase mt-1">
                              admin_trial_account
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editDaysPassed}
                              onChange={(e) => setEditDaysPassed(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-12 bg-black border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                            />
                            <span className="text-white/40">/ {user.trialDays} dias</span>
                          </div>
                        ) : (
                          <div className="text-left">
                            <span className="block text-white font-bold text-[10.5px]">Dia {user.trialDaysPassed} de {user.trialDays}</span>
                            <span className="text-[9px] text-white/30 block font-light">Ciclo iniciado em: {new Date(user.trialStart).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <select
                            value={editStatus}
                            onChange={(e: any) => setEditStatus(e.target.value)}
                            className="bg-black border border-white/15 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="active_trial">Active Trial</option>
                            <option value="active_paid">Active Paid</option>
                            <option value="past_due">Past Due</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        ) : (
                          <div className="text-left">
                            <span className="block text-white uppercase font-black text-[9px]">{user.plan}</span>
                            <span className={`inline-block text-[8px] font-mono font-bold uppercase rounded px-1.5 mt-0.5 ${
                              user.subscriptionStatus === "active_paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : user.subscriptionStatus === "active_trial"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/10"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {user.subscriptionStatus}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {isEditing ? (
                            <button
                              onClick={() => {
                                const updatedList = usersList.map(u => {
                                  if (u.id === user.id) {
                                    return {
                                      ...u,
                                      subscriptionStatus: editStatus,
                                      trialDaysPassed: editDaysPassed
                                    };
                                  }
                                  return u;
                                });
                                setUsersList(updatedList);
                                setEditingUserId(null);
                                addXP(30, "Atualizou assinatura de cliente manual");
                                alert(`Registro do cliente "${user.name}" atualizado de forma segura.`);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                            >
                              Salvar
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setEditStatus(user.subscriptionStatus);
                                setEditDaysPassed(user.trialDaysPassed);
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Editar
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const confirmDel = window.confirm(`Você realmente deseja deletar este tenant/cliente (${user.name}) da base de dados e suspender todas as chaves de acesso?`);
                              if (confirmDel) {
                                setUsersList(prev => prev.filter(x => x.id !== user.id));
                                addXP(40, "Revogou chaves e apagou tenant");
                                alert(`Tenant "${user.name}" foi removido permanentemente.`);
                              }
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 p-1 rounded-lg border border-rose-500/20 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab B: Custom sandbox test creation - Tag: admin_trial_account */}
      {adminTab === "provision" && (
        <form onSubmit={handleCreateManualAccount} className="bg-[#0A0A0C] border border-white/10 rounded-3xl p-8 space-y-6 text-left">
          <div className="border-b border-white/5 pb-4">
            <span className="bg-purple-500/10 border border-purple-500/20 text-[#a855f7] font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest">
              Recurso Premium Admin Master
            </span>
            <h3 className="text-base font-black text-white uppercase tracking-wider mt-1.5">
              Criar Conta Teste Manual Sem Custos (Sem Gateway Stripe)
            </h3>
            <p className="text-xs text-white/40 font-light mt-1">
              Esta funcionalidade permite que você gere acessos especiais para potenciais investidores ou testadores sem a exigência de cartão de crédito. Uma tag <span className="text-purple-400 font-bold font-mono">admin_trial_account</span> será colada de forma perene nesta conta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold text-[#9333EA] uppercase tracking-wider">
                1. Informações Cadastrais da Conta Teste
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="Ex: Pedro Henrique de Araújo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider">Nome da Empresa</label>
                  <input
                    type="text"
                    required
                    value={mCompany}
                    onChange={(e) => setMCompany(e.target.value)}
                    placeholder="Ex: Araújo Negócios Locais"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider">Email de Testes</label>
                  <input
                    type="email"
                    required
                    value={mEmail}
                    onChange={(e) => setMEmail(e.target.value)}
                    placeholder="empresa@testepulse.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-white/20 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider">WhatsApp Corporativo</label>
                  <input
                    type="text"
                    required
                    value={mPhone}
                    onChange={(e) => setMPhone(e.target.value)}
                    placeholder="Ex: (81) 98111-2222"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider">Documento CPF / CNPJ</label>
                  <input
                    type="text"
                    required
                    value={mDocument}
                    onChange={(e) => setMDocument(e.target.value)}
                    placeholder="Ex: 00.111.222/0001-33"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider">Plano Direcionado</label>
                  <select
                    value={mPlan}
                    onChange={(e: any) => setMPlan(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="basic">Plano Starter Lite</option>
                    <option value="premium">Autogerenciamento Pro</option>
                    <option value="enterprise">Gestão VIP Completa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider block">Duração Customizada do Trial de Testes</label>
                <div className="flex gap-2.5">
                  {[5, 15, 30, 90, 365].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setMDuration(days)}
                      className={`flex-1 py-1.5 border rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        mDuration === days
                          ? "bg-purple-950/40 border-[#9333EA] text-purple-300"
                          : "bg-black/40 border-white/5 text-white/50 hover:border-white/10"
                      }`}
                    >
                      {days} Dias
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Config allowed modules parameters */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold text-[#9333EA] uppercase tracking-wider">
                2. Controle de Permissões & Módulos Disponíveis
              </h4>

              <div className="space-y-2.5">
                {[
                  { id: "dashboard", l: "Painel Principal (Visualizadores de Performance)", checked: modDashboard, set: setModDashboard },
                  { id: "social", l: "Módulo Social Orgânico (Agendador & Calendário)", checked: modSocial, set: setModSocial },
                  { id: "ai", l: "Módulo de IA Especialista (Copywriter & Predictor de CTR)", checked: modAI, set: setModAI },
                  { id: "traffic", l: "Controle de Tráfego Pago (Ads Sincronizados)", checked: modTraffic, set: setModTraffic },
                  { id: "crm", l: "Pipeline de Leads & Atendimento WhatsApp CRM", checked: modCRM, set: setModCRM },
                  { id: "marketplace", l: "Marketplace de Presets (Pontos Performance XP)", checked: modMarketplace, set: setModMarketplace }
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-black/45 hover:bg-black/60 border border-white/5 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div className="text-left font-sans">
                      <span className="block text-xs text-white font-bold leading-none">{item.l}</span>
                      <span className="text-[9px] text-white/30 block mt-1">Limites e calibragens controladas sob RBAC</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => item.set(!item.checked)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-250 shrink-0 ${
                        item.checked ? "bg-purple-600" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-250 ${
                          item.checked ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <UserCheck className="w-4.5 h-4.5" /> Confirmar Provisionamento Seguro
            </button>
          </div>
        </form>
      )}

      {/* Tab C: Sandbox and Developer stripe integration webhooks log */}
      {adminTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          {/* Webhook trigger dashboard (5 cols) */}
          <div className="lg:col-span-5 bg-[#0a0a0d] border border-white/10 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Simulador Multi-Tenant de Eventos Stripe
              </h3>
              <p className="text-[10px] text-white/40 font-light mt-0.5">
                Simule requisições REST externas no endpoint <code className="text-pink-400 font-mono">/api/webhooks/stripe</code> e veja a base de dados sincronizar na hora.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              {[
                { ev: "subscription.created", l: "Nova Assinatura Registrada", d: "Inicia trial e gera customerID seguro." },
                { ev: "payment_succeeded", l: "Pagamento de Renovação Aprovado", d: "Liquida R$ 497 no dia 7 e emite invoice." },
                { ev: "payment_failed", l: "Recusa / Insuficiência de Cartão", d: "Seta assinatura como 'past_due' simulado." },
                { ev: "subscription.canceled", l: "Cancelamento Imediato", d: "Marca plano como suspenso instantaneamente." }
              ].map((item) => (
                <button
                  key={item.ev}
                  onClick={() => triggerSimulatedWebhook(item.ev)}
                  className="w-full p-3.5 bg-black hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl text-left cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className="block text-white font-bold text-xs uppercase group-hover:text-purple-400 transition-all font-sans">
                      {item.l}
                    </span>
                    <span className="text-[9.5px] text-[#9333EA] font-mono block">
                      event: {item.ev}
                    </span>
                    <span className="text-[9px] text-white/30 block">
                      {item.d}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Webhook live event stream display (7 cols) */}
          <div className="lg:col-span-7 bg-[#050507] border border-white/10 rounded-3xl p-6 flex flex-col h-full min-h-[460px] overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <span className="text-xs text-white/80 font-mono font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-pink-500 animate-pulse" />
                Live Stripe Webhook Console (Auditoria JSON)
              </span>
              <button
                onClick={() => setWebhookLogs([])}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[9.5px] font-bold rounded-lg text-white/40 cursor-pointer transition-all"
              >
                Limpar Logs
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[360px] pr-1 font-mono text-[10.5px]">
              {webhookLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/20 p-8">
                  <RefreshCw className="w-8 h-8 shrink-0 mb-3 animate-spin duration-3000 text-white/10" />
                  Pronto para interceptar requisições Stripe...
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-black rounded-2xl border border-white/5 space-y-2 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between text-[9px] font-sans">
                      <span className={`px-2 py-0.5 rounded font-black uppercase text-[8.5px] font-mono text-center ${
                        log.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {log.event}
                      </span>
                      <span className="text-white/20">{log.time}</span>
                    </div>

                    <pre className="text-[9px] text-purple-300 overflow-x-auto bg-black p-2.5 rounded-xl border border-white/5 leading-relaxed select-text font-mono">
                      {log.payload}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
