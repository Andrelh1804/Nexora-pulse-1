import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppRouter from "./router/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider userId="demo-user-001">
          <ThemeProvider>
            <NotificationProvider>
              <AppRouter />
            </NotificationProvider>
          </ThemeProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
