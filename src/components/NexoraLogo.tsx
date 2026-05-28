import React from "react";
import { motion } from "motion/react";
// @ts-ignore
import nexoraLogoImg from "../assets/images/nexora_logo_full_ultra_hd_1779937872019.png";

interface NexoraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "header" | "dashboard";
  showText?: boolean;
  pulseSpeed?: number;       // speed in seconds
  sparkleScale?: number;     // scale multiplier
  glowColor1?: string;       // primary gradient start
  glowColor2?: string;       // primary gradient end
  textColor?: string;        // text override color
}

export default function NexoraLogo({
  className = "",
  size = "md",
  showText = false, // Default to false to completely hide text side layout
  pulseSpeed = 4,
  glowColor1 = "#A855F7",
  glowColor2 = "#EC4899"
}: NexoraLogoProps) {
  
  // Custom height/sizing mappings for the image asset to maximize visibility and scale
  const heightMapping = {
    sm: "h-24 md:h-28",
    md: "h-44 md:h-52",
    lg: "h-72 md:h-80",
    xl: "h-96 md:h-[480px]",
    header: "h-16",
    dashboard: "h-96 md:h-[440px]"
  };

  const activeHeight = heightMapping[size] || "h-44";

  if (size === "header") {
    return (
      <div className={`flex items-center select-none ${className}`} id="nexora-brand-logo-header">
        {/* Animated real Brand Symbol inside a glowing widescreen wrapper allowing the complete high-res logo with text to hold original proportions */}
        <div className="relative shrink-0 w-44 h-14 bg-black/30 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden hover:border-purple-500/50 transition-all shadow-[0_0_20px_rgba(236,72,153,0.15)] group">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-500/5 opacity-70"
            animate={{
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              repeat: Infinity,
              duration: pulseSpeed,
              ease: "easeInOut"
            }}
          />
          <img
            src={nexoraLogoImg}
            alt="Nexora Pulse"
            referrerPolicy="no-referrer"
            className="w-full h-full p-1.5 object-contain drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    );
  }

  // Dashboard / Standard Logo block showing the full rich graphic logo
  return (
    <div
      className={`flex flex-col items-center justify-center select-none text-center bg-transparent relative p-2 ${className}`}
      id="nexora-interactive-brand-epic"
    >
      {/* Dynamic Background Haze / Breathing Smoke */}
      <motion.div
        className="absolute w-96 h-32 bg-gradient-to-r from-purple-600/15 via-pink-500/15 to-transparent blur-[70px] rounded-full z-0 pointer-events-none animate-pulse"
        animate={{
          opacity: [0.5, 0.9, 0.5],
          scale: [0.95, 1.15, 0.95],
        }}
        transition={{
          repeat: Infinity,
          duration: Math.max(2, pulseSpeed),
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(circle, ${glowColor1}25 0%, ${glowColor2}15 50%, transparent 100%)`
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Full high-resolution brand logo image, max-w-full and filling space */}
        <img
          src={nexoraLogoImg}
          alt="Nexora Pulse Logo"
          referrerPolicy="no-referrer"
          className={`${activeHeight} w-full object-contain drop-shadow-[0_12px_45px_rgba(147,51,234,0.25)] max-w-lg transition-transform duration-300`}
        />
      </div>
    </div>
  );
}
