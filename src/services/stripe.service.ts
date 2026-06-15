/**
 * STRIPE BILLING SERVICE
 * Real integration activates automatically when STRIPE_SECRET_KEY is set.
 * Without it, all methods return realistic simulation data.
 *
 * Fase 2.4 — Billing & Subscriptions
 */

const STRIPE_SECRET_KEY = typeof process !== "undefined" ? process.env.STRIPE_SECRET_KEY : undefined;
const IS_REAL = !!STRIPE_SECRET_KEY;

export interface StripeCheckoutSession {
  id: string;
  url: string;
  mode: "subscription" | "payment";
  status: "open" | "complete" | "expired";
}

export interface StripeSubscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
}

export interface StripePlan {
  id: string;
  name: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
}

export const NEXORA_PLANS: Record<string, StripePlan> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceId: process.env.STRIPE_PRICE_BASIC ?? "price_basic_placeholder",
    amount: 19700,
    currency: "brl",
    interval: "month",
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceId: process.env.STRIPE_PRICE_PREMIUM ?? "price_premium_placeholder",
    amount: 49700,
    currency: "brl",
    interval: "month",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? "price_enterprise_placeholder",
    amount: 199700,
    currency: "brl",
    interval: "month",
  },
};

async function createCheckoutSession(params: {
  customerId?: string;
  priceId: string;
  tenantId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<StripeCheckoutSession> {
  if (IS_REAL) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ["card"],
      line_items: [{ price: params.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: params.trialDays ? { trial_period_days: params.trialDays } : undefined,
      metadata: { tenantId: params.tenantId },
    });
    return { id: session.id, url: session.url!, mode: "subscription", status: "open" };
  }

  // Simulation
  return {
    id: `cs_sim_${Date.now()}`,
    url: `${params.successUrl}?simulated=true`,
    mode: "subscription",
    status: "open",
  };
}

async function createCustomerPortal(customerId: string, returnUrl: string): Promise<string> {
  if (IS_REAL) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY!);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }
  return `${returnUrl}?portal=simulated`;
}

async function getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
  if (IS_REAL && subscriptionId && !subscriptionId.startsWith("sim_")) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY!);
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      id: sub.id,
      status: sub.status,
      plan: "premium",
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    };
  }

  return {
    id: subscriptionId,
    status: "trialing",
    plan: "premium",
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    trialEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  };
}

async function handleWebhook(payload: Buffer, signature: string): Promise<{ type: string; data: unknown }> {
  if (IS_REAL) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY!);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return { type: event.type, data: event.data };
  }
  return { type: "simulated.event", data: {} };
}

export default { createCheckoutSession, createCustomerPortal, getSubscription, handleWebhook, IS_REAL, NEXORA_PLANS };
