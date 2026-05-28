import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Laptop, 
  Smartphone, 
  Grid, 
  Sparkles, 
  Eye, 
  Settings, 
  Check, 
  FileText, 
  Copy, 
  ArrowLeft, 
  LineChart, 
  Activity, 
  ChevronRight, 
  Save, 
  Users, 
  RefreshCw 
} from "lucide-react";

interface NexoraSitesBuilderProps {
  currentTenant: { id: string; name: string; niche: string };
  addXP: (amount: number, reason: string) => void;
}

export default function NexoraSitesBuilder({ currentTenant, addXP }: NexoraSitesBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<"saas" | "lp" | "capture" | "ecommerce">("lp");
  const [pageTitle, setPageTitle] = useState(`${currentTenant.name} - Plataforma Oficial`);
  const [pageSubtitle, setPageSubtitle] = useState("Simplificando sua experiência com o poder da automação inteligente.");
  const [ctaText, setCtaText] = useState("Iniciar Teste Grátis");
  const [accentColor, setAccentColor] = useState<"purple" | "pink" | "emerald" | "amber">("purple");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [formFields, setFormFields] = useState<string[]>(["Nome", "WhatsApp", "E-mail"]);
  const [customHtml, setCustomHtml] = useState("");
  const [viewMode, setViewMode] = useState<"design" | "analytics">("design");
  const [activeStep, setActiveStep] = useState(1);

  // Simulated Analytics
  const [siteVisits, setSiteVisits] = useState(1420);
  const [conversions, setConversions] = useState(247);
  const [conversionRate, setConversionRate] = useState("17.4%");

  const handleGenerateWithAI = () => {
    setPageTitle(`A Nova Era de ${currentTenant.name}`);
    setPageSubtitle(`A solução definitiva de alta performance para o nicho de ${currentTenant.niche}. Sincronize com o WhatsApp Hub e otimize suas vendas.`);
    setCtaText("Garanta Acesso Exclusivo");
    addXP(60, "Utilizou Copilot IA para estruturar copy da Landing Page");
  };

  const handleSavePage = () => {
    addXP(100, `Hospedou Landing Page em nexorapulse.com/${currentTenant.id || "live"}`);
    alert(`Landing page "nexorapulse.com/${currentTenant.id || "live"}" hospedada na borda Cloudflare Edge com sucesso!`);
  };

  const templates = {
    saas: {
      name: "SaaS Premium Stack",
      desc: "Ideal para portfólios recorrentes e apresentação de planos de assinatura."
    },
    lp: {
      name: "Conversão Estrita Direct",
      desc: "Excelente para campanhas de WhatsApp e tráfego frio."
    },
    capture: {
      name: "Captura de Leads (Ebook/Vídeo)",
      desc: "Focado em capturar dados para nutrição imediata e disparos automáticos."
    },
    ecommerce: {
      name: "Splash E-commerce Minimalista",
      desc: "Design de destaque para produtos físicos com checkout direto."
    }
  };

  return (
    <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-6 animate-fade-in" id="nexora-sites-workspace">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-pink-950/80 border border-pink-800/60 text-[10px] text-pink-300 font-extrabold uppercase flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></span>
            Nexora Sites & Landing Pages (Beta Módulo)
          </span>
          <h2 className="text-xl font-black text-white mt-1 uppercase tracking-wider">Criação de Redes de Alta Conversão</h2>
          <p className="text-xs text-white/50">Crie, monetize e publique websites inteligentes com o Copilot IA corporativo.</p>
        </div>

        <div className="flex bg-neutral-900 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setViewMode("design")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "design" ? "bg-purple-900/60 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Construtor Visual
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "analytics" ? "bg-purple-900/60 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" /> Analytics LP
          </button>
        </div>
      </div>

      {viewMode === "design" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CONTROLS PANELS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Base Template */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Passo 1: Estrutura & Template</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(templates).map(([key, value]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedTemplate(key as any);
                      addXP(15, `Alterou template para ${value.name}`);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedTemplate === key
                        ? "bg-[#9333EA]/15 border-purple-500/70 shadow-[0_4px_12px_rgba(147,51,234,0.1)]"
                        : "bg-white/5 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className="block text-xs font-bold text-white truncate">{value.name}</span>
                    <span className="block text-[10px] text-white/40 mt-1 leading-snug">{value.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Content Tuning */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Passo 2: Copywriting & Estilo</span>
                <button
                  onClick={handleGenerateWithAI}
                  className="px-2.5 py-1 bg-gradient-to-r from-purple-800 to-pink-800 text-[10px] text-white rounded-lg flex items-center gap-1 hover:brightness-110 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Copilot IA Copy
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Título Display</label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Subtítulo de Apoio</label>
                  <textarea
                    rows={2}
                    value={pageSubtitle}
                    onChange={(e) => setPageSubtitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Chamada para Ação (CTA)</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Tema Chromático</label>
                    <select
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value as any)}
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="purple">🔮 Neon Purple</option>
                      <option value="pink">🔥 Intense Magenta</option>
                      <option value="emerald">💚 Emerald Glow</option>
                      <option value="amber">🧡 Solar Gold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Global Deployment Trigger */}
            <div className="bg-gradient-to-br from-[#121218] to-black border border-purple-500/20 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hospedagem Instantânea Serverless</h4>
                <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
                  Damos deploy automático da sua página na rede global Cloudflare Pages. Domínio customizável SSL ativo em menos de 3 segundos.
                </p>
              </div>

              <button
                onClick={handleSavePage}
                className="w-full py-3 bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:opacity-95 rounded-xl text-white text-xs font-black uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Publicar Landing Page (+100 XP)
              </button>
            </div>

          </div>

          {/* VISUAL REALTIME PREVIEW FRAME */}
          <div className="lg:col-span-7 flex flex-col bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px]">
            {/* Top Browser bar mock */}
            <div className="bg-[#0C0C0E] px-4 py-3 border-b border-white/15 flex justify-between items-center text-xs text-white/40">
              <div className="flex items-center gap-1.5 select-none text-[8px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              </div>

              <div className="w-1/2 bg-black/40 rounded-lg px-3 py-1 text-center font-mono border border-white/5 truncate max-w-xs text-[9px] text-white/60">
                🌐 https://nexorapulse.com/{currentTenant.id || "live"}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-1 rounded ${deviceMode === "desktop" ? "bg-white/10 text-white" : "hover:text-white"}`}
                  title="Modo Desktop"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-1 rounded ${deviceMode === "mobile" ? "bg-white/10 text-white" : "hover:text-white"}`}
                  title="Modo Mobile"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Live Frame Arena */}
            <div className="flex-1 bg-[#050505] p-6 overflow-y-auto flex items-center justify-center relative min-h-[400px]">
              <div
                className={`transition-all duration-300 rounded-2xl w-full border border-white/5 shadow-2xl overflow-hidden bg-black flex flex-col justify-between relative ${
                  deviceMode === "mobile" ? "max-w-[340px] aspect-[9/16]" : "max-w-full min-h-[380px]"
                }`}
              >
                {/* Background ambient light inside preview */}
                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-25 -z-10 ${
                  accentColor === "purple" ? "bg-[#9333EA]" : 
                  accentColor === "pink" ? "bg-[#EC4899]" :
                  accentColor === "emerald" ? "bg-emerald-500" : "bg-amber-500"
                }`} />

                {/* Navbar mock inside website preview */}
                <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center text-[10px] text-white/70">
                  <div className="font-bold flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${
                      accentColor === "purple" ? "bg-[#9333EA]" : 
                      accentColor === "pink" ? "bg-[#EC4899]" :
                      accentColor === "emerald" ? "bg-emerald-500" : "bg-amber-500"
                    }`} />
                    {currentTenant.name}
                  </div>
                  <div className="flex gap-2 text-white/40">
                    <span>Sobre</span>
                    <span>Benefícios</span>
                    <span className="text-white hover:underline cursor-pointer">Apenas Agora</span>
                  </div>
                </div>

                {/* High Converting Content blocks inside preview */}
                <div className="p-6 text-center space-y-4 my-auto">
                  <span className={`text-[8px] sm:text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                    accentColor === "purple" ? "text-purple-300 bg-purple-950/20 border-purple-900/40" : 
                    accentColor === "pink" ? "text-pink-300 bg-pink-950/20 border-pink-900/40" :
                    accentColor === "emerald" ? "text-emerald-300 bg-emerald-950/20 border-emerald-900/40" : 
                    "text-amber-300 bg-amber-950/20 border-amber-900/40"
                  }`}>
                    🚀 Lançamento Oficial do {currentTenant.niche}
                  </span>

                  <h3 className="text-base sm:text-xl font-black text-white leading-tight font-sans">
                    {pageTitle || "Seu Título Atrativo Principal"}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-white/60 leading-relaxed max-w-md mx-auto font-light">
                    {pageSubtitle || "Descreva resumidamente os benefícios do seu produto ou serviço para atrair mais prospects."}
                  </p>

                  {/* Form fields mockup if Lead capture template is enabled */}
                  {selectedTemplate === "capture" && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 max-w-xs mx-auto space-y-2">
                      <input
                        type="text"
                        disabled
                        placeholder="Nome Completo"
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-[8px] text-white/70 focus:outline-none"
                      />
                      <input
                        type="text"
                        disabled
                        placeholder="WhatsApp com DDD"
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-[8px] text-white/70 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      className={`px-5 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-white shadow-lg cursor-pointer transition-all hover:scale-103 ${
                        accentColor === "purple" ? "bg-[#9333EA] hover:bg-purple-600 shadow-purple-900/25" : 
                        accentColor === "pink" ? "bg-[#EC4899] hover:bg-pink-600 shadow-pink-900/25" :
                        accentColor === "emerald" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/25" : 
                        "bg-amber-600 hover:bg-amber-500 shadow-amber-900/25"
                      }`}
                    >
                      {ctaText || "CTA Button"}
                    </button>
                  </div>
                </div>

                {/* Footer mock */}
                <div className="px-4 py-3 border-t border-white/5 text-[7px] text-white/30 flex justify-between items-center font-mono">
                  <span>© {new Date().getFullYear()} {currentTenant.name} Inc.</span>
                  <span>Proteção Estrita LGPD Conectada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ANALYTICS PREVIEW PANEL */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#09090C] border border-white/5 p-4 rounded-2xl">
              <span className="block text-[10px] text-white/40 uppercase font-bold font-mono">Acessos Únicos</span>
              <span className="text-2xl font-black text-white mt-1 block">{siteVisits.toLocaleString()}</span>
              <p className="text-[10px] text-green-400 mt-1">▲ +12.4% este mês</p>
            </div>

            <div className="bg-[#09090C] border border-white/5 p-4 rounded-2xl">
              <span className="block text-[10px] text-white/40 uppercase font-bold font-mono">Conversões Completas</span>
              <span className="text-2xl font-black text-white mt-1 block">{conversions} cliques</span>
              <p className="text-[10px] text-green-400 mt-1">▲ +8.9% no CRM</p>
            </div>

            <div className="bg-[#09090C] border border-white/5 p-4 rounded-2xl">
              <span className="block text-[10px] text-white/40 uppercase font-bold font-mono">Taxa de Conversão da LP</span>
              <span className="text-2xl font-black text-[#A855F7] mt-1 block">{conversionRate}</span>
              <p className="text-[10px] text-purple-400 mt-1">Performance Excelente (Estrita)</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" /> Relatório de Eventos Capturados do Pixel
              </h3>
              <button
                onClick={() => {
                  setSiteVisits(p => p + Math.floor(Math.random()*15) + 3);
                  setConversions(g => g + Math.floor(Math.random()*2) + 1);
                  addXP(10, "Simulou atividade de pixel no funil");
                }}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold text-white/80"
              >
                Simular Evento de Entrada (+15 XP)
              </button>
            </div>

            <div className="space-y-2 text-left">
              {[
                { event: "PageView (Acesso)", from: "Brasília, DF", time: "Há 1 minuto", ip: "177.231.xx.12" },
                { event: "LeadCapture (Lead gerado)", from: "São Paulo, SP", time: "Há 4 minutos", ip: "189.14.xx.221" },
                { event: "ClickCTA (Conversão)", from: "Rio de Janeiro, RJ", time: "Há 12 minutos", ip: "201.21.xx.39" },
                { event: "PageView (Acesso)", from: "Belo Horizonte, MG", time: "Há 20 minutos", ip: "186.204.xx.8" }
              ].map((ev, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#070709] border border-white/5 p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-white/30">#{idx+1}</span>
                    <span className="font-bold text-purple-300">{ev.event}</span>
                    <span className="text-white/40">• Região: {ev.from}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50 text-[10px]">
                    <span className="font-mono text-[9px] text-white/30">{ev.ip}</span>
                    <span>{ev.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
