import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, Mail, Lock, User, Building2, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth, UserPlan } from "../contexts/AuthContext";

const PLANS: { id: UserPlan; name: string; price: string; features: string[] }[] = [
  {
    id: "basic",
    name: "Basic",
    price: "R$ 197/mês",
    features: ["Social Media Manager", "Marketplace de Templates", "1 usuário"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 497/mês",
    features: ["Tudo do Basic", "AI Agents", "Traffic Manager", "CRM + WhatsApp", "Nexora Sites", "5 usuários"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "R$ 1.997/mês",
    features: ["Tudo do Premium", "Admin Cockpit", "White Label", "Usuários ilimitados", "API Access"],
  },
];

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>("premium");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (formData.password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        plan: selectedPlan,
      });
      if (result.success) {
        navigate("/app/dashboard", { replace: true });
      } else {
        setError(result.error ?? "Falha ao criar conta.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Nexora Pulse</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              s === step ? "bg-purple-600 text-white" : s < step ? "bg-purple-600/30 text-purple-400" : "bg-white/5 text-gray-500"
            }`}>
              {s < step ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 2 && <div className={`w-12 h-0.5 transition-all ${s < step ? "bg-purple-600" : "bg-white/10"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full max-w-xl">
        {step === 1 ? (
          /* Step 1 — Choose Plan */
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Escolha seu plano</h1>
              <p className="text-gray-400">15 dias grátis. Cancele quando quiser.</p>
            </div>

            <div className="space-y-3 mb-6">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    selectedPlan === plan.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/10 bg-white/3 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPlan === plan.id ? "border-purple-500" : "border-gray-600"
                      }`}>
                        {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                      </div>
                      <span className="font-semibold text-white">{plan.name}</span>
                      {plan.id === "premium" && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Popular</span>
                      )}
                    </div>
                    <span className="text-purple-400 font-medium">{plan.price}</span>
                  </div>
                  <div className="ml-7 flex flex-wrap gap-2">
                    {plan.features.map((f) => (
                      <span key={f} className="text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" /> {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              Continuar com {PLANS.find((p) => p.id === selectedPlan)?.name}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Step 2 — Account Info */
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Criar sua conta</h1>
              <p className="text-gray-400">Plano <span className="text-purple-400 font-medium">{PLANS.find((p) => p.id === selectedPlan)?.name}</span> selecionado</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                      placeholder="Nome da empresa"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="seu@empresa.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Mín. 8 caracteres"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Criar conta grátis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Ao criar sua conta, você concorda com os{" "}
                <span className="text-purple-400 cursor-pointer">Termos de Uso</span> e a{" "}
                <span className="text-purple-400 cursor-pointer">Política de Privacidade</span>.
              </p>
            </form>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar para escolha de plano
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <span className="text-gray-400 text-sm">Já tem conta? </span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
