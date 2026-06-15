import featureFlags, { FeatureSet, PlanLimits, PlanTier } from "./featureFlags";

export type UserRole = "admin" | "gestor" | "client" | "analyst";

export interface AccessContext {
  plan: PlanTier;
  role: UserRole;
  tenantId: string;
  userId: string;
}

export interface ModuleAccess {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  reason?: string;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  gestor: 3,
  analyst: 2,
  client: 1,
};

const MODULE_MIN_ROLES: Record<keyof FeatureSet, UserRole> = {
  social_media: "client",
  ai_agents: "client",
  traffic_manager: "gestor",
  crm_whatsapp: "client",
  marketplace: "client",
  admin_cockpit: "admin",
  automation_tests: "admin",
  nexora_sites: "gestor",
  nexora_design: "gestor",
  nexora_automation: "gestor",
  capi_dispatcher: "gestor",
  ai_predictor: "analyst",
  fast_copy_generator: "client",
  smart_budget_rules: "gestor",
  export_reports: "analyst",
  white_label: "admin",
  multi_user: "admin",
  api_access: "admin",
};

class ModuleGateway {
  checkAccess(ctx: AccessContext, module: keyof FeatureSet): ModuleAccess {
    const planEnabled = featureFlags.isEnabled(ctx.plan, module);
    if (!planEnabled) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        reason: `Módulo "${module}" não disponível no plano ${ctx.plan}. Faça upgrade.`,
      };
    }

    const minRole = MODULE_MIN_ROLES[module];
    const hasRole = ROLE_HIERARCHY[ctx.role] >= ROLE_HIERARCHY[minRole];
    if (!hasRole) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        reason: `Permissão insuficiente. Requer perfil "${minRole}" ou superior.`,
      };
    }

    const isAdmin = ctx.role === "admin";
    const isGestor = ROLE_HIERARCHY[ctx.role] >= ROLE_HIERARCHY["gestor"];

    return {
      canView: true,
      canEdit: isGestor,
      canDelete: isAdmin,
      canCreate: isGestor,
    };
  }

  canAccess(ctx: AccessContext, module: keyof FeatureSet): boolean {
    return this.checkAccess(ctx, module).canView;
  }

  checkLimit(ctx: AccessContext, limitKey: keyof PlanLimits, currentCount: number): {
    allowed: boolean;
    limit: number;
    current: number;
    reason?: string;
  } {
    const limits = featureFlags.getLimits(ctx.plan);
    const limit = limits[limitKey];
    const allowed = limit === -1 || currentCount < limit;
    return {
      allowed,
      limit,
      current: currentCount,
      reason: allowed ? undefined : `Limite de ${limitKey} atingido para o plano ${ctx.plan} (${currentCount}/${limit}).`,
    };
  }

  getAccessibleModules(ctx: AccessContext): (keyof FeatureSet)[] {
    const features = featureFlags.getFeatures(ctx.plan);
    return (Object.keys(features) as (keyof FeatureSet)[]).filter(
      (mod) => features[mod] && this.canAccess(ctx, mod)
    );
  }

  getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role];
  }
}

export const moduleGateway = new ModuleGateway();
export default moduleGateway;
