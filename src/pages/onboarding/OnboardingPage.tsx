import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, Circle, ArrowRight, ArrowLeft, Building2,
  Facebook, Chrome, MessageCircle, Megaphone, Bot, BarChart3, Zap
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../hooks/useApi";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Cadastro",
    description: "Sua conta está criada",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "from-green-600 to-emerald-600",
  },
  {
    id: 2,
    title: "Empresa",
    description: "Configure sua empresa",
    icon: <Building2 className="w-5 h-5" />,
    color: "from-purple-600 to-indigo-600",
  },
  {
    id: 3,
    title: "Meta Ads",
    description: "Conecte o Meta Business",
    icon: <Facebook className="w-5 h-5" />,
    color: "from-blue-600 to-blue-700",
    optional: true,
  },
  {
    id: 4,
    title: "Google Ads",
    description: "Conecte o Google Ads",
    icon: <Chrome className="w-5 h-5" />,
    color: "from-red-600 to-orange-600",
    optional: true,
  },
  {
    id: 5,
    title: "WhatsApp",
    description: "Conecte o WhatsApp Business",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "from-green-600 to-green-700",
    optional: true,
  },
  {
    id: 6,
    title: "1ª Campanha",
    description: "Crie sua primeira campanha",
    icon: <Megaphone className="w-5 h-5" />,
    color: "from-pink-600 to-rose-600",
  },
  {
    id: 7,
    title: "1ª Análise IA",
    description: "Converse com um Agente IA",
    icon: <Bot className="w-5 h-5" />,
    color: "from-amber-600 to-yellow-600",
  },
];

function StepIndicator({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                step.id < current
                  ? "bg-green-600 text-white"
                  : step.id === current
                  ? `bg-gradient-to-br ${step.color} text-white shadow-lg`
                  : "bg-white/5 text-white/20 border border-white/10"
              }`}
            >
              {step.id < current ? <CheckCircle className="w-4 h-4" /> : <span className="text-[10px] font-black">{step.id}</span>}
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-wider hidden sm:block ${
              step.id === current ? "text-white/80" : "text-white/20"
            }`}>{step.title}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 md:w-12 h-px mx-1 ${step.id < current ? "bg-green-600/50" : "bg-white/5"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Step2Company({ onNext }: { onNext: (data: Record<string, string>) => void }) {
  const { patch } = useApi();
  const [form, setForm] = useState({ name: "", niche: "", timezone: "America/Sao_Paulo", language: "pt-BR" });
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    setSaving(true);
    await patch("/tenant", form);
    onNext(form);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">Configure sua empresa</h2>
        <p className="text-xs text-white/40 mt-1">Personalize a plataforma com as informações do seu negócio</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">Nome da Empresa*</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Minha Agência Digital"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">Segmento / Nicho</label>
          <select
            value={form.niche}
            onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="" className="bg-[#0A0A0F]">Selecione o segmento</option>
            {["E-commerce", "Agência Digital", "SaaS / Tech", "Imobiliário", "Saúde & Bem-Estar", "Educação", "Varejo", "Serviços", "Outro"].map((n) => (
              <option key={n} value={n} className="bg-[#0A0A0F]">{n}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleNext}
        disabled={!form.name.trim() || saving}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-sm py-3.5 rounded-xl transition-colors"
      >
        {saving ? "Salvando..." : "Continuar"} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function StepIntegration({ title, description, icon, color, provider, onNext, onSkip }: {
  title: string; description: string; icon: React.ReactNode; color: string;
  provider: string; onNext: () => void; onSkip: () => void;
}) {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnected(true);
    setTimeout(onNext, 1200);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">{title}</h2>
        <p className="text-xs text-white/40 mt-1">{description}</p>
      </div>
      <div className={`bg-gradient-to-br ${color} p-px rounded-2xl`}>
        <div className="bg-[#080810] rounded-[calc(1rem-1px)] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{provider}</p>
              <p className="text-[10px] text-white/40">Integração via OAuth 2.0</p>
            </div>
            {connected && (
              <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                Conectado!
              </div>
            )}
          </div>
          <div className="space-y-2 text-[10px] text-white/40">
            <p>✓ Sincronização automática de dados</p>
            <p>✓ Importação de campanhas ativas</p>
            <p>✓ Tracking em tempo real</p>
          </div>
          {!connected && (
            <button
              onClick={handleConnect}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${color} text-white font-black text-sm py-3 rounded-xl transition-opacity hover:opacity-90`}
            >
              Conectar {provider}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <button onClick={onSkip} className="w-full text-xs text-white/30 hover:text-white/50 transition-colors">
        Pular por enquanto →
      </button>
    </div>
  );
}

function Step6Campaign({ onNext }: { onNext: () => void }) {
  const { post } = useApi();
  const [form, setForm] = useState({ name: "", platform: "meta", budget: "", objective: "leads" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await post("/campaigns", { ...form, budget: parseFloat(form.budget) || 100 });
    setSaved(true);
    setSaving(false);
    setTimeout(onNext, 1200);
  };

  if (saved) return (
    <div className="text-center py-8 space-y-4">
      <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
      <p className="text-lg font-black text-white">Campanha criada!</p>
      <p className="text-xs text-white/40">Você acabou de criar sua primeira campanha.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">Crie sua primeira campanha</h2>
        <p className="text-xs text-white/40 mt-1">Configure uma campanha de tráfego pago</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">Nome da campanha*</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Campanha Lançamento Julho"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">Plataforma</label>
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {["meta", "google", "tiktok", "linkedin"].map((p) => (
                <option key={p} value={p} className="bg-[#0A0A0F] capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">Orçamento/dia (R$)</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="100"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleCreate}
        disabled={!form.name.trim() || saving}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-sm py-3.5 rounded-xl transition-colors"
      >
        {saving ? "Criando..." : "Criar Campanha"} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Step7AI({ onFinish }: { onFinish: () => void }) {
  const { post } = useApi();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await post<{ result: string }>("/ai/agent", {
      agentType: "general",
      tenantName: user?.name ?? "Cliente",
      tenantData: {},
      userInput: prompt,
    });
    setResponse(res.data?.result ?? "Resposta não disponível.");
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">Converse com um Agente IA</h2>
        <p className="text-xs text-white/40 mt-1">Faça sua primeira pergunta ao assistente de marketing</p>
      </div>
      {!done ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/20 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-400">Sugestões</p>
            {["Quais são as melhores estratégias de tráfego pago para e-commerce?", "Como criar um funil de vendas eficiente?", "Dicas para aumentar o ROAS das minhas campanhas"].map((s) => (
              <button key={s} onClick={() => setPrompt(s)} className="block w-full text-left text-xs text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg px-3 py-2 transition-all">
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Faça uma pergunta de marketing..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
          <button
            onClick={handleAsk}
            disabled={!prompt.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-sm py-3.5 rounded-xl transition-colors"
          >
            {loading ? "Consultando IA..." : "Perguntar ao Agente IA"} <Bot className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#0D0D18] border border-purple-500/20 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-2">Resposta do Agente</p>
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{response.slice(0, 500)}{response.length > 500 ? "..." : ""}</p>
          </div>
          <button
            onClick={onFinish}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black text-sm py-3.5 rounded-xl transition-colors"
          >
            Concluir Onboarding <Zap className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const navigate = useNavigate();

  const completeStep = (stepId: number) => {
    setCompletedSteps((prev) => [...prev, stepId]);
    if (stepId < 7) setCurrentStep(stepId + 1);
  };

  const finish = () => navigate("/app/dashboard");

  const progressPercent = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">N</div>
          <h1 className="text-2xl font-black text-white">Bem-vindo à Nexora Pulse!</h1>
          <p className="text-sm text-white/40 mt-1">Configure sua plataforma em poucos passos</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/40 font-bold uppercase tracking-wider">Progresso</span>
            <span className="text-purple-400 font-black">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Step indicators */}
        <StepIndicator steps={STEPS} current={currentStep} />

        {/* Step content */}
        <div className="bg-[#0A0A0F] border border-white/8 rounded-2xl p-7">
          {currentStep === 2 && <Step2Company onNext={() => completeStep(2)} />}
          {currentStep === 3 && (
            <StepIntegration
              title="Conectar Meta Ads"
              description="Sincronize suas campanhas do Facebook e Instagram Ads"
              icon={<Facebook className="w-6 h-6" />}
              color="from-blue-600 to-blue-700"
              provider="Meta Business Suite"
              onNext={() => completeStep(3)}
              onSkip={() => completeStep(3)}
            />
          )}
          {currentStep === 4 && (
            <StepIntegration
              title="Conectar Google Ads"
              description="Sincronize campanhas de Search, Display e YouTube"
              icon={<Chrome className="w-6 h-6" />}
              color="from-red-600 to-orange-600"
              provider="Google Ads Manager"
              onNext={() => completeStep(4)}
              onSkip={() => completeStep(4)}
            />
          )}
          {currentStep === 5 && (
            <StepIntegration
              title="Conectar WhatsApp"
              description="Automatize mensagens e gerencie conversas com leads"
              icon={<MessageCircle className="w-6 h-6" />}
              color="from-green-600 to-green-700"
              provider="WhatsApp Business API"
              onNext={() => completeStep(5)}
              onSkip={() => completeStep(5)}
            />
          )}
          {currentStep === 6 && <Step6Campaign onNext={() => completeStep(6)} />}
          {currentStep === 7 && <Step7AI onFinish={finish} />}
        </div>

        <button onClick={finish} className="text-xs text-white/20 hover:text-white/40 transition-colors block text-center mx-auto">
          Pular configuração e ir para o dashboard →
        </button>
      </div>
    </div>
  );
}
