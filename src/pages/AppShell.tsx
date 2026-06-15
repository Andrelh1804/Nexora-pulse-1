import React from "react";
import { Navigate } from "react-router-dom";

// AppShell is now replaced by the new AppLayout + AppRouter structure.
// This file remains as a redirect shim for any legacy imports.
export default function AppShell() {
  return <Navigate to="/app/dashboard" replace />;
}
