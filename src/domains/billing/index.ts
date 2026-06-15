import { SAAS_PLANS } from "../../data";
import { SaaSPlan } from "../../types";
import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";
import queue from "../../lib/queue";

export type SubscriptionStatus = "active_trial" | "active_paid" | "past_due" | "canceled" | "unpaid";

export interface Subscription {
  id: string;
  tenantId: string;
  userId: string;
  plan: "basic" | "premium" | "enterprise";
  status: SubscriptionStatus;
  trialEndsAt?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  currency: "BRL";
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
}

export interface PlanPrice {
  planId: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  stripePriceId?: string;
}

const PLAN_PRICES: Record<string, PlanPrice> = {
  basic: { planId: "basic", amount: 197, currency: "BRL", interval: "month" },
  premium: { planId: "premium", amount: 497, currency: "BRL", interval: "month" },
  enterprise: { planId: "enterprise", amount: 1997, currency: "BRL", interval: "month" },
};

class BillingDomain {
  private subscriptions: Map<string, Subscription> = new Map();
  private invoices: Invoice[] = [];

  getPlans(): SaaSPlan[] {
    return SAAS_PLANS;
  }

  getPlanPrice(planId: string): PlanPrice | undefined {
    return PLAN_PRICES[planId];
  }

  async createTrialSubscription(tenantId: string, userId: string, plan: "basic" | "premium" | "enterprise"): Promise<Subscription> {
    const trialDays = 15;
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      id: `sub_trial_${Date.now()}`,
      tenantId,
      userId,
      plan,
      status: "active_trial",
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.set(tenantId, subscription);

    auditLogger.log({
      action: "subscription.activated",
      tenantId,
      userId,
      resource: "subscription",
      resourceId: subscription.id,
      details: { plan, type: "trial", trialDays },
      status: "success",
    });

    eventBus.emit("subscription.activated", { tenantId, plan });
    logger.info(`[Billing] Trial subscription created for tenant ${tenantId}`, { module: "Billing", tenantId });

    return subscription;
  }

  async activatePaidSubscription(
    tenantId: string,
    userId: string,
    plan: "basic" | "premium" | "enterprise",
    stripeData?: { subscriptionId: string; customerId: string }
  ): Promise<Subscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription: Subscription = {
      id: `sub_paid_${Date.now()}`,
      tenantId,
      userId,
      plan,
      status: "active_paid",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: stripeData?.subscriptionId,
      stripeCustomerId: stripeData?.customerId,
      createdAt: now,
      updatedAt: now,
    };

    const previousSub = this.subscriptions.get(tenantId);
    this.subscriptions.set(tenantId, subscription);

    if (previousSub && previousSub.plan !== plan) {
      eventBus.emit("subscription.upgraded", { tenantId, fromPlan: previousSub.plan, toPlan: plan });
    } else {
      eventBus.emit("subscription.activated", { tenantId, plan, stripeSubscriptionId: stripeData?.subscriptionId });
    }

    queue.add("billing.webhooks", { event: "subscription.activated", tenantId, plan }, { tenantId, priority: 8 });

    auditLogger.log({
      action: "subscription.activated",
      tenantId,
      userId,
      resource: "subscription",
      resourceId: subscription.id,
      details: { plan, type: "paid" },
      status: "success",
    });

    return subscription;
  }

  async cancelSubscription(tenantId: string, userId: string, reason?: string): Promise<void> {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) return;

    sub.cancelAtPeriodEnd = true;
    sub.updatedAt = new Date();

    auditLogger.log({
      action: "subscription.canceled",
      tenantId,
      userId,
      resource: "subscription",
      resourceId: sub.id,
      details: { reason },
      status: "success",
    });

    eventBus.emit("subscription.canceled", { tenantId, reason });
  }

  getSubscription(tenantId: string): Subscription | undefined {
    return this.subscriptions.get(tenantId);
  }

  getInvoices(tenantId: string): Invoice[] {
    return this.invoices.filter((i) => i.tenantId === tenantId);
  }

  calculateMRR(): number {
    return [...this.subscriptions.values()]
      .filter((s) => s.status === "active_paid")
      .reduce((sum, s) => sum + (PLAN_PRICES[s.plan]?.amount ?? 0), 0);
  }

  getDashboardStats() {
    const all = [...this.subscriptions.values()];
    return {
      totalSubscriptions: all.length,
      activeTrials: all.filter((s) => s.status === "active_trial").length,
      activePaid: all.filter((s) => s.status === "active_paid").length,
      canceled: all.filter((s) => s.status === "canceled").length,
      pastDue: all.filter((s) => s.status === "past_due").length,
      mrr: this.calculateMRR(),
      byPlan: {
        basic: all.filter((s) => s.plan === "basic").length,
        premium: all.filter((s) => s.plan === "premium").length,
        enterprise: all.filter((s) => s.plan === "enterprise").length,
      },
    };
  }
}

export const billingDomain = new BillingDomain();
export default billingDomain;
