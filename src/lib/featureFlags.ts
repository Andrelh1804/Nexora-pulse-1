export type PlanTier = "basic" | "premium" | "enterprise";

export interface FeatureSet {
  social_media: boolean;
  ai_agents: boolean;
  traffic_manager: boolean;
  crm_whatsapp: boolean;
  marketplace: boolean;
  admin_cockpit: boolean;
  automation_tests: boolean;
  nexora_sites: boolean;
  nexora_design: boolean;
  nexora_automation: boolean;
  capi_dispatcher: boolean;
  ai_predictor: boolean;
  fast_copy_generator: boolean;
  smart_budget_rules: boolean;
  export_reports: boolean;
  white_label: boolean;
  multi_user: boolean;
  api_access: boolean;
}

export interface PlanLimits {
  maxSocialChannels: number;
  maxCampaigns: number;
  maxLeads: number;
  maxAiCallsPerDay: number;
  maxWorkflows: number;
  maxUsers: number;
  maxSites: number;
  maxCreatives: number;
  dataRetentionDays: number;
}

const PLAN_FEATURES: Record<PlanTier, FeatureSet> = {
  basic: {
    social_media: true,
    ai_agents: false,
    traffic_manager: false,
    crm_whatsapp: false,
    marketplace: true,
    admin_cockpit: false,
    automation_tests: false,
    nexora_sites: false,
    nexora_design: false,
    nexora_automation: false,
    capi_dispatcher: false,
    ai_predictor: false,
    fast_copy_generator: false,
    smart_budget_rules: false,
    export_reports: false,
    white_label: false,
    multi_user: false,
    api_access: false,
  },
  premium: {
    social_media: true,
    ai_agents: true,
    traffic_manager: true,
    crm_whatsapp: true,
    marketplace: true,
    admin_cockpit: false,
    automation_tests: true,
    nexora_sites: true,
    nexora_design: true,
    nexora_automation: true,
    capi_dispatcher: true,
    ai_predictor: true,
    fast_copy_generator: true,
    smart_budget_rules: true,
    export_reports: true,
    white_label: false,
    multi_user: false,
    api_access: false,
  },
  enterprise: {
    social_media: true,
    ai_agents: true,
    traffic_manager: true,
    crm_whatsapp: true,
    marketplace: true,
    admin_cockpit: true,
    automation_tests: true,
    nexora_sites: true,
    nexora_design: true,
    nexora_automation: true,
    capi_dispatcher: true,
    ai_predictor: true,
    fast_copy_generator: true,
    smart_budget_rules: true,
    export_reports: true,
    white_label: true,
    multi_user: true,
    api_access: true,
  },
};

const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  basic: {
    maxSocialChannels: 1,
    maxCampaigns: 3,
    maxLeads: 200,
    maxAiCallsPerDay: 5,
    maxWorkflows: 0,
    maxUsers: 1,
    maxSites: 0,
    maxCreatives: 0,
    dataRetentionDays: 30,
  },
  premium: {
    maxSocialChannels: -1,
    maxCampaigns: 30,
    maxLeads: 5000,
    maxAiCallsPerDay: 100,
    maxWorkflows: 10,
    maxUsers: 3,
    maxSites: 3,
    maxCreatives: 20,
    dataRetentionDays: 180,
  },
  enterprise: {
    maxSocialChannels: -1,
    maxCampaigns: -1,
    maxLeads: -1,
    maxAiCallsPerDay: -1,
    maxWorkflows: -1,
    maxUsers: -1,
    maxSites: -1,
    maxCreatives: -1,
    dataRetentionDays: 365,
  },
};

class FeatureFlagService {
  private overrides: Partial<Record<string, Partial<FeatureSet>>> = {};

  getFeatures(plan: PlanTier): FeatureSet {
    const base = PLAN_FEATURES[plan];
    const tenantOverride = this.overrides[plan] || {};
    return { ...base, ...tenantOverride };
  }

  getLimits(plan: PlanTier): PlanLimits {
    return PLAN_LIMITS[plan];
  }

  isEnabled(plan: PlanTier, feature: keyof FeatureSet): boolean {
    return this.getFeatures(plan)[feature];
  }

  isWithinLimit(plan: PlanTier, limitKey: keyof PlanLimits, currentCount: number): boolean {
    const limit = PLAN_LIMITS[plan][limitKey];
    if (limit === -1) return true;
    return currentCount < limit;
  }

  setOverride(planOrTenantId: string, feature: keyof FeatureSet, value: boolean): void {
    if (!this.overrides[planOrTenantId]) {
      this.overrides[planOrTenantId] = {};
    }
    this.overrides[planOrTenantId]![feature] = value;
  }

  getAllPlans(): PlanTier[] {
    return ["basic", "premium", "enterprise"];
  }

  getPlanFeatureMatrix() {
    return Object.entries(PLAN_FEATURES).map(([plan, features]) => ({
      plan,
      features,
      limits: PLAN_LIMITS[plan as PlanTier],
    }));
  }
}

export const featureFlags = new FeatureFlagService();
export default featureFlags;
