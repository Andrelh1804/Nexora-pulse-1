import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface BrandTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontFamily: string;
  borderRadius: "sm" | "md" | "lg" | "xl";
  customDomain?: string;
  companyName?: string;
}

const PRESET_THEMES: Record<string, BrandTheme> = {
  nexora: {
    id: "nexora",
    name: "Nexora Pulse (Padrão)",
    primaryColor: "#A855F7",
    secondaryColor: "#EC4899",
    accentColor: "#8B5CF6",
    bgColor: "#09090D",
    bgSecondary: "#0F0F14",
    textPrimary: "#FFFFFF",
    textSecondary: "#94A3B8",
    borderColor: "rgba(255,255,255,0.08)",
    gradientFrom: "#7C3AED",
    gradientTo: "#DB2777",
    fontFamily: "Inter, sans-serif",
    borderRadius: "xl",
    companyName: "Nexora Pulse",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Blue",
    primaryColor: "#3B82F6",
    secondaryColor: "#06B6D4",
    accentColor: "#6366F1",
    bgColor: "#0A0F1E",
    bgSecondary: "#0F172A",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    borderColor: "rgba(255,255,255,0.08)",
    gradientFrom: "#1D4ED8",
    gradientTo: "#0891B2",
    fontFamily: "Inter, sans-serif",
    borderRadius: "xl",
    companyName: "Nexora Pulse",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Growth",
    primaryColor: "#10B981",
    secondaryColor: "#6366F1",
    accentColor: "#34D399",
    bgColor: "#080E0A",
    bgSecondary: "#0D1710",
    textPrimary: "#F0FDF4",
    textSecondary: "#94A3B8",
    borderColor: "rgba(255,255,255,0.08)",
    gradientFrom: "#059669",
    gradientTo: "#4F46E5",
    fontFamily: "Inter, sans-serif",
    borderRadius: "xl",
    companyName: "Nexora Pulse",
  },
  amber: {
    id: "amber",
    name: "Amber Voltage",
    primaryColor: "#F59E0B",
    secondaryColor: "#EF4444",
    accentColor: "#FBBF24",
    bgColor: "#0C0A05",
    bgSecondary: "#111007",
    textPrimary: "#FFFBEB",
    textSecondary: "#9CA3AF",
    borderColor: "rgba(255,255,255,0.08)",
    gradientFrom: "#D97706",
    gradientTo: "#DC2626",
    fontFamily: "Inter, sans-serif",
    borderRadius: "xl",
    companyName: "Nexora Pulse",
  },
};

interface ThemeContextValue {
  theme: BrandTheme;
  themeId: string;
  setThemeById: (id: string) => void;
  setCustomTheme: (theme: Partial<BrandTheme>) => void;
  presets: typeof PRESET_THEMES;
  isWhiteLabel: boolean;
  setWhiteLabel: (config: Partial<BrandTheme>) => void;
  resetToDefault: () => void;
  cssVars: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, tenantId }: { children: ReactNode; tenantId?: string }) {
  const [themeId, setThemeId] = useState("nexora");
  const [customOverrides, setCustomOverrides] = useState<Partial<BrandTheme>>({});
  const [isWhiteLabel, setIsWL] = useState(false);

  const baseTheme = PRESET_THEMES[themeId] ?? PRESET_THEMES.nexora;
  const theme: BrandTheme = { ...baseTheme, ...customOverrides };

  const cssVars: Record<string, string> = {
    "--color-primary": theme.primaryColor,
    "--color-secondary": theme.secondaryColor,
    "--color-accent": theme.accentColor,
    "--color-bg": theme.bgColor,
    "--color-bg-secondary": theme.bgSecondary,
    "--color-text-primary": theme.textPrimary,
    "--color-text-secondary": theme.textSecondary,
    "--color-border": theme.borderColor,
    "--gradient-from": theme.gradientFrom,
    "--gradient-to": theme.gradientTo,
  };

  const setThemeById = useCallback((id: string) => {
    if (PRESET_THEMES[id]) setThemeId(id);
  }, []);

  const setCustomTheme = useCallback((overrides: Partial<BrandTheme>) => {
    setCustomOverrides((prev) => ({ ...prev, ...overrides }));
  }, []);

  const setWhiteLabel = useCallback((config: Partial<BrandTheme>) => {
    setIsWL(true);
    setCustomOverrides((prev) => ({ ...prev, ...config }));
  }, []);

  const resetToDefault = useCallback(() => {
    setThemeId("nexora");
    setCustomOverrides({});
    setIsWL(false);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setThemeById,
        setCustomTheme,
        presets: PRESET_THEMES,
        isWhiteLabel,
        setWhiteLabel,
        resetToDefault,
        cssVars,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export default ThemeContext;
