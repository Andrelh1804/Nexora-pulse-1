import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Building,
  Mail,
  Phone,
  FileText,
  Lock,
  Globe,
  Instagram,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Check,
  ShieldCheck,
  Coins,
  DollarSign,
  Maximize2,
  Trash2,
  Plus,
  ArrowRight,
  Info,
  Sliders,
  Bell,
  Download,
  X,
  FileSpreadsheet,
  Terminal,
  ChevronDown,
  RefreshCw,
  Clock,
  Send,
  Sparkles,
  Zap,
  Power,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { AuditLog, TenantData } from "../types";

export interface SaaSUser {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  website?: string;
  instagram?: string;
  segment?: string;
  employeesCount?: string;
  role: "admin" | "gestor" | "client" | "analyst";
  trialStart: string; // ISO String
  trialDays: number;
  trialDaysPassed: number; // simulator control
  plan: "basic" | "premium" | "enterprise";
  subscriptionStatus: "active_trial" | "active_paid" | "past_due" | "canceled" | "unpaid";
  customerStripeId: string;
  isCustomAdminTrial: boolean; // tagged with admin_trial_account
  allowedModules: {
    dashboard: boolean;
    social: boolean;
    ai_agents: boolean;
    traffic: boolean;
    crm_whatsapp: boolean;
    marketplace: boolean;
  };
}

interface SaaSAccountSystemProps {
  currentUser: SaaSUser | null;
  setCurrentUser: (user: SaaSUser | null) => void;
  usersList: SaaSUser[];
  setUsersList: React.Dispatch<React.SetStateAction<SaaSUser[]>>;
  addXP: (amount: number, reason: string) => void;
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;
  onSelectTab: (tab: any) => void;
}

// Initial Simulated Registered Users
export const INITIAL_SAAS_USERS: SaaSUser[] = [
  {
    id: "user-lucas-master",
    name: "Lucas Nexora",
    companyName: "Nexora Enterprise Ltd",
    email: "lucas@nexora.com",
    phone: "(11) 98888-7777",
    document: "12.345.678/0001-99",
    website: "https://nexora.com",
    instagram: "@nexoramarketing",
    segment: "SaaS & Performance Marketing",
    employeesCount: "50-100",
    role: "admin",
    trialStart: new Date(Date.now() - 3600 * 24 * 15 * 1000).toISOString(),
    trialDays: 7,
    trialDaysPassed: 7,
    plan: "enterprise",
    subscriptionStatus: "active_paid",
    customerStripeId: "cus_NEX_LUCAS99",
    isCustomAdminTrial: false,
    allowedModules: {
      dashboard: true,
      social: true,
      ai_agents: true,
      traffic: true,
      crm_whatsapp: true,
      marketplace: true
    }
  },
  {
    id: "user-glow-owner",
    name: "Ana Carolina Glow",
    companyName: "E-commerce Glow Cosméticos",
    email: "contato@glowcosmeticos.com.br",
    phone: "(21) 97777-6666",
    document: "98.765.432/0001-88",
    website: "https://glowcosmeticos.com.br",
    instagram: "@glow_cosmeticos",
    segment: "Varejo & Cosméticos",
    employeesCount: "11-50",
    role: "gestor",
    trialStart: new Date().toISOString(),
    trialDays: 7,
    trialDaysPassed: 0,
    plan: "premium",
    subscriptionStatus: "active_trial",
    customerStripeId: "cus_GLW_ANA123",
    isCustomAdminTrial: false,
    allowedModules: {
      dashboard: true,
      social: true,
      ai_agents: true,
      traffic: true,
      crm_whatsapp: true,
      marketplace: true
    }
  },
  {
    id: "test-admin-account-tag",
    name: "Roberto Silveira (Manual)",
    companyName: "Silveira Engenharia Civil",
    email: "roberto@silveiraeng.com",
    phone: "(85) 99123-4567",
    document: "32.111.444/0001-55",
    website: "https://silveiraeng.com",
    instagram: "@silveira_empreendimentos",
    segment: "Engenharia & Real Estate",
    employeesCount: "5-10",
    role: "client",
    trialStart: new Date().toISOString(),
    trialDays: 30,
    trialDaysPassed: 2,
    plan: "basic",
    subscriptionStatus: "active_trial",
    customerStripeId: "cus_manual_test_909",
    isCustomAdminTrial: true,
    allowedModules: {
      dashboard: true,
      social: true,
      ai_agents: false,
      traffic: false,
      crm_whatsapp: false,
      marketplace: false
    }
  }
];

export default function SaaSAccountSystem({
  currentUser,
  setCurrentUser,
  usersList,
  setUsersList,
  addXP,
  setAuditLogs,
  selectedTenantId,
  setSelectedTenantId,
  onSelectTab
}: SaaSAccountSystemProps) {
  // Navigation internal mode
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalDocType, setLegalDocType] = useState<"terms" | "privacy" | "trial" | "cancel" | "saas_contract" | "lgpd">("terms");

  // Sign up Form Inputs
  const [regName, setRegName] = useState("");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDocument, setRegDocument] = useState(""); // CPF/CNPJ
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  // Optional Fields
  const [regWebsite, setRegWebsite] = useState("");
  const [regInstagram, setRegInstagram] = useState("");
  const [regSegment, setRegSegment] = useState("Varejo & Moda");
  const [regEmployeesCount, setRegEmployeesCount] = useState("1-5");
  // Terms agreement checks
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Billing Phase in Sign-Up (Frictionless Credit Card Capture)
  const [cardNumber, setCardNumber] = useState("4000 1234 5678 9010");
  const [cardExpiry, setCardExpiry] = useState("12/30");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardBrand, setCardBrand] = useState<"visa" | "master" | "elo" | "amex">("visa");

  // Onboarding Phase state
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingSocialSelection, setOnboardingSocialSelection] = useState<string[]>(["instagram"]);
  const [onboardingAgentTone, setOnboardingAgentTone] = useState("profissional");

  // Logged-in simulator actions state
  const [simulatedInvoices, setSimulatedInvoices] = useState<Array<{ id: string; date: string; amount: string; status: "paga" | "pendente"; docUrl: string }>>([
    { id: "inv_1A2B3C", date: "28/05/2026", amount: "R$ 497,00", status: "paga", docUrl: "#" }
  ]);
  const [showInvoiceDownloadId, setShowInvoiceDownloadId] = useState<string | null>(null);

  // Auto-notification simulator events log
  const [notificationLogs, setNotificationLogs] = useState<Array<{ time: string; origin: "E-mail" | "WhatsApp" | "Painel"; title: string; body: string }>>([
    { time: "Agora", origin: "Painel", title: "Boas-vindas ao Nexora Pulse", body: "Olá! Seu período de testes de 7 dias grátis está ativo. Cadastre seus canais para colher pautas de IA." }
  ]);

  // Form errors
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Recovery input
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Simulated notifications queue trigger based on simulated days passed
  useEffect(() => {
    if (!currentUser) return;
    
    const logsArr = [];
    if (currentUser.trialDaysPassed >= 0) {
      logsArr.push({
        time: "Dia 1",
        origin: "E-mail" as const,
        title: "🪐 Bem-vindo à Revolução do Tráfego & IA!",
        body: `Prezado(a) ${currentUser.name}, seu trial de 7 dias começará a gerar inteligência para a empresa ${currentUser.companyName}.`
      });
    }

    if (currentUser.trialDaysPassed >= 4) {
      logsArr.push({
        time: "Dia 4",
        origin: "WhatsApp" as const,
        title: "⚠️ [Aviso Importante Nexora] Seu Período Experimental Está Expirando",
        body: "Olá! Notamos que o checkout inteligente está configurado. Faltam 3 dias para a transição transparente para o plano inteligente Pro."
      });
      logsArr.push({
        time: "Dia 4",
        origin: "E-mail" as const,
        title: "⚠️ Seu trial Nexora Pulse entrará na segunda metade",
        body: "Analise seus relatórios. Para reter todo o histórico de dados e posts engatilhados, mantenha seu cartão ativo."
      });
    }

    if (currentUser.trialDaysPassed >= 6) {
      logsArr.push({
        time: "Dia 6",
        origin: "Painel" as const,
        title: "🔥 Urgente: Calibragem de pagamento pendente para o Dia 7",
        body: "Sua renovação está confirmada para amanhã. O valor padrão de R$ 497,00 será liquidado de forma segura no cartão cadastrado."
      });
    }

    if (currentUser.trialDaysPassed >= 7) {
      if (currentUser.subscriptionStatus === "active_paid") {
        logsArr.push({
          time: "Dia 7",
          origin: "E-mail" as const,
          title: "✅ Cobrança Aprovada: Assinatura Nexora Ativa!",
          body: `Transação Stripe liquidada sob ID ${currentUser.customerStripeId}. Invoice #NEX-${Math.floor(Math.random() * 9000) + 1000} disponível.`
        });
      }
    }

    setNotificationLogs(logsArr.reverse());
  }, [currentUser?.trialDaysPassed, currentUser?.subscriptionStatus]);

  // 1. Simulated Time Manipulation Engine
  const advanceSimulatedDays = () => {
    if (!currentUser) return;

    const nextPassed = currentUser.trialDaysPassed + 1;
    if (nextPassed > 7) {
      addXP(10, "Estouro de simulação de dias");
      return;
    }

    let nextStatus = currentUser.subscriptionStatus;
    
    // Auto transition to paid on Day 7
    if (nextPassed === 7 && currentUser.subscriptionStatus === "active_trial" && !currentUser.isCustomAdminTrial) {
      nextStatus = "active_paid";
      // append new invoice
      const newInv = {
        id: `inv_NEX_${Math.floor(Math.random()*90000)+10000}`,
        date: "Hoje",
        amount: currentUser.plan === "basic" ? "R$ 197,00" : currentUser.plan === "premium" ? "R$ 497,00" : "R$ 1.997,00",
        status: "paga" as const,
        docUrl: "#"
      };
      setSimulatedInvoices(prev => [newInv, ...prev]);
      addXP(50, "Cobrança Automática do Trial Convertida via Webhook");

      const systemLog: AuditLog = {
        id: `stripe-webhook-${Date.now()}`,
        user: "Stripe Webhook Engine",
        action: "Recebeu payment_succeeded & Ativou Assinatura",
        tenant: currentUser.companyName,
        timestamp: new Date().toISOString(),
        status: "success"
      };
      setAuditLogs(prev => [systemLog, ...prev]);
    }

    const updatedUser: SaaSUser = {
      ...currentUser,
      trialDaysPassed: nextPassed,
      subscriptionStatus: nextStatus
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    addXP(15, `Simulação Avançou: Dia ${nextPassed} do ciclo de faturamento`);
  };

  // 2. Client Login Action
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setFormError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // search mock database
    const match = usersList.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (match) {
      setCurrentUser(match);
      setFormSuccess(`Bem-vindo de volta! Identificação: ${match.name}`);
      addXP(20, "Identificação segura de sessão autorizada");
      
      const systemLog: AuditLog = {
        id: `log-login-${Date.now()}`,
        user: match.name,
        action: `Efetuou login no painel em modo ${match.role.toUpperCase()}`,
        tenant: match.companyName,
        timestamp: new Date().toISOString(),
        status: "success"
      };
      setAuditLogs(prev => [systemLog, ...prev]);
    } else {
      setFormError("Credenciais de acesso não cadastradas na base. Tente o sign-up ou faça login simulado rápido.");
    }
  };

  // 3. Client Registration Action & Stripe Generation
  const handleClientSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!regName.trim() || !regCompanyName.trim() || !regEmail.trim() || !regPhone.trim() || !regDocument.trim() || !regPassword.trim()) {
      setFormError("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setFormError("As senhas inseridas não coincidem.");
      return;
    }

    if (!agreedToTerms) {
      setFormError("Você precisa ler e aceitar os Termos de Uso e Política de Privacidade para prosseguir.");
      return;
    }

    // Generate simulated user
    const stripeId = `cus_STRIPE_${Math.random().toString(36).substring(3, 9).toUpperCase()}`;
    const newUser: SaaSUser = {
      id: `user-registered-${Date.now()}`,
      name: regName,
      companyName: regCompanyName,
      email: regEmail,
      phone: regPhone,
      document: regDocument,
      website: regWebsite || undefined,
      instagram: regInstagram || undefined,
      segment: regSegment,
      employeesCount: regEmployeesCount,
      role: "gestor", // Default customer role
      trialStart: new Date().toISOString(),
      trialDays: 7,
      trialDaysPassed: 0,
      plan: "premium", // default active Trial target
      subscriptionStatus: "active_trial",
      customerStripeId: stripeId,
      isCustomAdminTrial: false,
      allowedModules: {
        dashboard: true,
        social: true,
        ai_agents: true,
        traffic: true,
        crm_whatsapp: true,
        marketplace: true
      }
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setOnboardingActive(true);
    setOnboardingStep(1);
    addXP(40, "Nova Conta SaaS Registrada - Custumer Stripe Gerado!");

    const systemLog: AuditLog = {
      id: `log-reg-${Date.now()}`,
      user: regName,
      action: `Criou nova conta SaaS (Trial 7 Dias) • Stripe: ${stripeId}`,
      tenant: regCompanyName,
      timestamp: new Date().toISOString(),
      status: "success"
    };
    setAuditLogs(prev => [systemLog, ...prev]);
  };

  // Manual fast trigger login
  const triggerQuickLogin = (roleId: "admin" | "gestor" | "client") => {
    const target = usersList.find(u => u.role === roleId) || usersList[0];
    setCurrentUser(target);
    addXP(15, `Sessão demonstrativa aberta como: ${roleId.toUpperCase()}`);
    
    const systemLog: AuditLog = {
      id: `log-login-quick-${Date.now()}`,
      user: target.name,
      action: `Acesso rápido de auditoria ativa como ${roleId.toUpperCase()}`,
      tenant: target.companyName,
      timestamp: new Date().toISOString(),
      status: "success"
    };
    setAuditLogs(prev => [systemLog, ...prev]);
  };

  // Complete onboarding
  const completeOnboardingWizard = () => {
    setOnboardingActive(false);
    addXP(50, "Módulos Iniciais Sincronizados - Bem vindo à Nexora!");
    onSelectTab("dashboard");
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* IF USER IS NOT LOGGED IN - SHOW HIGH CONSTRAST SIGNUP & AUTENTICAÇÃO SCREEN */}
        {!currentUser ? (
          <motion.div
            key="logged-out-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] items-stretch select-none"
          >
            {/* Left side: branding/benefits (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0b0c10] to-[#12131a] border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-64 h-64 text-[#9333EA]" />
              </div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#EC4899] opacity-10 blur-3xl rounded-full"></div>

              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9333EA]/10 border border-[#9333EA]/20 rounded-full text-[9px] text-[#9333EA] font-mono uppercase tracking-widest font-extrabold shadow-sm">
                  <Zap className="w-3.5 h-3.5" /> SECURE JWT SaaS GATEWAY
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white uppercase tracking-wider font-sans leading-none">
                    NEXORA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">PULSE</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    Sua infraestrutura unificada para controle de tráfego orgânico, tráfego pago, robôs autônomos de copywriting e automações Evolution API.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {[
                    { t: "Isolamento Completo Multi-Tenant", d: "Seus dados de pixel, clientes e criativos encriptados em silos Postgres e chaves JWT individuais." },
                    { t: "7 Dias de Experimentação Integral", d: "Teste todos os módulos sem riscos. Cancelamento do checkout a um clique na central do portal." },
                    { t: "Transação Segura Criptografada", d: "Integração direta de sandbox homologada em conformidade com PCI-Compliance." },
                    { t: "Equipe Executiva Dedicada", d: "Relatórios de desvios sazonais heurísticos ativos e alertas diretos em seu WhatsApp corporativo." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="h-6 w-6 rounded-lg bg-[#9333EA]/10 border border-[#9333EA]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-[11.5px] font-bold text-white uppercase tracking-wider">{item.t}</h4>
                        <p className="text-[9.5px] text-white/40 leading-relaxed font-light mt-0.5">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast bypassing simulation buttons */}
              <div className="bg-black/50 border border-white/5 rounded-2xl p-4 mt-8 space-y-3 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#9333EA]" />
                  <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider font-mono">Bypass de Diagnóstico Técnico (Simulado):</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => triggerQuickLogin("admin")}
                    className="p-2 bg-purple-950/20 hover:bg-purple-900/30 border border-purple-800/20 hover:border-purple-600/40 text-[#9333EA] text-[9.5px] font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Admin Master
                  </button>
                  <button
                    onClick={() => triggerQuickLogin("gestor")}
                    className="p-2 bg-pink-950/20 hover:bg-pink-900/30 border border-pink-800/20 hover:border-pink-600/40 text-[#EC4899] text-[9.5px] font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Gestor VIP
                  </button>
                  <button
                    onClick={() => triggerQuickLogin("client")}
                    className="p-2 bg-sky-950/20 hover:bg-sky-900/30 border border-sky-800/20 hover:border-sky-600/40 text-sky-450 text-[9.5px] font-bold rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cliente Trial
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Login or Signup dynamic form (7 cols) */}
            <div className="lg:col-span-7 bg-[#0A0A0C] border border-white/10 rounded-3xl p-8 flex flex-col justify-center relative">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setFormError("");
                    }}
                    className={`pb-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                      authMode === "login"
                        ? "text-white border-b-2 border-[#9333EA]"
                        : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    Efetuar Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("signup");
                      setFormError("");
                    }}
                    className={`pb-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                      authMode === "signup"
                        ? "text-white border-b-2 border-pink-500"
                        : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    Criação de Conta & Trial
                  </button>
                </div>

                <div className="bg-white/5 px-2 px-1.5 py-0.5 rounded-lg border border-white/5 text-[8.5px] font-mono text-white/40">
                  {authMode === "login" ? "PORTA_JWT:8080" : "STRIPE_ROUTER:ACTIVE"}
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p>{formSuccess}</p>
                </div>
              )}

              {/* A. LOGIN MODE */}
              {authMode === "login" && (
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] text-white/55 font-bold uppercase tracking-wider flex items-center gap-1 text-left">
                      <Mail className="w-3.5 h-3.5 text-purple-400" /> Endereço de Email Administrador ou Gestor
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="lucas@nexora.com"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#9333EA] transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[9.5px] text-white/55 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-purple-400" /> Senha Criptografada
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-[9px] text-[#9333EA] hover:underline cursor-pointer font-bold uppercase tracking-wider"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#9333EA] transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShieldCheck className="w-4.5 h-4.5" /> Autenticar e Acessar Workspace
                  </button>

                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[10px] text-white/40">Ou simule login social instantâneo:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const userMatch = usersList[0]; // administrator
                          setCurrentUser(userMatch);
                          addXP(25, "Login social simulado: Google OAuth");
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        Google OAuth
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const userMatch = usersList[1]; // gestor glow
                          setCurrentUser(userMatch);
                          addXP(25, "Login social simulado: Meta OAuth");
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 rounded-xl text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        Meta OAuth
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* B. SIGNUP MODE (COMPREHENSIVE ACCOUNT CREATION WITH BILLING CAPTURE) */}
              {authMode === "signup" && (
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                  <div className="p-3 bg-[#9333EA]/5 border border-[#9333EA]/20 rounded-2xl text-[10px] text-[#9333EA]/90 leading-relaxed font-sans flex items-start gap-2.5">
                    <Info className="w-4.5 h-4.5 shrink-0 text-purple-400 mt-0.5" />
                    <div>
                      <strong className="block font-black uppercase tracking-wide">GARANTIA DE COBRANÇA ZERO DE RECORRÊNCIA NO INÍCIO:</strong>
                      Seu período grátis de 7 dias será iniciado automaticamente. O sandbox do Stripe exige o cadastro do cartão para fins de identificação, mas nenhuma cobrança será liquidada antes de expirados os dias de teste.
                    </div>
                  </div>

                  <form onSubmit={handleClientSignup} className="space-y-4 text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9333EA]">
                      1. Informações Básicas de Acesso
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <User className="w-3 h-3" /> Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ex: Lucas de Souza"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Building className="w-3 h-3" /> Razão / Empresa *
                        </label>
                        <input
                          type="text"
                          required
                          value={regCompanyName}
                          onChange={(e) => setRegCompanyName(e.target.value)}
                          placeholder="Ex: Nexora Digital Ltda"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Mail className="w-3 h-3" /> E-mail Profissional *
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="Ex: nome@empresa.com"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Telefone / WhatsApp *
                        </label>
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="Ex: (11) 98765-4321"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3" /> CPF ou CNPJ da Marca *
                        </label>
                        <input
                          type="text"
                          required
                          value={regDocument}
                          onChange={(e) => setRegDocument(e.target.value)}
                          placeholder="Ex: 12.345.678/0001-99"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Segmento da Empresa
                        </label>
                        <select
                          value={regSegment}
                          onChange={(e) => setRegSegment(e.target.value)}
                          className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
                        >
                          <option value="Varejo & Moda">Varejo & Moda</option>
                          <option value="Cosméticos & Saúde">Cosméticos & Saúde</option>
                          <option value="Imobiliária & Construtora">Imobiliária & Construtora</option>
                          <option value="E-commerce Geral">E-commerce Geral</option>
                          <option value="Fintechs / Tecnologia">Fintechs / Tecnologia</option>
                          <option value="B2B SaaS / Consultorias">B2B SaaS / Consultorias</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Website Oficial (Opcional)
                        </label>
                        <input
                          type="text"
                          value={regWebsite}
                          onChange={(e) => setRegWebsite(e.target.value)}
                          placeholder="https://suaempresa.com"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Instagram className="w-3 h-3" /> Instagram Comercial (Opcional)
                        </label>
                        <input
                          type="text"
                          value={regInstagram}
                          onChange={(e) => setRegInstagram(e.target.value)}
                          placeholder="@comercial_insta"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/45 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Users className="w-3 h-3" /> Quantidade de Colaboradores
                        </label>
                        <select
                          value={regEmployeesCount}
                          onChange={(e) => setRegEmployeesCount(e.target.value)}
                          className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="1-5">1-5 funcionários</option>
                          <option value="6-10">6-10 funcionários</option>
                          <option value="11-50">11-50 funcionários</option>
                          <option value="51-100">51-100 funcionários</option>
                          <option value="+100">+100 funcionários</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Criar Senha de Acesso *
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA] font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1"></div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Confirmar Senha de Acesso *
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9333EA] font-mono"
                        />
                      </div>
                    </div>

                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9333EA] pt-2">
                      2. Validação do Gateway PCI-Stripe (Trial Sandbox)
                    </h3>

                    {/* Integrated Simulated Credit Card Checkout Input */}
                    <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4.5 h-4.5 text-purple-400" />
                          <span className="text-xs text-white font-bold uppercase tracking-wider">Cartão de Crédito Garantia</span>
                        </div>
                        <div className="flex gap-1">
                          {["visa", "master", "elo", "amex"].map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => setCardBrand(brand as any)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider transition-all ${
                                cardBrand === brand
                                  ? "bg-purple-950/40 border-[#9333EA] text-purple-300"
                                  : "bg-black text-white/20 border-white/5"
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[8px] text-white/40 uppercase font-mono block">Número do Cartão</label>
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-black border border-white/5 rounded-lg px-2 text-xs py-1.5 font-mono text-white/80 text-center"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] text-white/40 uppercase font-mono block">Validade</label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/AA"
                              className="w-full bg-black border border-white/5 rounded-lg px-2 text-xs py-1.5 font-mono text-white/80 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1 space-y-1">
                            <label className="text-[8px] text-white/40 uppercase font-mono block">CVV</label>
                            <input
                              type="text"
                              required
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full bg-black border border-white/5 rounded-lg px-2 text-xs py-1.5 font-mono text-white/80 text-center"
                            />
                          </div>
                          <div className="col-span-2 flex items-center pl-2 text-[9px] text-white/40 leading-none">
                            🔒 Encriptado via protocolo de Tokenização Recorrente Stripe.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox of legal documents acceptance */}
                    <div id="wz9l2w" className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#9333EA] focus:ring-[#9333EA] accent-[#9333EA] mt-0.5 cursor-pointer shrink-0"
                      />
                      <p className="text-[9.5px] text-white/50 leading-relaxed font-sans font-medium">
                        Li e aceito os{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setLegalDocType("terms");
                            setShowLegalModal(true);
                          }}
                          className="text-[#9333EA] hover:underline font-bold"
                        >
                          Termos de Uso
                        </button>
                        ,{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setLegalDocType("privacy");
                            setShowLegalModal(true);
                          }}
                          className="text-[#9333EA] hover:underline font-bold"
                        >
                          Política de Privacidade
                        </button>
                        ,{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setLegalDocType("trial");
                            setShowLegalModal(true);
                          }}
                          className="text-[#9333EA] hover:underline font-bold"
                        >
                          Política de Trial
                        </button>
                        ,{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setLegalDocType("saas_contract");
                            setShowLegalModal(true);
                          }}
                          className="text-[#9333EA] hover:underline font-bold"
                        >
                          Contrato SaaS
                        </button>{" "}
                        e as diretrizes de{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setLegalDocType("lgpd");
                            setShowLegalModal(true);
                          }}
                          className="text-[#9333EA] hover:underline font-bold"
                        >
                          Proteção LGPD
                        </button>{" "}
                        da Nexora Pulse.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Criar Workspace Multi-Tenant (Iniciar Trial de 7 Dias)
                    </button>
                  </form>
                </div>
              )}

              {/* C. FORGOT MODE */}
              {authMode === "forgot" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSuccess("Simulação: Ensinamento e refresh de password enviado ao e-mail informado para redefinição segura.");
                    addXP(10, "Disparou fluxo de redefinição de credencial");
                  }}
                  className="space-y-4"
                >
                  <p className="text-xs text-white/55 leading-relaxed font-light mb-4">
                    Insira seu e-mail corporativo cadastrado para receber um token dinâmico de recuperação unificado.
                  </p>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] text-white/55 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-purple-400" /> Endereço de Email Vinculado
                    </label>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="lucas@empresa.com"
                      className="w-full bg-black/55 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#9333EA] font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    Enviar Link de Redefinição Segura
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-[9.5px] text-white/40 hover:text-white uppercase tracking-wider font-bold"
                    >
                      Voltar Prontamente ao Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        ) : onboardingActive ? (
          /* GLORIOUS COHESIVE CLIENT ONBOARDING INTERACTIVE MULTI-STEP WIZARD */
          <motion.div
            key="onboarding-wizard-section"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-[#0A0A0C] border border-white/10 rounded-3xl p-8 space-y-8 select-none shadow-2xl relative"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <span className="bg-[#9333EA]/15 border border-[#9333EA]/20 text-[#9333EA] text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Fase Onboarding
                </span>
                <h2 className="text-lg font-black text-white uppercase tracking-wider mt-1.5">
                  Primeira Sincronização e Configuração Inicial
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-white/40">
                Página {onboardingStep} de 3
              </span>
            </div>

            {/* Stepper indicators */}
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    step <= onboardingStep ? "bg-purple-500" : "bg-white/5"
                  }`}
                />
              ))}
            </div>

            {/* STEP 1: NICHE DETERMINATION */}
            {onboardingStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Defina o Seu Avatar de Audiência Alvo
                  </h3>
                  <p className="text-xs text-white/40 font-light mt-1">
                    A IA unificada da Nexora utilizará este nicho para sintonizar pautas automáticas e calibrações de ROAS.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "papo_venda", l: "Direto ao Ponto (Foco Conversão)", d: "Criativos baseados em gatilhos emocionais ágeis e copies persuasivas fortes." },
                    { val: "conteudo_rico", l: "Inbound Heurístico (Educação)", d: "Posts estéticos longos e de autoridade para público frio e meio do funil." },
                    { val: "meme_engaja", l: "Viral Orgânico (Brand Growth)", d: "Memes de mercado, carrosséis humorísticos e ganchos temporais rápidos." },
                    { val: "depoimento_social", l: "Prova Social (Validação)", d: "Stories e posts simulando cases reais, antes e depois estruturados para converter." }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => {
                        setOnboardingAgentTone(item.val);
                        addXP(10, "Selecionou tom de pauta inicial");
                      }}
                      className={`p-4 border rounded-2xl text-left transition-all ${
                        onboardingAgentTone === item.val
                          ? "bg-purple-950/25 border-[#9333EA] text-white"
                          : "bg-black/35 border-white/5 text-white/55 hover:border-white/10"
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1">{item.l}</span>
                      <span className="text-[9px] text-white/40 leading-relaxed font-light block">{item.d}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Avançar Etapa <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: NETWORK CHANNELS INTEGRATION MOCK */}
            {onboardingStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Sincronizar Suas Fontes de Performance
                  </h3>
                  <p className="text-xs text-white/40 font-light mt-1">
                    Marque os canais ativos ou de anúncios que deseja unificar no dashboard sob o tenant do trial automático.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "instagram", l: "Instagram Business", d: "Sincroniza feed, carrosséis e dados de alcance orgânico diários." },
                    { id: "meta_ads", l: "Meta Business Manager", d: "Rastreamento total de AdSpend, ROAS e CTR de conjuntos de anúncios Meta." },
                    { id: "google_ads", l: "Google Ads Engine", d: "Auditoria ativa de lances por palavra-chave e leads inbound gerados." },
                    { id: "evolution_whatsapp", l: "Evolution API (WhatsApp)", d: "Chatbot de atendimento, fluxos Kanban de e-commerce e nutrição." }
                  ].map((ch) => {
                    const isSelected = onboardingSocialSelection.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setOnboardingSocialSelection((prev) =>
                            isSelected ? prev.filter((x) => x !== ch.id) : [...prev, ch.id]
                          );
                          addXP(10, `Selecionou canal de onboarding: ${ch.id}`);
                        }}
                        className={`p-4 border rounded-2xl text-left transition-all relative ${
                          isSelected
                            ? "bg-pink-950/25 border-pink-500 text-white"
                            : "bg-black/35 border-white/5 text-white/55 hover:border-white/10"
                        }`}
                      >
                        <span className="text-xs font-bold block mb-1">{ch.l}</span>
                        <span className="text-[9px] text-white/45 leading-normal block">{ch.d}</span>
                        {isSelected && (
                          <span className="absolute top-3 right-3 h-4.5 w-4.5 bg-pink-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Avançar Etapa <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONSOLIDATING METRICS */}
            {onboardingStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center py-6 space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Workspace Unificado Pronto!
                    </h3>
                    <p className="text-xs text-white/45 font-light leading-relaxed max-w-md mx-auto mt-1">
                      Todas as engrenagens de segurança, faturamento recorrente Stripe simulado, auditoria PCI-Compliance e silagem do tenant Glow foram configuradas.
                    </p>
                  </div>
                </div>

                <div className="bg-black/55 border border-white/5 rounded-2xl p-4 text-left font-mono text-[10px] text-white/60 space-y-1.5">
                  <div className="text-purple-400 font-bold uppercase mb-1">=== COORDENADAS DO COMPILADOR SaaS ===</div>
                  <div>ID_CONTA: {currentUser.id}</div>
                  <div>STRIPE_CUSTOMER_ID: {currentUser.customerStripeId}</div>
                  <div>STATUS_VERIFICAÇÃO: COMPLIANT_PCI_SSL</div>
                  <div>MOEDAS: BRL (R$) Recorrente</div>
                  <div>ESTADO_TEMPORAL: Trial Ativo (7 dias grátis)</div>
                  <div>COMPLIANCE_JURÍDICO: Termos e LGPD Assinados (OK)</div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={completeOnboardingWizard}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg animate-pulse"
                  >
                    Finalizar Configuração & Entrar no Dashboard <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* MAIN SaaS ACCOUNT DASHBOARD IN WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: User account stats, simulated time manager & current billing portal (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Simulated Time Manipulation Panel / Billing Controller Header */}
              <div className="bg-gradient-to-r from-[#0d0d12] to-[#121319] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Coins className="w-32 h-32 text-pink-500" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#9333EA]/10 border border-[#9333EA]/20 text-[#a855f7] font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest">
                      {currentUser.isCustomAdminTrial ? "ADMIN_TRIAL_ACCOUNT TAG" : "Plano Pro Assinatura"}
                    </span>
                    {currentUser.subscriptionStatus === "active_trial" ? (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest animate-pulse">
                        Fase de Testes
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest">
                        Plano Pago Ativo
                      </span>
                    )}
                  </div>

                  <h3 className="text-white font-black text-sm uppercase tracking-wider font-sans mt-1">
                    Painel do Cliente SaaS & Trial Billing Automático
                  </h3>
                  <p className="text-[10.5px] text-white/50 max-w-xl font-light">
                    {currentUser.subscriptionStatus === "active_trial"
                      ? `Seu trial de 7 dias grátis para a empresa "${currentUser.name}" vencerá em ${7 - currentUser.trialDaysPassed} dias no Stripe. No 7º dia, a IA cobrará R$ 497,00 automaticamente se você não cancelar.`
                      : `Sua assinatura corporativa da marca "${currentUser.companyName}" foi totalmente liquidada pelo Checkout Stripe Sandbox.`}
                  </p>
                </div>

                {/* Simulated Time Incrementor for Audit testing */}
                <div className="bg-black/45 border border-white/5 p-4 rounded-2xl text-center space-y-2.5 shrink-0 w-full md:w-auto">
                  <div className="text-[10px] text-white/60 font-black uppercase tracking-wider flex items-center gap-1.5 justify-center">
                    <Clock className="w-4 h-4 text-[#9333EA]" />
                    Linha do Tempo
                  </div>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-white font-mono leading-none">Dia {currentUser.trialDaysPassed}</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase">/ 7</span>
                  </div>

                  {currentUser.trialDaysPassed < 7 ? (
                    <button
                      onClick={advanceSimulatedDays}
                      className="w-full px-3 py-1.5 bg-[#9333EA]/15 hover:bg-[#9333EA]/30 border border-[#9333EA]/35 text-white text-[9.5px] font-mono rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 font-bold tracking-tight shadow-md"
                    >
                      Avançar 1 Dia Simulado
                    </button>
                  ) : (
                    <span className="block text-[8.5px] text-emerald-400 font-bold bg-emerald-950/20 py-0.5 px-2 rounded border border-emerald-500/20 font-mono">
                      TESTE E COBRANÇA DE TRIAL OK
                    </span>
                  )}
                </div>
              </div>

              {/* Subscribed Plan details, Stripe Checkout Card simulation & cancel buttons details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Sua Assinatura & Consumo Stripe
                    </h4>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Gerencie limites de API, cancelamento de renovações recorrentes e faça backups rápidos caso decida migrar.
                    </p>
                  </div>

                  <div className="space-y-2.5 font-sans">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                      <span className="text-white/50">CustomerID Stripe:</span>
                      <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded text-[10px]">
                        {currentUser.customerStripeId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                      <span className="text-white/50">Plano Alvo de Conversão:</span>
                      <span className="text-purple-400 font-bold uppercase text-[10px]">
                        {currentUser.plan === "enterprise" ? "Gestão VIP Completa" : currentUser.plan === "premium" ? "Autogerenciamento Pro" : "Starter Lite"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                      <span className="text-white/50">Recorrência Mensal padrão:</span>
                      <span className="text-white font-bold text-[10.5px]">
                        {currentUser.plan === "enterprise" ? "R$ 1.997 /mês" : currentUser.plan === "premium" ? "R$ 497 /mês" : "R$ 197 /mês"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/50">Status Cobrança de Renovação:</span>
                      {currentUser.subscriptionStatus === "active_trial" ? (
                        <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/10 px-2 py-0.5 rounded text-[10px]">
                          Pendente p/ Dia 7
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                          Cobrado & Quitado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const confirmCancel = window.confirm("Você realmente deseja simular o cancelamento da assinatura recorrente no Stripe?");
                        if (confirmCancel) {
                          const updated = { ...currentUser, subscriptionStatus: "canceled" as const };
                          setCurrentUser(updated);
                          setUsersList(prev => prev.map(u => u.id === currentUser.id ? updated : u));
                          addXP(50, "Simulou cancelamento de trial");
                          
                          const systemLog: AuditLog = {
                            id: `cancel-${Date.now()}`,
                            user: currentUser.name,
                            action: "Cancelou renovação da assinatura Stripe",
                            tenant: currentUser.companyName,
                            timestamp: new Date().toISOString(),
                            status: "warning"
                          };
                          setAuditLogs(prev => [systemLog, ...prev]);
                        }
                      }}
                      disabled={currentUser.subscriptionStatus === "canceled"}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 transition-all text-center uppercase"
                    >
                      {currentUser.subscriptionStatus === "canceled" ? "Cancelada Recorrência" : "Cancelar Assinatura"}
                    </button>

                    <button
                      onClick={() => {
                        alert("Redirecionando de forma encriptada para o Billing Portal Stripe Real...");
                        addXP(20, "Handshake de segurança com Billing Portal Stripe");
                      }}
                      className="flex-1 py-1.5 bg-purple-600/15 hover:bg-purple-600/35 border border-purple-500/25 text-purple-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center uppercase"
                    >
                      Mudar Forma Pagamento
                    </button>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Histórico de Recibos & Faturas (Invoices)
                    </h4>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Faturas do sandbox PCI liquidadas via Stripe automatizado. Baixe recibos completos.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {simulatedInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-2.5 bg-black/45 rounded-xl border border-white/5 flex items-center justify-between text-xs font-sans hover:border-white/15 transition-all"
                      >
                        <div className="text-left">
                          <span className="text-white/70 block text-[10.5px] font-bold">{inv.id}</span>
                          <span className="text-white/30 text-[9px] font-mono">Processamento: {inv.date}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-white font-mono font-bold">{inv.amount}</span>
                          <span className="bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-1.5 rounded text-[8px] uppercase">
                            {inv.status}
                          </span>
                          <button
                            onClick={() => {
                              setShowInvoiceDownloadId(inv.id);
                              addXP(15, `Baixou em PDF recibo fiscal de faturamento: ${inv.id}`);
                            }}
                            className="bg-white/5 border border-white/10 text-white/60 p-1.5 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legal documents fast viewer section */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-purple-400" />
                      Documentação de Conformidade Jurídica LGPD/PCI
                    </h4>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Leia as salvaguardas legais do software e as proteções regulatórias de faturamento recorrente.
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] px-2.5 py-0.5 rounded font-mono uppercase">
                    Auditada Legalmente
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {[
                    { id: "terms", l: "Termos Gerais" },
                    { id: "privacy", l: "Privacidade e Cookie" },
                    { id: "trial", l: "Regras Trial" },
                    { id: "cancel", l: "Cancelamentos" },
                    { id: "saas_contract", l: "Contrato SaaS" },
                    { id: "lgpd", l: "Termo LGPD" }
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setLegalDocType(doc.id as any);
                        setShowLegalModal(true);
                        addXP(10, `Visualizou termo jurídico de proteção: ${doc.l}`);
                      }}
                      className="px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white text-[10px] rounded-xl font-sans transition-all cursor-pointer text-center font-semibold"
                    >
                      {doc.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Notifications, Emails & WhatsApp auto-delivered simulations LOGS (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Auto Delivered Notifications timeline log */}
              <div className="bg-[#0B0B0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[460px]">
                <div className="bg-[#121216] border-b border-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/85 font-bold uppercase tracking-wider">Simulador de Avisos Automatizados</span>
                  </div>
                  <span className="bg-emerald-500 text-white font-bold text-[8px] font-mono px-1.5 py-0.5 rounded">
                    WEBHOOK_ACTIVE
                  </span>
                </div>

                <div className="p-4 bg-black/45 space-y-1 text-left border-b border-white/5">
                  <span className="text-[9px] text-[#9333EA] font-extrabold uppercase tracking-widest block font-mono">NOTIFICAÇÕES DE CLIENTE</span>
                  <p className="text-[9.5px] text-white/40 font-light leading-normal">
                    Veja na linha do tempo as notificações disparadas por Email, WhatsApp e Painel de acordo com o avançar dos dias do Trial grátis.
                  </p>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[350px]">
                  {notificationLogs.map((log, idx) => {
                    const isWa = log.origin === "WhatsApp";
                    const isEm = log.origin === "E-mail";

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl text-left border relative overflow-hidden transition-all hover:border-white/15 ${
                          isWa
                            ? "bg-emerald-950/20 border-emerald-500/20 hover:bg-emerald-950/35"
                            : isEm
                            ? "bg-purple-950/15 border-purple-500/10 hover:bg-purple-950/25"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5 mb-1.5 font-sans">
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isWa
                              ? "bg-emerald-500/15 text-emerald-400"
                              : isEm
                              ? "bg-purple-500/15 text-purple-400"
                              : "bg-white/5 text-white/45"
                          }`}>
                            {log.origin} • {log.time}
                          </span>
                          <span className="text-[9px] text-white/30 font-semibold">Entregue</span>
                        </div>

                        <h5 className="text-[10.5px] font-bold text-white uppercase tracking-tight">{log.title}</h5>
                        <p className="text-[9.5px] text-white/50 leading-relaxed font-light mt-1 whitespace-pre-line font-medium">{log.body}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#121216] border-t border-white/5 p-4 text-center">
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      onSelectTab("dashboard");
                      addXP(10, "Efetuou logout seguro da conta SaaS");
                    }}
                    className="w-full py-2 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/25 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Power className="w-3.5 h-3.5" /> Efetuar Logout e Voltar ao Início
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER MODAL OF LEGAL COMPLIANCE DOCUMENTS WITH ALL TRANSCRIPTIONS */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-[#0B0C10] border border-white/15 rounded-3xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="bg-[#121318] border-b border-white/10 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-black text-xs uppercase tracking-wider">
                    {legalDocType === "terms" && "Termos de Uso e Serviço Nexora Pulse"}
                    {legalDocType === "privacy" && "Diretriz de Cookie e Privacidade de Silos"}
                    {legalDocType === "trial" && "Regulamento e Acordo de Trial 7 Dias"}
                    {legalDocType === "cancel" && "Política e Termos de Cancelamento Stripe Recorrente"}
                    {legalDocType === "saas_contract" && "Contrato Padrão de Licenciamento SaaS Master"}
                    {legalDocType === "lgpd" && "Parâmetro Legal LGPD de Proteção de Dados Comerciais"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLegalModal(false)}
                  className="p-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                >
                  <X className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Legal Text content based on type */}
              <div className="p-6 overflow-y-auto text-left text-xs text-white/70 leading-relaxed font-sans font-normal space-y-4 select-text">
                {legalDocType === "terms" && (
                  <>
                    <h4 className="font-bold text-white uppercase text-[11px]">1. OBJETO E ACEITAÇÃO DO SERVIÇO</h4>
                    <p>O presente instrumento regulamenta a licença temporária, revogável e não-exclusiva do ecossistema Nexora Pulse para fins de monitoramento e agendamento de posts. Ao prosseguir, você concorda que o software opera como ferramenta analítica.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">2. DIRETRIZ MULTI-TENANT E SILOS</h4>
                    <p>Cada conta gerada estabelece um silo de armazenamento protegido por criptografia de sessão. É proibido qualquer engenharia de fraude com o intuito de transpor privilégios operacionais.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">3. GASTOS E ORÇAMENTOS DE TRÁFEGO PAGO</h4>
                    <p>A Nexora fornece integrações de controle mas não responde pelas alterações de cobrança executadas nas contas diretas de anúncios do Meta e de Google Ads.</p>
                  </>
                )}

                {legalDocType === "privacy" && (
                  <>
                    <h4 className="font-bold text-white uppercase text-[11px]">1. PROTEÇÃO INTEGRAL DE SESSÃO JWT</h4>
                    <p>Seus dados de credenciais, chaves secretas de APIs e faturamento Stripe estão gravados sob padrões rígidos. Coletamos apenas informações fornecidas de forma voluntária no sign-up corporativo.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">2. POLÍTICA DE COOKIES INTELIGENTES</h4>
                    <p>Utilizamos cookies estritamente necessários para viabilizar a alternância de tenant sem vazamento de dados. Não vendemos bases de leads processadas no Kanban de atendimento.</p>
                  </>
                )}

                {legalDocType === "trial" && (
                  <>
                    <h4 className="font-bold text-white uppercase text-[11px]">1. FUNCIONAMENTO DO TRIAL DE 7 DIAS GRÁTIS</h4>
                    <p>Todo novo cadastro usufrui automaticamente de 7 dias inteiros para testes dos módulos integrados. Nenhuma retenção ou faturamento de moedas ocorre no início do trial.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">2. CAPTURA SEGURO DO MEIO DE PAGAMENTO</h4>
                    <p>A indexação de um cartão válido é exigida para evitar abuso de contas descartáveis. Ao final do 7º dia do ciclo experimental, o Stripe executará a renovação automática para o plano Pro, salvo cancelamento prévio.</p>
                  </>
                )}

                {legalDocType === "cancel" && (
                  <>
                    <h4 className="font-bold text-white uppercase text-[11px]">1. POLÍTICA DE CANCELAMENTO SEM BUROCRACIA</h4>
                    <p>O usuário poderá suspender a renovação do seu plano a qualquer instante em um piscar de olhos, diretamente na área "Minha Assinatura" ou do botão Cancelar Assinatura acima.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">2. REEMBOLSO E ESTORNO</h4>
                    <p>Garantia incondicional de reembolso por arrependimento conforme o Código de Defesa do Consumidor caso pleiteado em até 7 dias após a primeira conversão de trial.</p>
                  </>
                )}

                {legalDocType === "saas_contract" && (
                  <>
                    <h4 className="font-bold text-white uppercase text-[11px]">CLÁUSULA 1 - CONCESSÃO DE USO PROPORCIONAL</h4>
                    <p>O licenciamento SaaS vigora sob recorrência mensal. O descumprimento dos pagamentos no Stripe após tentativas automatizadas suspende o acesso ao Workspace imediatamente, preservando a base de dados em backup seguro por 60 dias.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">CLÁUSULA 2 - PROTEÇÃO DAS MARCAS E TENANTS</h4>
                    <p>Cada tenant isola suas chaves, permitindo controle granulado a gestores externos.</p>
                  </>
                )}

                {legalDocType === "lgpd" && (
                  <>
                    <h4 className="font-bold text-white uppercase text-[11px]">1. PRIVACIDADE DE LEADS EM KANBAN (CONFORMIDADE LGPD)</h4>
                    <p>As informações de leads injetadas pelo simulador ou webhooks (Nome, Email, WhatsApp) são estritamente confidenciais e usadas unicamente para o fluxo comercial interno, sob controle do próprio controlador de dados cliente.</p>
                    <h4 className="font-bold text-white uppercase text-[11px]">2. DIREITO DE ANULAÇÃO E EXCLUSÃO</h4>
                    <p>A qualquer momento o cliente final ou o gestor poderá expurgar em definitivo qualquer registro do banco de dados, invocando a eliminação integral de logs associados.</p>
                  </>
                )}
              </div>

              <div className="bg-[#121318] p-4 border-t border-white/10 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLegalModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-black cursor-pointer"
                >
                  Compreendi e Aceito
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER CUSTOM STRIPE INVOICE RECEIPT PDF MODAL SIMULATION */}
      <AnimatePresence>
        {showInvoiceDownloadId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-white border border-gray-300 rounded-3xl p-8 max-w-lg w-full text-black font-sans space-y-6 select-text"
            >
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div className="text-left">
                  <h3 className="text-lg font-black text-gray-900 leading-none">NEXORA PULSE LTDA</h3>
                  <p className="text-[10px] text-gray-500 mt-1">CNPJ: 12.345.678/0001-99<br />São Paulo - SP, CEP: 04533-000</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] px-2.5 py-0.5 rounded font-mono uppercase">
                    Fatura Paga
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono font-bold">RECIBO: {showInvoiceDownloadId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-left">
                <div>
                  <strong className="block text-[9px] text-gray-400 uppercase">Faturado para:</strong>
                  <p className="font-bold text-gray-800">{currentUser?.name}</p>
                  <p className="text-gray-500 text-[10.5px] leading-relaxed">{currentUser?.companyName}<br />Documento/Doc: {currentUser?.document}</p>
                </div>
                <div className="text-right">
                  <strong className="block text-[9px] text-gray-400 uppercase text-right">Método de faturamento:</strong>
                  <p className="font-bold text-gray-800">Cartão Stripe final {cardNumber.slice(-4)}</p>
                  <p className="text-gray-500 text-[10.5px]">Processado via Sandbox webhook</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[9px] font-bold uppercase">
                    <tr>
                      <th className="p-3">Descrição da Licença SaaS</th>
                      <th className="p-3 text-right">Preço</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-3">
                        <span className="font-bold text-gray-800">Plano Autogerenciamento Pro Recorrente</span>
                        <p className="text-[9px] text-gray-400">Assinatura mensal do software Pulse integrado a inteligência generativa e Evolution API.</p>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">R$ 497,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <span className="text-xs font-bold text-gray-500">Valor Total Liquidado:</span>
                <span className="text-lg font-black text-gray-900 font-mono">R$ 497,00</span>
              </div>

              <p className="text-[9px] text-gray-400 leading-normal text-center bg-gray-50/50 p-2.5 rounded-lg border border-dashed border-gray-200">
                🔒 Certificamos para todos os fins fiscais de que a cobrança foi liquidada sob sandbox com sucesso nas dependências do gateway seguro de faturamento Stripe.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceDownloadId(null)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
