import React from "react";
import NexoraSitesBuilder from "../../components/NexoraSitesBuilder";
import { useTenant } from "../../contexts/TenantContext";

export default function SitesPage() {
  const { currentTenant } = useTenant();
  return <NexoraSitesBuilder currentTenant={currentTenant} addXP={() => {}} />;
}
