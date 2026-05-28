import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, TrendingUp, TrendingDown, Wand2, Check, Info, Sparkles } from "lucide-react";

export interface DeviationAlert {
  id: string;
  metricKey: "roas" | "ctr" | "leads" | "followers" | "reach";
  metricLabel: string;
  type: "positive" | "negative";
  percentage: string;
  previousValue: string;
  currentValue: string;
  reason: string;
  recommendation: string;
  actionLabel: string;
  xpReward: number;
  isResolved: boolean;
}

interface MetricDeviationBadgeProps {
  alert: DeviationAlert;
  onResolve: (alertId: string, xpReward: number, label: string) => void;
  onDismiss: (alertId: string) => void;
}

export default function MetricDeviationBadge({
  alert,
  onResolve,
  onDismiss,
}: MetricDeviationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (alert.isResolved) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
        <Check className="w-2.5 h-2.5" />
        Sincronizado
      </div>
    );
  }

  const isPositive = alert.type === "positive";

  // Alert Styling
  const badgeBg = isPositive
    ? "bg-emerald-500/15 border-emerald-500/45 text-emerald-400"
    : "bg-rose-500/15 border-rose-500/45 text-rose-400";

  const glowColor = isPositive ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.4)";

  return (
    <div className="absolute top-3 right-3 z-30" id={`deviation-${alert.id}`}>
      {/* Pulsing Alert Trigger Badge */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 p-1 px-2.5 rounded-full text-[9px] font-extrabold tracking-wider font-mono border cursor-pointer relative shadow-lg ${badgeBg}`}
        style={{
          boxShadow: `0 0 12px ${glowColor}`,
        }}
      >
        {/* Pulsating ring indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPositive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
        </span>

        {isPositive ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        <span>{alert.percentage}</span>
      </motion.button>

      {/* Interactive Tooltip Details Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop layer to click away */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-72 bg-[#0E0E11] border-2 border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-left cursor-default overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card top flare */}
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{
                  background: isPositive
                    ? "linear-gradient(90deg, #10B981, #34D399)"
                    : "linear-gradient(90deg, #F43F5E, #FB7185)"
                }}
              />

              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-widest">
                  {isPositive ? "⚡ Pico de Performance" : "⚠️ Desvio Detectado"}
                </span>
                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {alert.percentage}
                </span>
              </div>

              <h4 className="text-white font-black text-xs uppercase tracking-tight leading-tight mb-1 font-sans">
                {alert.metricLabel}: Comparativa Sazonal
              </h4>

              <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-xl p-2 border border-white/5 mb-3 text-center">
                <div>
                  <div className="text-[8px] text-white/30 font-semibold uppercase font-mono">Anterior</div>
                  <div className="text-gray-400 font-mono font-bold text-xs">{alert.previousValue}</div>
                </div>
                <div>
                  <div className="text-[8px] text-white/30 font-semibold uppercase font-mono">Atual</div>
                  <div className={`font-mono font-black text-xs ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {alert.currentValue}
                  </div>
                </div>
              </div>

              {/* Diagnostic content */}
              <div className="space-y-2.5 text-[10px] leading-relaxed mb-4">
                <div>
                  <span className="text-purple-300 font-bold block mb-0.5">Diagnóstico Algorítmico:</span>
                  <p className="text-white/70 font-light">{alert.reason}</p>
                </div>
                <div className="bg-purple-950/25 border border-purple-500/10 rounded-lg p-2 text-purple-300">
                  <span className="font-bold block mb-0.5">💡 Ação Heurística Recomendada:</span>
                  <p className="text-purple-200/90 font-light text-[9px]">{alert.recommendation}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2 border-t border-white/5 pt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onDismiss(alert.id);
                  }}
                  className="flex-1 px-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] text-white/60 font-medium transition-all cursor-pointer text-center"
                >
                  Ocultar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onResolve(alert.id, alert.xpReward, alert.actionLabel);
                  }}
                  className="flex-1 px-2.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wand2 className="w-3 h-3 text-glow" />
                  Calibrar (+{alert.xpReward} XP)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
