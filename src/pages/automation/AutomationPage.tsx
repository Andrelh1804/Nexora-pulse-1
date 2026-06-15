import React from "react";
import NexoraAutomationWorkflows from "../../components/NexoraAutomationWorkflows";
import { useTenant } from "../../contexts/TenantContext";

export default function AutomationPage() {
  const { currentTenant } = useTenant();
  return (
    <NexoraAutomationWorkflows
      currentTenant={currentTenant}
      addXP={() => {}}
      setAuditLogs={() => {}}
    />
  );
}
