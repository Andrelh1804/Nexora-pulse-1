/**
 * App.tsx — Nexora Pulse
 *
 * This file previously contained the 3,928-line monolithic platform component.
 * As part of Phase 2.5 (Commercial Readiness & Revenue Activation), the platform
 * has been fully decomposed into dedicated page components:
 *
 *   - src/layout/AppLayout.tsx          → Sidebar + header shell
 *   - src/pages/dashboard/DashboardPage.tsx
 *   - src/pages/crm/CRMPage.tsx
 *   - src/pages/ai/AIAgentsPage.tsx
 *   - src/pages/traffic/TrafficPage.tsx
 *   - src/pages/social/SocialPage.tsx
 *   - src/pages/analytics/AnalyticsPage.tsx
 *   - src/pages/billing/BillingPage.tsx
 *   - src/pages/settings/SettingsPage.tsx
 *   - src/pages/onboarding/OnboardingPage.tsx
 *   - src/pages/sites/SitesPage.tsx
 *   - src/pages/design/DesignPage.tsx
 *   - src/pages/automation/AutomationPage.tsx
 *   - src/pages/admin/AdminPage.tsx
 *   - src/pages/LandingShell.tsx        → Institutional landing page
 *
 * Routing is handled by src/router/AppRouter.tsx.
 * The new entry point for the platform is /app/dashboard (requires auth).
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

interface AppProps {
  authUser?: { id: string; email: string; name: string; role: string; plan: string } | null;
  onNavigate?: (path: string) => void;
  initialView?: "site" | "app";
}

/**
 * Legacy App component shim — preserved for compatibility.
 * The actual platform is now rendered via AppRouter + AppLayout.
 */
export default function App({ initialView = "site" }: AppProps) {
  const { isAuthenticated } = useAuth();

  if (initialView === "app") {
    return <Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />;
  }

  return <Navigate to="/" replace />;
}
