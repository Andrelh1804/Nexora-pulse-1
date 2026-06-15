export type NexoraEventMap = {
  "user.created": { userId: string; email: string; tenantId: string; role: string };
  "user.updated": { userId: string; tenantId: string; changes: Record<string, unknown> };
  "user.deleted": { userId: string; tenantId: string };
  "user.login": { userId: string; email: string; tenantId: string; ip?: string };
  "user.logout": { userId: string; tenantId: string };

  "tenant.created": { tenantId: string; name: string; plan: string };
  "tenant.updated": { tenantId: string; changes: Record<string, unknown> };
  "tenant.deleted": { tenantId: string };

  "subscription.activated": { tenantId: string; plan: string; stripeSubscriptionId?: string };
  "subscription.canceled": { tenantId: string; reason?: string };
  "subscription.past_due": { tenantId: string; invoiceId?: string };
  "subscription.upgraded": { tenantId: string; fromPlan: string; toPlan: string };

  "lead.created": { leadId: string; tenantId: string; name: string; source?: string };
  "lead.updated": { leadId: string; tenantId: string; status: string };
  "lead.converted": { leadId: string; tenantId: string; value: number };

  "campaign.created": { campaignId: string; tenantId: string; platform: string; budget: number };
  "campaign.updated": { campaignId: string; tenantId: string; changes: Record<string, unknown> };
  "campaign.paused": { campaignId: string; tenantId: string; reason?: string };

  "workflow.executed": { workflowId: string; tenantId: string; trigger: string; success: boolean };
  "workflow.failed": { workflowId: string; tenantId: string; error: string };

  "message.received": { tenantId: string; channel: "whatsapp" | "email" | "sms"; from: string; content: string };
  "message.sent": { tenantId: string; channel: "whatsapp" | "email" | "sms"; to: string };

  "ai.interaction.created": { tenantId: string; agentType: string; tokensUsed?: number; success: boolean };
  "ai.interaction.failed": { tenantId: string; agentType: string; error: string };

  "file.uploaded": { tenantId: string; bucket: string; filename: string; size: number };
  "file.deleted": { tenantId: string; bucket: string; filename: string };

  "notification.sent": { tenantId: string; userId: string; type: string; channel: string };
  "audit.logged": { tenantId: string; userId: string; action: string; resource: string };
};

type Handler<T> = (payload: T) => void | Promise<void>;

class EventBus {
  // Internal storage uses unknown[] to avoid complex generic constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Record<string, ((...args: any[]) => void)[]> = {};
  private history: { event: string; payload: unknown; timestamp: Date }[] = [];
  private readonly MAX_HISTORY = 200;

  on<K extends keyof NexoraEventMap>(event: K, handler: Handler<NexoraEventMap[K]>): () => void {
    const key = String(event);
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof NexoraEventMap>(event: K, handler: Handler<NexoraEventMap[K]>): void {
    const key = String(event);
    if (!this.listeners[key]) return;
    this.listeners[key] = this.listeners[key].filter((h) => h !== handler);
  }

  emit<K extends keyof NexoraEventMap>(event: K, payload: NexoraEventMap[K]): void {
    this.history = [{ event: String(event), payload, timestamp: new Date() }, ...this.history].slice(0, this.MAX_HISTORY);

    const handlers = this.listeners[String(event)] as Handler<NexoraEventMap[K]>[] | undefined;
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${String(event)}":`, err);
      }
    });
  }

  once<K extends keyof NexoraEventMap>(event: K, handler: Handler<NexoraEventMap[K]>): void {
    const wrapped: Handler<NexoraEventMap[K]> = (payload) => {
      handler(payload);
      this.off(event, wrapped);
    };
    this.on(event, wrapped);
  }

  getHistory(limit = 50) {
    return this.history.slice(0, limit);
  }

  clearHistory() {
    this.history = [];
  }
}

export const eventBus = new EventBus();
export default eventBus;
