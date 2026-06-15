// Usage Engine — Block 2: Per-plan consumption limits

export type PlanTier = "basic" | "premium" | "enterprise";

export interface PlanLimits {
  aiCallsPerMonth: number;
  leadsTotal: number;
  campaignsTotal: number;
  usersTotal: number;
  workflowsTotal: number;
  storageGB: number;
  socialPostsPerMonth: number;
  whatsappMessagesPerMonth: number;
}

export interface UsageStats {
  aiCalls: number;
  leads: number;
  campaigns: number;
  users: number;
  workflows: number;
  storageGB: number;
  socialPosts: number;
  whatsappMessages: number;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  basic: {
    aiCallsPerMonth: 50,
    leadsTotal: 200,
    campaignsTotal: 5,
    usersTotal: 2,
    workflowsTotal: 3,
    storageGB: 1,
    socialPostsPerMonth: 20,
    whatsappMessagesPerMonth: 100,
  },
  premium: {
    aiCallsPerMonth: 500,
    leadsTotal: 2000,
    campaignsTotal: 30,
    usersTotal: 10,
    workflowsTotal: 20,
    storageGB: 10,
    socialPostsPerMonth: 200,
    whatsappMessagesPerMonth: 1000,
  },
  enterprise: {
    aiCallsPerMonth: Infinity,
    leadsTotal: Infinity,
    campaignsTotal: Infinity,
    usersTotal: Infinity,
    workflowsTotal: Infinity,
    storageGB: Infinity,
    socialPostsPerMonth: Infinity,
    whatsappMessagesPerMonth: Infinity,
  },
};

export const PLAN_PRICES: Record<PlanTier, { brl: number; label: string }> = {
  basic: { brl: 197, label: "Starter" },
  premium: { brl: 497, label: "Pro" },
  enterprise: { brl: 1997, label: "Enterprise" },
};

export function isWithinLimit(
  plan: PlanTier,
  resource: keyof PlanLimits,
  currentUsage: number
): boolean {
  const limit = PLAN_LIMITS[plan][resource];
  return limit === Infinity || currentUsage < limit;
}

export function getUsagePercent(
  plan: PlanTier,
  resource: keyof PlanLimits,
  currentUsage: number
): number {
  const limit = PLAN_LIMITS[plan][resource];
  if (limit === Infinity) return 0;
  return Math.min(100, Math.round((currentUsage / limit) * 100));
}

export function formatLimit(value: number): string {
  if (value === Infinity) return "Ilimitado";
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

export function getUsageColor(percent: number): string {
  if (percent >= 90) return "text-red-400";
  if (percent >= 70) return "text-yellow-400";
  return "text-green-400";
}

export function getUsageBarColor(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-yellow-500";
  return "bg-purple-500";
}

export default {
  PLAN_LIMITS,
  PLAN_PRICES,
  isWithinLimit,
  getUsagePercent,
  formatLimit,
  getUsageColor,
  getUsageBarColor,
};
