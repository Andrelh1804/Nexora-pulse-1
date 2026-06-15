import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { TenantData } from "../types";
import { TENANTS } from "../data";
import { PlanTier } from "../lib/featureFlags";
import featureFlags, { FeatureSet, PlanLimits } from "../lib/featureFlags";
import moduleGateway, { AccessContext, UserRole } from "../lib/moduleGateway";
import auditLogger from "../lib/auditLogger";
import eventBus from "../lib/eventBus";

export interface TenantContextValue {
  currentTenant: TenantData;
  allTenants: TenantData[];
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;

  currentPlan: PlanTier;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  features: FeatureSet;
  limits: PlanLimits;

  isFeatureEnabled: (feature: keyof FeatureSet) => boolean;
  canAccess: (module: keyof FeatureSet) => boolean;
  canEdit: (module: keyof FeatureSet) => boolean;
  canDelete: (module: keyof FeatureSet) => boolean;

  accessContext: AccessContext;
}

const TenantContext = createContext<TenantContextValue | null>(null);

const TENANT_PLAN_MAP: Record<string, PlanTier> = {
  glow: "premium",
  stutz: "enterprise",
  meliuz: "enterprise",
  nexora: "basic",
};

interface TenantProviderProps {
  children: ReactNode;
  userId?: string;
}

export function TenantProvider({ children, userId = "demo-user" }: TenantProviderProps) {
  const [selectedTenantId, setSelectedTenantIdState] = useState("glow");
  const [currentRole, setCurrentRoleState] = useState<UserRole>("admin");

  const currentTenant = TENANTS.find((t) => t.id === selectedTenantId) ?? TENANTS[0];
  const currentPlan: PlanTier = TENANT_PLAN_MAP[selectedTenantId] ?? "basic";

  const features = featureFlags.getFeatures(currentPlan);
  const limits = featureFlags.getLimits(currentPlan);

  const accessContext: AccessContext = {
    plan: currentPlan,
    role: currentRole,
    tenantId: selectedTenantId,
    userId,
  };

  const setSelectedTenantId = useCallback((id: string) => {
    setSelectedTenantIdState(id);
    const tenant = TENANTS.find((t) => t.id === id);
    if (tenant) {
      auditLogger.log({
        action: "tenant.updated",
        tenantId: id,
        userId,
        resource: "tenant",
        resourceId: id,
        details: { switched_to: tenant.name },
        status: "success",
      });
      eventBus.emit("tenant.updated", { tenantId: id, changes: { switched: true } });
    }
  }, [userId]);

  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    auditLogger.log({
      action: "settings.updated",
      tenantId: selectedTenantId,
      userId,
      resource: "user.role",
      details: { newRole: role },
      status: "success",
    });
  }, [selectedTenantId, userId]);

  const isFeatureEnabled = useCallback(
    (feature: keyof FeatureSet) => featureFlags.isEnabled(currentPlan, feature),
    [currentPlan]
  );

  const canAccess = useCallback(
    (module: keyof FeatureSet) => moduleGateway.canAccess(accessContext, module),
    [accessContext]
  );

  const canEdit = useCallback(
    (module: keyof FeatureSet) => moduleGateway.checkAccess(accessContext, module).canEdit,
    [accessContext]
  );

  const canDelete = useCallback(
    (module: keyof FeatureSet) => moduleGateway.checkAccess(accessContext, module).canDelete,
    [accessContext]
  );

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        allTenants: TENANTS,
        selectedTenantId,
        setSelectedTenantId,
        currentPlan,
        currentRole,
        setCurrentRole,
        features,
        limits,
        isFeatureEnabled,
        canAccess,
        canEdit,
        canDelete,
        accessContext,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used inside TenantProvider");
  return ctx;
}

export default TenantContext;
