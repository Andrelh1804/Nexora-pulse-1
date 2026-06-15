import React from "react";
import NexoraDesignStudio from "../../components/NexoraDesignStudio";
import { useTenant } from "../../contexts/TenantContext";

export default function DesignPage() {
  const { currentTenant } = useTenant();
  return (
    <NexoraDesignStudio
      currentTenant={currentTenant}
      addXP={() => {}}
      onSyncCreativeToAds={() => {}}
    />
  );
}
