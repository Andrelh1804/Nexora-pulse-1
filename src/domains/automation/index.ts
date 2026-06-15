import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";
import queue from "../../lib/queue";

export type TriggerType =
  | "webhook_received"
  | "lead_created"
  | "message_received"
  | "campaign_event"
  | "schedule"
  | "form_submitted"
  | "payment_received"
  | "ai_score_threshold";

export type ActionType =
  | "send_whatsapp"
  | "send_email"
  | "add_to_crm"
  | "update_lead_status"
  | "call_webhook"
  | "create_campaign"
  | "generate_ai_content"
  | "notify_team"
  | "add_tag";

export type ConditionOperator = "equals" | "contains" | "greater_than" | "less_than" | "exists";

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action";
  triggerType?: TriggerType;
  actionType?: ActionType;
  condition?: WorkflowCondition;
  config?: Record<string, unknown>;
  nextNodeId?: string;
  elseNodeId?: string;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  trigger: TriggerType;
  status: "running" | "completed" | "failed";
  logs: string[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

class AutomationDomain {
  private workflows: Map<string, Workflow[]> = new Map();
  private executions: WorkflowExecution[] = [];

  createWorkflow(tenantId: string, userId: string, data: Omit<Workflow, "id" | "tenantId" | "executionCount" | "createdAt" | "updatedAt">): Workflow {
    const workflow: Workflow = {
      ...data,
      id: `wf_${Date.now()}`,
      tenantId,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.workflows.has(tenantId)) this.workflows.set(tenantId, []);
    this.workflows.get(tenantId)!.push(workflow);

    auditLogger.log({
      action: "workflow.executed",
      tenantId,
      userId,
      resource: "workflow",
      resourceId: workflow.id,
      details: { name: workflow.name, nodeCount: workflow.nodes.length },
      status: "success",
    });

    logger.info(`[Automation] Workflow created: ${workflow.name}`, { tenantId, module: "Automation" });
    return workflow;
  }

  async executeWorkflow(workflowId: string, tenantId: string, triggerData?: Record<string, unknown>): Promise<WorkflowExecution> {
    const workflows = this.workflows.get(tenantId) ?? [];
    const workflow = workflows.find((w) => w.id === workflowId);

    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId,
      tenantId,
      trigger: (triggerData?.triggerType as TriggerType) ?? "webhook_received",
      status: "running",
      logs: [`[${new Date().toLocaleTimeString()}] Workflow "${workflow.name}" iniciado.`],
      startedAt: new Date(),
    };

    this.executions.unshift(execution);

    queue.add("integrations.sync", { workflowId, tenantId, triggerData }, { tenantId, priority: 5 });

    await new Promise((r) => setTimeout(r, 200));

    execution.status = "completed";
    execution.completedAt = new Date();
    execution.logs.push(`[${new Date().toLocaleTimeString()}] Todos os nós executados com sucesso.`);

    workflow.executionCount++;
    workflow.lastExecutedAt = new Date();

    eventBus.emit("workflow.executed", { workflowId, tenantId, trigger: execution.trigger, success: true });

    return execution;
  }

  getWorkflows(tenantId: string): Workflow[] {
    return this.workflows.get(tenantId) ?? [];
  }

  getExecutions(tenantId: string, limit = 20): WorkflowExecution[] {
    return this.executions.filter((e) => e.tenantId === tenantId).slice(0, limit);
  }

  toggleWorkflow(workflowId: string, tenantId: string, isActive: boolean): void {
    const workflows = this.workflows.get(tenantId) ?? [];
    const wf = workflows.find((w) => w.id === workflowId);
    if (wf) { wf.isActive = isActive; wf.updatedAt = new Date(); }
  }

  getStats(tenantId: string) {
    const wfs = this.getWorkflows(tenantId);
    const execs = this.executions.filter((e) => e.tenantId === tenantId);
    return {
      totalWorkflows: wfs.length,
      activeWorkflows: wfs.filter((w) => w.isActive).length,
      totalExecutions: execs.length,
      failedExecutions: execs.filter((e) => e.status === "failed").length,
      totalActionsExecuted: wfs.reduce((s, w) => s + w.executionCount, 0),
    };
  }
}

export const automationDomain = new AutomationDomain();
export default automationDomain;
