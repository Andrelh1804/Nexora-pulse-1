import React, { useEffect, useState } from "react";
import { CreditCard, Zap, Users, Megaphone, Bot, CheckCircle, ArrowUpRight, AlertCircle, TrendingUp } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../hooks/useApi";
import { PLAN_LIMITS, PLAN_PRICES, getUsagePercent, formatLimit, getUsageBarColor, PlanTier } from "../../lib/usageEngine";

interface BillingStatus {
  plan: PlanTier;
  status: string;
  trialEndsAt: string | null;
  nextBillingAt: string | null;
  usage: {
    aiCalls: number;
    leads: number;
    campaigns: number;
    users: number;
    socialPosts: number;
  };
}

const PLAN_FEATURES: Record<PlanTier, string[]> = {
  basic: [
    "50 chamadas de IA/mês",
    "Até 200 leads",
    "5 campanhas",
    "2 usuários",
    "20 posts agendados/mês",
    "Suporte por e-mail",
  ],
  premium: [
    "500 chamadas de IA/mês",
    "Até 2.000 leads",
    "30 campanhas",
    "10 usuários",
    "200 posts agendados/mês",
    "Agentes IA avançados",
    "Design Studio",
    "Automações",
    "Suporte prioritário",
  ],
  enterprise: [
    "Chamadas de IA ilimitadas",
    "Leads ilimitados",
    "Campanhas ilimitadas",
    "Usuários ilimitados",
    "Posts ilimitados",
    "Admin Cockpit",
    "White Label",
    "API Access",
    "Testes de automação",
    "SLA 99.9%",
    "Suporte dedicado 24/7",
  ],
};

function UsageBar({ label, used, plan, resource, icon }: {
  label: string;
  used: number;
  plan: PlanTier;
  resource: keyof typeof PLAN_LIMITS.basic;
  icon: React.ReactNode;
}) {
  const limit = PLAN_LIMITS[plan][resource];
  const percent = getUsagePercent(plan, resource, used);
  const barColor = getUsageBarColor(percent);
  const isUnlimited = limit === Infinity;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/40">{icon}</span>
          <span className="text-xs text-white/60">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-white/50">
          {used} / {formatLimit(limit)}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${isUnlimited ? "bg-green-500" : barColor} rounded-full transition-all duration-700`}
          style={{ width: isUnlimited ? "100%" : `${percent}%` }}
        />
      </div>
      {!isUnlimited && percent >= 80 && (
        <p className="text-[9px] text-yellow-500/80">
          {percent >= 100 ? "⚠️ Limite atingido" : `⚡ ${100 - percent}% restante`}
        </p>
      )}
    </div>
  );
}

function PlanCard({ plan, currentPlan, onUpgrade }: {
  plan: PlanTier;
  currentPlan: PlanTier;
  onUpgrade: (plan: PlanTier) => void;
}) {
  const isCurrent = plan === currentPlan;
  const price = PLAN_PRICES[plan];
  const features = PLAN_FEATURES[plan];

  const planOrder: Record<PlanTier, number> = { basic: 1, premium: 2, enterprise: 3 };
  const isUpgrade = planOrder[plan] > planOrder[currentPlan];
  const isDowngrade = planOrder[plan] < planOrder[currentPlan];

  const cardStyle = {
    basic: "border-white/5",
    premium: "border-purple-500/30 bg-gradient-to-b from-purple-900/10 to-transparent",
    enterprise: "border-amber-500/30 bg-gradient-to-b from-amber-900/10 to-transparent",
  };

  return (
    <div className={`relative bg-[#0A0A0F] border rounded-2xl p-6 flex flex-col gap-4 ${cardStyle[plan]} ${isCurrent ? "ring-1 ring-purple-500/30" : ""}`}>
      {plan === "premium" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
          Mais Popular
        </div>
      )}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white">{price.label}</h3>
          {isCurrent && (
            <span className="text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1">
              Plano Atual
            </span>
          )}
        </div>
        <div className="mt-2">
          <span className="text-2xl font-black text-white">R$ {price.brl.toLocaleString("pt-BR")}</span>
          <span className="text-xs text-white/40">/mês</span>
        </div>
      </div>
      <ul className="space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-white/60">
            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onUpgrade(plan)}
        disabled={isCurrent}
        className={`w-full text-xs font-black py-3 rounded-xl transition-all ${
          isCurrent
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : isUpgrade
            ? "bg-purple-600 hover:bg-purple-500 text-white"
            : "border border-white/10 hover:bg-white/5 text-white/50"
        }`}
      >
        {isCurrent ? "Plano Atual" : isUpgrade ? "Fazer Upgrade" : "Fazer Downgrade"}
      </button>
    </div>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const { get } = useApi();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await get<BillingStatus>("/billing/status");
      if (res.data) setBilling(res.data);
      setLoading(false);
    };
    load();
  }, []);

  const plan = (user?.plan ?? "basic") as PlanTier;
  const usage = billing?.usage ?? { aiCalls: 0, leads: 0, campaigns: 0, users: 1, socialPosts: 0 };

  const handleUpgrade = (targetPlan: PlanTier) => {
    setUpgradeMsg(`Para ${targetPlan === "enterprise" ? "Enterprise" : "Pro"}: configure sua integração Stripe no painel de administração para processar o upgrade.`);
    setTimeout(() => setUpgradeMsg(null), 5000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Assinatura & Consumo</h1>
        <p className="text-xs text-white/40 mt-0.5">Gerencie seu plano, limites e faturamento</p>
      </div>

      {upgradeMsg && (
        <div className="flex items-start gap-3 bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {upgradeMsg}
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Plano Atual</p>
            <h2 className="text-2xl font-black text-white mt-1">{PLAN_PRICES[plan].label}</h2>
            <p className="text-sm text-white/50 mt-1">
              R$ {PLAN_PRICES[plan].brl.toLocaleString("pt-BR")}/mês
            </p>
            {billing?.status === "trial" && billing.trialEndsAt && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Trial ativo até {new Date(billing.trialEndsAt).toLocaleDateString("pt-BR")}
              </p>
            )}
            {billing?.nextBillingAt && (
              <p className="text-[10px] text-white/30 mt-1">
                Próxima cobrança: {new Date(billing.nextBillingAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
              billing?.status === "active" ? "text-green-400 border-green-500/30 bg-green-500/10" :
              billing?.status === "trial" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
              "text-white/30 border-white/10"
            }`}>
              {billing?.status === "trial" ? "Trial" : billing?.status === "active" ? "Ativo" : loading ? "—" : "Inativo"}
            </div>
            <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/40 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/5 transition-all">
              <CreditCard className="w-3 h-3" />
              Portal Financeiro
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Usage meters */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-5">Consumo do Plano</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UsageBar label="Chamadas de IA" used={usage.aiCalls} plan={plan} resource="aiCallsPerMonth" icon={<Bot className="w-3.5 h-3.5" />} />
          <UsageBar label="Leads" used={usage.leads} plan={plan} resource="leadsTotal" icon={<Users className="w-3.5 h-3.5" />} />
          <UsageBar label="Campanhas" used={usage.campaigns} plan={plan} resource="campaignsTotal" icon={<Megaphone className="w-3.5 h-3.5" />} />
          <UsageBar label="Usuários" used={usage.users} plan={plan} resource="usersTotal" icon={<Users className="w-3.5 h-3.5" />} />
          <UsageBar label="Posts Sociais" used={usage.socialPosts} plan={plan} resource="socialPostsPerMonth" icon={<TrendingUp className="w-3.5 h-3.5" />} />
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="text-sm font-bold text-white mb-4">Comparar Planos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["basic", "premium", "enterprise"] as PlanTier[]).map((p) => (
            <PlanCard key={p} plan={p} currentPlan={plan} onUpgrade={handleUpgrade} />
          ))}
        </div>
      </div>

      {/* Invoice placeholder */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Histórico de Faturas</h2>
          <button className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">Ver todas</button>
        </div>
        <div className="text-center py-8">
          <CreditCard className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">Nenhuma fatura ainda</p>
          <p className="text-[10px] text-white/20 mt-1">Configure o Stripe para processar pagamentos</p>
        </div>
      </div>
    </div>
  );
}
