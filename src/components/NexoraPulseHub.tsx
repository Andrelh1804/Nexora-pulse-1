import React, { useState } from "react";
import { Sliders, RefreshCw, Sparkles, Zap, Shield, Play } from "lucide-react";
import NexoraLogo from "./NexoraLogo";
import { TenantData } from "../types";

interface NexoraPulseHubProps {
  currentTenant: TenantData;
  addXP: (amount: number, reason: string) => void;
  onTrackManualOptimization: (intensity: number) => void;
}

export default function NexoraPulseHub({
  currentTenant,
  addXP,
  onTrackManualOptimization
}: NexoraPulseHubProps) {
  // Brand customizable states
  const [pulseSpeed, setPulseSpeed] = useState<number>(3); // seconds for full heartbeat loop, lower is faster
  const [sparkleScale, setSparkleScale] = useState<number>(1);
  const [colorPreset, setColorPreset] = useState<"standard" | "cyber" | "aurora" | "toxic">("standard");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "Sinal de pulso estabelecido via WebSocket secundário.",
    "Banda de tráfego Meta / Google com latência de 14ms."
  ]);

  // Color configurations based on Nexora Pulse marketing assets
  const colors = {
    standard: { g1: "#A855F7", g2: "#EC4899", label: "Nexora Original (Violeta & Rosa)" },
    cyber: { g1: "#06B6D4", g2: "#3B82F6", label: "Plasma Digital (Ciano & Azul)" },
    aurora: { g1: "#10B981", g2: "#6366F1", label: "Aurora Cósmica (Esmeralda & Indigo)" },
    toxic: { g1: "#EAB308", g2: "#22C55E", label: "High-Voltage (Amarelo & Verde)" }
  };

  const activeColors = colors[colorPreset];

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addXP(40, `Calibrou e Sincronizou Hub de Performance: ${colors[colorPreset].label}`);
    
    setSyncLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Sincronizando metadados de canais omnichannel...`,
      ...prev
    ]);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Sincronização CONCLUÍDA. Coerência de dados de conversão: 99.8%.`,
        `[${new Date().toLocaleTimeString()}] CTR recalibrado para o criativo principal de ${currentTenant.name}.`,
        ...prev
      ]);
      onTrackManualOptimization(sparkleScale);
    }, 1500);
  };

  const handleHeuristicBurst = () => {
    addXP(60, "Disparou Ondas de Engajamento Heurístico Nexora Pulse");
    setSyncLogs(prev => [
      `[${new Date().toLocaleTimeString()}] DISPARO HEURÍSTICO ATIVO: Injetando pulso sintético em múltiplos canais ativos...`,
      `[${new Date().toLocaleTimeString()}] Otimizando CPM e inflando estimativa de ROAS em +0.35x temporariamente.`,
      ...prev
    ]);
  };

  return (
    <div
      className="bg-[#0A0A0C] border-2 border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all hover:border-[#9333EA]/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      id="campaign-centralized-controller"
    >
      {/* Background radial effects */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] pointer-events-none opacity-30 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${activeColors.g2}88 0%, transparent 70%)`
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${activeColors.g1}88 0%, transparent 70%)`
        }}
      />

      <div className="flex flex-col xl:flex-row items-center gap-8 relative z-10">
        {/* Dynamic Logo Viewer Column */}
        <div className="w-full xl:w-5/12 flex flex-col items-center justify-center border-b xl:border-b-0 xl:border-r border-white/5 pb-6 xl:pb-0 xl:pr-8">
          <div className="relative p-2 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
            <NexoraLogo
              size="dashboard"
              pulseSpeed={pulseSpeed}
              sparkleScale={sparkleScale}
              glowColor1={activeColors.g1}
              glowColor2={activeColors.g2}
            />

            {/* Quick frequency pulse indicator */}
            <div className="absolute top-4 left-4 bg-black/80 border border-white/10 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 text-[8px] font-mono tracking-widest text-purple-400 font-bold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping"></span>
              Sinal: Estável ({pulseSpeed}s)
            </div>
          </div>
          
          <div className="mt-4 flex flex-col items-center">
            <span className="text-[10px] text-white/30 tracking-[0.3em] font-mono font-bold uppercase">
              Espectro de Cor de Dados
            </span>
            <div className="flex gap-2.5 mt-2">
              {(Object.keys(colors) as Array<keyof typeof colors>).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setColorPreset(key);
                    addXP(10, `Calibrou espectro Nexora para: ${colors[key].label}`);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all shrink-0 ${
                    colorPreset === key 
                      ? "border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-110"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${colors[key].g1}, ${colors[key].g2})`
                  }}
                  title={colors[key].label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Controls Column */}
        <div className="w-full xl:w-7/12 flex flex-col justify-between self-stretch gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-1 px-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-extrabold uppercase font-mono tracking-wider">
                Comando tático das marcas
              </span>
              <span className="text-[10px] text-white/30">• Canal Real-time</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase font-sans">
              Modulador do Pulso Nexora
            </h2>
            <p className="text-xs text-white/50 font-light mt-1">
              Modifique a frequência de coleta orgânica e os gatilhos visuais para otimização omnichannel. Ajustes manuais ajudam o algoritmo a sincronizar públicos de conversão sob demanda.
            </p>
          </div>

          {/* Core Calibration sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-white/60 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Frequência de Pulso
                  </span>
                  <span className="font-mono text-purple-400 font-bold">{pulseSpeed.toFixed(1)}s (loop)</span>
                </div>
                <p className="text-[10px] text-white/30 mb-2">Mapeia o ritmo da animação e refresh de filas da Evolution API.</p>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.5"
                value={pulseSpeed}
                onChange={(e) => setPulseSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
              />
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-white/60 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    Intensidade Sparkle
                  </span>
                  <span className="font-mono text-pink-400 font-bold">{sparkleScale.toFixed(1)}x glow</span>
                </div>
                <p className="text-[10px] text-white/30 mb-2">Escala o diâmetro dos brilhos e reflexo neon nos criativos de Tráfego Pago.</p>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sparkleScale}
                onChange={(e) => setSparkleScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500 mt-2"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex-1 px-5 py-3.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSyncing 
                  ? "bg-purple-900/40 text-purple-300 border border-purple-500/20 cursor-wait" 
                  : "bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white hover:opacity-90 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando Pulso..." : "Sincronizar Hub em Tempo Real"}
            </button>

            <button
              onClick={handleHeuristicBurst}
              className="flex-1 px-5 py-3.5 bg-[#121214] border border-white/10 hover:border-pink-500/50 rounded-xl font-bold font-sans text-xs text-pink-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-glow" />
              Injetar Carga Heurística (+60 XP)
            </button>
          </div>

          {/* Telemetry log preview */}
          <div className="bg-black/60 border border-white/5 rounded-2xl p-3 h-28 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold border-b border-white/5 pb-1.5 mb-1">
              <span className="flex items-center gap-1.5 font-mono text-[9px]">
                <Shield className="w-3 h-3 text-purple-400" />
                Telemetria Secundária Nexora Active
              </span>
              <span className="text-green-400 font-mono text-[8px]">ONLINE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-[#A855F7] space-y-1 pr-1 custom-scrollbar scroll-smooth">
              {syncLogs.map((log, idx) => (
                <div key={idx} className="leading-tight opacity-90 truncate">
                  <span className="text-white/40">&gt;&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
