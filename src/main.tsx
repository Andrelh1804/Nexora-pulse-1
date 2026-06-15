import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TenantProvider } from "./contexts/TenantContext.tsx";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TenantProvider userId="demo-user-001">
      <ThemeProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </TenantProvider>
  </StrictMode>
);
