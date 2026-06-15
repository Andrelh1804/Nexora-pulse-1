import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute, { PublicRoute } from "../components/ProtectedRoute";

// ──────────────────────────────────────────────
// Lazy-loaded pages
// ──────────────────────────────────────────────
const LoginPage      = lazy(() => import("../pages/LoginPage"));
const RegisterPage   = lazy(() => import("../pages/RegisterPage"));
const OnboardingPage = lazy(() => import("../pages/onboarding/OnboardingPage"));
const AppLayout      = lazy(() => import("../layout/AppLayout"));
const LandingShell   = lazy(() => import("../pages/LandingShell"));

// App pages
const DashboardPage  = lazy(() => import("../pages/dashboard/DashboardPage"));
const CRMPage        = lazy(() => import("../pages/crm/CRMPage"));
const AIAgentsPage   = lazy(() => import("../pages/ai/AIAgentsPage"));
const TrafficPage    = lazy(() => import("../pages/traffic/TrafficPage"));
const SocialPage     = lazy(() => import("../pages/social/SocialPage"));
const AnalyticsPage  = lazy(() => import("../pages/analytics/AnalyticsPage"));
const BillingPage    = lazy(() => import("../pages/billing/BillingPage"));
const SettingsPage   = lazy(() => import("../pages/settings/SettingsPage"));

// Legacy feature modules (wrapped with required props)
const SitesPage      = lazy(() => import("../pages/sites/SitesPage"));
const DesignPage     = lazy(() => import("../pages/design/DesignPage"));
const AutomationPage = lazy(() => import("../pages/automation/AutomationPage"));
const AdminPage      = lazy(() => import("../pages/admin/AdminPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-xs">Carregando...</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public routes ─────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* ── Onboarding (protected, outside main layout) ── */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* ── Protected app shell with sidebar layout ─── */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="crm"        element={<CRMPage />} />
          <Route path="ai"         element={<AIAgentsPage />} />
          <Route path="traffic"    element={<TrafficPage />} />
          <Route path="social"     element={<SocialPage />} />
          <Route path="analytics"  element={<AnalyticsPage />} />
          <Route path="billing"    element={<BillingPage />} />
          <Route path="settings"   element={<SettingsPage />} />

          {/* Legacy feature modules */}
          <Route path="sites"      element={<SitesPage />} />
          <Route path="design"     element={<DesignPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="admin"      element={<AdminPage />} />

          {/* Catch-all within /app */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Route>

        {/* ── Legacy /app/* deep links → redirect ── */}
        <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />

        {/* ── Landing page (public) ─────────────── */}
        <Route path="/" element={<LandingShell />} />

        {/* ── Catch-all ─────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
