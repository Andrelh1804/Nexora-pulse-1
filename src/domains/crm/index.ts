import { CRMLead } from "../../types";
import leadRepository from "../../repositories/leadRepository";
import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";
import queue from "../../lib/queue";

export type PipelineStage = "novo" | "contato" | "proposta" | "fechado" | "perdido";

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
}

export interface WhatsAppMessage {
  id: string;
  tenantId: string;
  leadId?: string;
  from: string;
  to: string;
  content: string;
  direction: "inbound" | "outbound";
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: Date;
  isAutomated: boolean;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  tenantId: string;
  type: "note" | "call" | "email" | "whatsapp" | "meeting" | "status_change";
  description: string;
  userId: string;
  createdAt: Date;
}

class CRMDomain {
  private pipelines: Pipeline[] = [];
  private messages: WhatsAppMessage[] = [];
  private activities: LeadActivity[] = [];

  createLead(tenantId: string, userId: string, data: Omit<CRMLead, "id"> & { tenantId?: string }): CRMLead {
    const lead = leadRepository.create({ ...data, tenantId } as Omit<CRMLead, "id"> & { tenantId: string });

    this.addActivity({
      leadId: lead.id,
      tenantId,
      type: "note",
      description: `Lead criado: ${lead.name}`,
      userId,
    });

    queue.add("notifications.send", { type: "lead_created", tenantId, leadId: lead.id, leadName: lead.name }, { tenantId, priority: 4 });

    auditLogger.log({
      action: "lead.created",
      tenantId,
      userId,
      resource: "lead",
      resourceId: lead.id,
      details: { name: lead.name, value: lead.value, status: lead.status },
      status: "success",
    });

    return lead;
  }

  moveLead(leadId: string, tenantId: string, userId: string, newStatus: PipelineStage): CRMLead | undefined {
    const updated = leadRepository.update(leadId, { status: newStatus as CRMLead["status"] });
    if (!updated) return undefined;

    this.addActivity({
      leadId,
      tenantId,
      type: "status_change",
      description: `Status alterado para "${newStatus}"`,
      userId,
    });

    if (newStatus === "fechado") {
      queue.add("notifications.send", { type: "lead_converted", tenantId, leadId, value: updated.value }, { tenantId, priority: 7 });
    }

    logger.info(`[CRM] Lead ${leadId} moved to ${newStatus}`, { tenantId, module: "CRM" });
    return updated;
  }

  sendWhatsAppMessage(tenantId: string, userId: string, to: string, content: string, leadId?: string): WhatsAppMessage {
    const msg: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      tenantId,
      leadId,
      from: "nexora_instance",
      to,
      content,
      direction: "outbound",
      status: "sent",
      timestamp: new Date(),
      isAutomated: false,
    };
    this.messages.unshift(msg);

    queue.add("whatsapp.messages", { action: "send", tenantId, to, content, leadId }, { tenantId, priority: 8 });

    eventBus.emit("message.sent", { tenantId, channel: "whatsapp", to });

    auditLogger.log({
      action: "settings.updated",
      tenantId,
      userId,
      resource: "whatsapp.message",
      resourceId: msg.id,
      details: { to, isAutomated: false },
      status: "success",
    });

    return msg;
  }

  receiveWhatsAppMessage(tenantId: string, from: string, content: string, leadId?: string): WhatsAppMessage {
    const msg: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      tenantId,
      leadId,
      from,
      to: "nexora_instance",
      content,
      direction: "inbound",
      status: "delivered",
      timestamp: new Date(),
      isAutomated: false,
    };
    this.messages.unshift(msg);

    eventBus.emit("message.received", { tenantId, channel: "whatsapp", from, content });
    return msg;
  }

  addActivity(data: Omit<LeadActivity, "id" | "createdAt">): LeadActivity {
    const activity: LeadActivity = { ...data, id: `act_${Date.now()}`, createdAt: new Date() };
    this.activities.unshift(activity);
    return activity;
  }

  getLeads(tenantId: string): CRMLead[] {
    return leadRepository.findByTenantId(tenantId);
  }

  getLeadsByStage(tenantId: string): Record<PipelineStage, CRMLead[]> {
    const leads = this.getLeads(tenantId);
    const stages: PipelineStage[] = ["novo", "contato", "proposta", "fechado", "perdido"];
    return stages.reduce((acc, stage) => {
      acc[stage] = leads.filter((l) => l.status === stage);
      return acc;
    }, {} as Record<PipelineStage, CRMLead[]>);
  }

  getMessages(tenantId: string, limit = 50): WhatsAppMessage[] {
    return this.messages.filter((m) => m.tenantId === tenantId).slice(0, limit);
  }

  getActivities(leadId: string): LeadActivity[] {
    return this.activities.filter((a) => a.leadId === leadId);
  }

  getStats(tenantId: string) {
    const leads = this.getLeads(tenantId);
    const msgs = this.messages.filter((m) => m.tenantId === tenantId);
    return {
      totalLeads: leads.length,
      byStage: this.getLeadsByStage(tenantId),
      totalPipelineValue: leads.filter((l) => l.status !== "fechado").reduce((s, l) => s + l.value, 0),
      closedValue: leads.filter((l) => l.status === "fechado").reduce((s, l) => s + l.value, 0),
      conversionRate: leads.length > 0 ? ((leads.filter((l) => l.status === "fechado").length / leads.length) * 100).toFixed(1) + "%" : "0%",
      totalMessages: msgs.length,
      unreadMessages: msgs.filter((m) => m.direction === "inbound" && m.status === "delivered").length,
    };
  }
}

export const crmDomain = new CRMDomain();
export default crmDomain;
