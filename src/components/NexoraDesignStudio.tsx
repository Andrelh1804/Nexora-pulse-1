import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Palette, 
  Sparkles, 
  Download, 
  Share2, 
  Layout, 
  Megaphone, 
  Camera, 
  Type, 
  Image as ImageIcon, 
  Check, 
  CloudLightning, 
  RefreshCw 
} from "lucide-react";

interface NexoraDesignStudioProps {
  currentTenant: { name: string; niche: string };
  addXP: (amount: number, reason: string) => void;
  onSyncCreativeToAds?: (creativeId: string, title: string) => void;
}

export default function NexoraDesignStudio({ currentTenant, addXP, onSyncCreativeToAds }: NexoraDesignStudioProps) {
  const [format, setFormat] = useState<"square" | "story" | "landscape">("square");
  const [adTheme, setAdTheme] = useState<"neon" | "cosmic" | "emerald" | "amber">("neon");
  const [bannerTitle, setBannerTitle] = useState("Sua Próxima Conquista Começa Aqui");
  const [bannerSubtitle, setBannerSubtitle] = useState("O segredo de alta performance que seu concorrente prefere ocultar.");
  const [brandButtonText, setBrandButtonText] = useState("Clique & Adquira");
  const [bannerPromptInput, setBannerPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Suggested Prompts
  const suggestedPrompts = [
    `Anúncio futurista neon roxo em 3D demonstrando automação digital para ${currentTenant.name}`,
    `Capa de post corporativo moderno preto e magenta com visual cyber-tech premium para ${currentTenant.niche}`,
    `Criativo de história com grande botão brilhante e mockup de telefone para capturar leads orgânicos`
  ];

  const handleBannersGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      addXP(70, "Adicionou criativo gerado por IA Generativa visual para campanhas");
    }, 1200);
  };

  const handleSyncCreative = () => {
    addXP(40, "Criativo sincronizado diretamente com banco de ativos Nexora Ads");
    if (onSyncCreativeToAds) {
      onSyncCreativeToAds(`creative-${Date.now()}`, bannerTitle);
    }
    alert("Ativo de imagem de anúncio injetado com sucesso no gerenciador Nexora Ads (Módulo Tráfego Pago).");
  };

  const adFormats = {
    square: { name: "Feed Quadrado (1:1)", icon: Layout, style: "aspect-square max-w-[340px]" },
    story: { name: "Vertical Stories (9:16)", icon: Smartphone => <Layout className="w-4 h-4 rotate-90" />, style: "aspect-[9/16] max-w-[240px]" },
    landscape: { name: "Banner Horizontal (16:9)", icon: Layout, style: "aspect-[16/9] max-w-[440px]" }
  };

  const colorThemes = {
    neon: {
      name: "Magenta Cyber Neon",
      bg: "bg-gradient-to-br from-[#0D0115] via-[#1A0329] to-[#040108]",
      textGlow: "text-[#EC4899] drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]",
      lineGlow: "border-[#9333EA] shadow-[#EC4899]/30",
      btnGrad: "from-[#9333EA] to-[#EC4899]"
    },
    cosmic: {
      name: "Cosmic Deep Purple",
      bg: "bg-gradient-to-br from-[#060B1E] via-[#0A112E] to-[#030612]",
      textGlow: "text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]",
      lineGlow: "border-purple-500/50 shadow-purple-500/30",
      btnGrad: "from-blue-600 to-purple-600"
    },
    emerald: {
      name: "Matrix Emerald Green",
      bg: "bg-gradient-to-br from-[#01140E] via-[#03251A] to-[#010806]",
      textGlow: "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]",
      lineGlow: "border-emerald-500/50 shadow-emerald-500/30",
      btnGrad: "from-emerald-600 to-cyan-600"
    },
    amber: {
      name: "Amber Solar Flare",
      bg: "bg-gradient-to-br from-[#1A0C01] via-[#331802] to-[#0A0400]",
      textGlow: "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]",
      lineGlow: "border-amber-500/50 shadow-amber-500/30",
      btnGrad: "from-amber-600 to-rose-600"
    }
  };

  const activeTheme = colorThemes[adTheme] || colorThemes.neon;

  return (
    <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 space-y-6 animate-fade-in" id="nexora-design-workspace">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-[10px] text-purple-300 font-extrabold uppercase flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
            Nexora Design & Creative IA (AIGC Módulo)
          </span>
          <h2 className="text-xl font-black text-white mt-1 uppercase tracking-wider">Estúdio Modular de Criativos Visuais</h2>
          <p className="text-xs text-white/50">Gere imagens, banners patrocinados de alta conversão e kits de postagens com um clique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DESIGN CONTROLLER CHANNELS */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* AIGC Text prompt engineering */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Gerador de Imagem Heurístico</span>
              <span className="text-[9px] bg-[#9333EA]/20 text-[#EC4899] font-bold px-2 py-0.5 rounded border border-[#EC4899]/30">Flux Pro 1.1</span>
            </div>

            <textarea
              rows={3}
              value={bannerPromptInput}
              onChange={(e) => setBannerPromptInput(e.target.value)}
              placeholder="Descreva o criativo desejado com detalhes ou toque em uma sugestão rápida abaixo..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
            />

            <div>
              <span className="block text-[9px] text-white/35 uppercase font-bold mb-2">Sugestões de Contexto Estrito:</span>
              <div className="space-y-1.5">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBannerPromptInput(p);
                      addXP(10, "Selecionou sugestão de prompt estruturado");
                    }}
                    className="w-full text-left p-2 rounded-lg bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 text-[9px] text-white/60 hover:text-white transition-all truncate"
                  >
                    💡 {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBannersGeneration}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:brightness-110 rounded-xl text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(147,51,234,0.15)]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Renderizando Criativo 3D...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Gerar Criativo IA (+70 XP)
                </>
              )}
            </button>
          </div>

          {/* Formats and Custom Title editor */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Propriedades do Layout & Textos</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Título de Destaque</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Subtítulo Exclusivo</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Formato do Card</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="square">📷 Feed (1:1)</option>
                    <option value="story">📱 Story (9:16)</option>
                    <option value="landscape">💻 Banner (16:9)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase mb-1">Paleta Cromática</label>
                  <select
                    value={adTheme}
                    onChange={(e) => setAdTheme(e.target.value as any)}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="neon">🔮 Cyber Neon</option>
                    <option value="cosmic">🌌 Cosmic Purple</option>
                    <option value="emerald">💚 Matrix Green</option>
                    <option value="amber">🧡 Solar Golden</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CANVA AND ASSETS WORKSPACE */}
        <div className="lg:col-span-7 flex flex-col bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Top canvas settings menu */}
          <div className="bg-[#0C0C0E] border-b border-white/15 px-6 py-4 flex justify-between items-center text-xs text-white/60">
            <span className="font-bold flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-400" /> Ativo Digital em Visualização Real
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSyncCreative}
                className="px-3' py-1.5 bg-purple-900/40 text-purple-300 hover:text-white border border-purple-800/40 rounded-lg font-bold hover:bg-purple-900/60 text-[10px] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5" /> Sincronizar com Nexora Ads (+40 XP)
              </button>
            </div>
          </div>

          {/* Interactive dynamic visual board */}
          <div className="flex-1 min-h-[460px] bg-[#050505] p-6 flex flex-col items-center justify-center relative">
            <div
              className={`transition-all duration-300 relative border rounded-2xl overflow-hidden flex flex-col justify-between ${activeTheme.bg} ${
                adFormats[format].style
              } p-6 shadow-2xl`}
              style={{
                boxShadow: "0 10px 40px -10px rgba(147, 51, 234, 0.4)"
              }}
            >
              {/* Graphic Design mesh grid mock */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />

              {/* Glowing vector circles background inside card */}
              <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[40px] opacity-40`} style={{
                background: adTheme === "neon" ? "#EC4899" : adTheme === "cosmic" ? "#3B82F6" : adTheme === "emerald" ? "#10B981" : "#F59E0B"
              }} />

              {/* Brand watermark indicator inside preview */}
              <div className="text-[9px] uppercase tracking-widest text-white/30 font-extrabold flex items-center gap-1">
                <span>⚡ {currentTenant.name.toUpperCase()}</span>
                <span className="text-white/10">•</span>
                <span>CREATIVE LAB</span>
              </div>

              {/* Interactive Vector Mockups representing our AIGC Engine */}
              <div className="my-auto space-y-4 text-center z-10 py-4">
                <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Camera className={`w-5 h-5 ${activeTheme.textGlow}`} />
                </div>

                <div className="space-y-2">
                  <h1 className="text-sm sm:text-lg font-black tracking-tight text-white leading-tight font-sans">
                    {bannerTitle || "Seu Título Atrativo Principal"}
                  </h1>
                  <p className="text-[9px] sm:text-[10px] text-white/50 leading-relaxed max-w-xs mx-auto">
                    {bannerSubtitle || "Apresente suas dores do mercado para as pessoas corretas através de criativos dinâmicos."}
                  </p>
                </div>
              </div>

              {/* Action layout call details in preview frame */}
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/5 z-10">
                <span className="text-[7px] text-white/30 tracking-widest font-mono uppercase">CONVERT COM NEXORA</span>
                <button
                  className={`px-3.5 py-1 text-[8px] font-black uppercase text-white tracking-widest rounded-lg bg-gradient-to-r shadow-lg ${activeTheme.btnGrad}`}
                >
                  {brandButtonText || "Adquira"}
                </button>
              </div>
            </div>

            {/* Quick Banner customization prompts */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center z-10">
              <button
                onClick={() => {
                  setBrandButtonText("Acesse Agora");
                }}
                className="px-2.5 py-1 bg-[#121214] border border-white/10 hover:border-purple-500/40 rounded-lg text-[9px] text-white/60 focus:outline-none"
              >
                CTA: Acesse Agora
              </button>
              <button
                onClick={() => {
                  setBrandButtonText("Fale Conosco");
                }}
                className="px-2.5 py-1 bg-[#121214] border border-white/10 hover:border-purple-500/40 rounded-lg text-[9px] text-white/60 focus:outline-none"
              >
                CTA: Fale Conosco
              </button>
              <button
                onClick={() => {
                  setBannerTitle("Automatize Suas Vendas No Próximo Nível");
                  addXP(10, "Alterou título para sugestão de conversão");
                }}
                className="px-2.5 py-1 bg-[#121214] border border-white/10 hover:border-purple-500/40 rounded-lg text-[9px] text-white/60 lg:inline-block hidden"
              >
                Título: Vendas Automáticas
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
