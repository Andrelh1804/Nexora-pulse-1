import React, { useState } from "react";
import SaaSAdminCockpit from "../../components/SaaSAdminCockpit";
import { SaaSUser } from "../../components/SaaSAccountSystem";
import { AuditLog } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const DEMO_USER: SaaSUser = {
  id: "demo-admin",
  name: "Demo Admin",
  companyName: "Nexora Pulse",
  email: "demo@nexorapulse.com",
  phone: "+55 11 99999-0000",
  document: "12.345.678/0001-90",
  role: "admin",
  trialStart: new Date(Date.now() - 7 * 864e5).toISOString(),
  trialDays: 14,
  trialDaysPassed: 7,
  plan: "premium",
  subscriptionStatus: "active_trial",
  customerStripeId: "cus_demo",
  isCustomAdminTrial: false,
  allowedModules: {
    dashboard: true,
    social: true,
    ai_agents: true,
    traffic: true,
    crm_whatsapp: true,
    marketplace: true,
  },
};

export default function AdminPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<SaaSUser[]>([DEMO_USER]);
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>({
    ...DEMO_USER,
    id: user?.id ?? "demo-admin",
    name: user?.name ?? "Demo Admin",
    email: user?.email ?? "demo@nexorapulse.com",
    role: (user?.role as SaaSUser["role"]) ?? "admin",
    plan: (user?.plan as SaaSUser["plan"]) ?? "premium",
  });

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-white/40">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <SaaSAdminCockpit
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      usersList={usersList}
      setUsersList={setUsersList}
      addXP={() => {}}
      setAuditLogs={(_: React.SetStateAction<AuditLog[]>) => {}}
    />
  );
}
