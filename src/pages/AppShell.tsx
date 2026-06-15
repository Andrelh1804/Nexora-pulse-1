import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import App from "../App";
import { useAuth } from "../contexts/AuthContext";

interface AppShellProps {
  isLanding?: boolean;
}

export default function AppShell({ isLanding = false }: AppShellProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Pass auth info to legacy App component via props-like mechanism
  // The App.tsx is the existing 3922-line component — it runs as-is
  // but now has access to auth context via the providers in main.tsx.
  // Full modularization of App.tsx happens in subsequent phases.

  return (
    <App
      authUser={isAuthenticated ? user : null}
      onNavigate={navigate}
      initialView={isLanding ? "site" : "app"}
    />
  );
}
