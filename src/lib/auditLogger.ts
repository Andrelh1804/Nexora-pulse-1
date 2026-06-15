import eventBus from "./eventBus";
import logger from "./logger";

export type AuditAction =
  | "user.login" | "user.logout" | "user.created" | "user.updated" | "user.deleted"
  | "tenant.created" | "tenant.updated" | "tenant.deleted"
  | "subscription.activated" | "subscription.canceled" | "subscription.upgraded"
  | "lead.created" | "lead.updated" | "lead.converted" | "lead.deleted"
  | "campaign.created" | "campaign.updated" | "campaign.paused" | "campaign.deleted"
  | "workflow.executed" | "workflow.failed"
  | "ai.interaction" | "capi.dispatched"
  | "file.uploaded" | "file.deleted"
  | "billing.charge" | "billing.refund"
  | "settings.updated" | "integration.connected" | "integration.disconnected"
  | "export.generated" | "report.accessed";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  tenantId: string;
  userId: string;
  userEmail?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  status: "success" | "failure" | "warning";
}

const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  "user.login": "low",
  "user.logout": "low",
  "user.created": "medium",
  "user.updated": "medium",
  "user.deleted": "high",
  "tenant.created": "medium",
  "tenant.updated": "medium",
  "tenant.deleted": "critical",
  "subscription.activated": "high",
  "subscription.canceled": "high",
  "subscription.upgraded": "medium",
  "lead.created": "low",
  "lead.updated": "low",
  "lead.converted": "medium",
  "lead.deleted": "medium",
  "campaign.created": "low",
  "campaign.updated": "low",
  "campaign.paused": "low",
  "campaign.deleted": "medium",
  "workflow.executed": "low",
  "workflow.failed": "high",
  "ai.interaction": "low",
  "capi.dispatched": "medium",
  "file.uploaded": "low",
  "file.deleted": "medium",
  "billing.charge": "high",
  "billing.refund": "high",
  "settings.updated": "medium",
  "integration.connected": "medium",
  "integration.disconnected": "medium",
  "export.generated": "low",
  "report.accessed": "low",
};

class AuditLoggerService {
  private entries: AuditEntry[] = [];
  private readonly MAX_ENTRIES = 2000;

  log(params: Omit<AuditEntry, "id" | "timestamp" | "severity">): AuditEntry {
    const entry: AuditEntry = {
      ...params,
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      severity: ACTION_SEVERITY[params.action] ?? "low",
      timestamp: new Date(),
    };

    this.entries = [entry, ...this.entries].slice(0, this.MAX_ENTRIES);

    logger.info(`[AUDIT] ${entry.action} by ${entry.userId} on ${entry.resource ?? "system"}`, {
      tenantId: entry.tenantId,
      module: "AuditLogger",
      data: { action: entry.action, status: entry.status, resourceId: entry.resourceId },
    });

    eventBus.emit("audit.logged", {
      tenantId: entry.tenantId,
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource ?? "system",
    });

    return entry;
  }

  getEntries(filters?: {
    tenantId?: string;
    userId?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    status?: "success" | "failure" | "warning";
    from?: Date;
    to?: Date;
    limit?: number;
  }): AuditEntry[] {
    let result = [...this.entries];
    if (filters?.tenantId) result = result.filter((e) => e.tenantId === filters.tenantId);
    if (filters?.userId) result = result.filter((e) => e.userId === filters.userId);
    if (filters?.action) result = result.filter((e) => e.action === filters.action);
    if (filters?.severity) result = result.filter((e) => e.severity === filters.severity);
    if (filters?.status) result = result.filter((e) => e.status === filters.status);
    if (filters?.from) result = result.filter((e) => e.timestamp >= filters.from!);
    if (filters?.to) result = result.filter((e) => e.timestamp <= filters.to!);
    return result.slice(0, filters?.limit ?? 100);
  }

  getStats(tenantId?: string) {
    const entries = tenantId ? this.entries.filter((e) => e.tenantId === tenantId) : this.entries;
    return {
      total: entries.length,
      byAction: entries.reduce((acc, e) => ({ ...acc, [e.action]: (acc[e.action] || 0) + 1 }), {} as Record<string, number>),
      bySeverity: entries.reduce((acc, e) => ({ ...acc, [e.severity]: (acc[e.severity] || 0) + 1 }), {} as Record<string, number>),
      byStatus: entries.reduce((acc, e) => ({ ...acc, [e.status]: (acc[e.status] || 0) + 1 }), {} as Record<string, number>),
      criticalCount: entries.filter((e) => e.severity === "critical").length,
      failureCount: entries.filter((e) => e.status === "failure").length,
    };
  }
}

export const auditLogger = new AuditLoggerService();
export default auditLogger;
