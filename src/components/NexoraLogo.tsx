import React from "react";
import { motion } from "motion/react";
// @ts-ignore
import nexoraLogoImg from "../assets/images/nexora_logo_new.png";

interface NexoraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "header" | "dashboard";
  showText?: boolean;
  pulseSpeed?: number;
  sparkleScale?: number;
  glowColor1?: string;
  glowColor2?: string;
  textColor?: string;
}

export default function NexoraLogo({
  className = "",
  size = "md",
  showText = false,
  pulseSpeed = 4,
  glowColor1 = "#A855F7",
  glowColor2 = "#EC4899"
}: NexoraLogoProps) {

  const heightMapping = {
    sm: "h-20 md:h-24",
    md: "h-40 md:h-48",
    lg: "h-64 md:h-72",
    xl: "h-80 md:h-[420px]",
    header: "h-[52px] md:h-[60px]",
    dashboard: "h-80 md:h-[380px]"
  };

  const activeHeight = heightMapping[size] || "h-40";

  if (size === "header") {
    return (
      <div className={`flex items-center select-none ${className}`} id="nexora-brand-logo-header">
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ opacity: [0.92, 1, 0.92] }}
          transition={{ repeat: Infinity, duration: pulseSpeed, ease: "easeInOut" }}
        >
          <img
            src={nexoraLogoImg}
            alt="Nexora Pulse"
            referrerPolicy="no-referrer"
            className="h-[52px] md:h-[60px] w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.9)] hover:drop-shadow-[0_0_28px_rgba(236,72,153,1)] transition-all duration-300 hover:scale-105"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center select-none text-center bg-transparent relative ${className}`}
      id="nexora-interactive-brand-epic"
    >
      {/* Ambient glow haze behind logo */}
      <motion.div
        className="absolute rounded-full blur-[80px] z-0 pointer-events-none"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          repeat: Infinity,
          duration: Math.max(2, pulseSpeed),
          ease: "easeInOut",
        }}
        style={{
          width: "120%",
          height: "60%",
          background: `radial-gradient(circle, ${glowColor1}40 0%, ${glowColor2}25 45%, transparent 100%)`
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        <motion.img
          src={nexoraLogoImg}
          alt="Nexora Pulse Logo"
          referrerPolicy="no-referrer"
          className={`${activeHeight} w-full object-contain max-w-md`}
          style={{
            filter: `drop-shadow(0 0 32px ${glowColor1}80) drop-shadow(0 0 64px ${glowColor2}40)`
          }}
          animate={{
            filter: [
              `drop-shadow(0 0 24px ${glowColor1}60) drop-shadow(0 0 48px ${glowColor2}30)`,
              `drop-shadow(0 0 40px ${glowColor1}99) drop-shadow(0 0 80px ${glowColor2}55)`,
              `drop-shadow(0 0 24px ${glowColor1}60) drop-shadow(0 0 48px ${glowColor2}30)`,
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: Math.max(2, pulseSpeed),
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}
