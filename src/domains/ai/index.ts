import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";
import queue from "../../lib/queue";

export type AgentType = "social_media" | "copywriter" | "analyst" | "traffic_manager" | "general";

export interface AgentRequest {
  agentType: AgentType;
  tenantId: string;
  userId: string;
  tenantName: string;
  tenantData?: Record<string, unknown>;
  userInput?: string;
  context?: string;
}

export interface AgentResponse {
  requestId: string;
  agentType: AgentType;
  content: string;
  isSimulated: boolean;
  tokensUsed?: number;
  processingMs?: number;
  timestamp: Date;
}

export interface AIMemoryEntry {
  id: string;
  tenantId: string;
  agentType: AgentType;
  prompt: string;
  response: string;
  timestamp: Date;
  tags?: string[];
}

export interface AIUsageStats {
  tenantId: string;
  totalRequests: number;
  todayRequests: number;
  byAgent: Record<AgentType, number>;
  avgResponseMs: number;
  simulatedRequests: number;
}

class AIDomain {
  private memory: AIMemoryEntry[] = [];
  private usageStats: Map<string, AIUsageStats> = new Map();
  private readonly API_ENDPOINT = "/api/v1/ai/agent";

  async callAgent(request: AgentRequest): Promise<AgentResponse> {
    const requestId = `ai_req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    logger.info(`[AI] Agent request: ${request.agentType} for ${request.tenantName}`, {
      tenantId: request.tenantId,
      module: "AI",
      data: { agentType: request.agentType, requestId },
    });

    this.incrementUsage(request.tenantId, request.agentType);

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: request.agentType,
          tenantName: request.tenantName,
          tenantData: request.tenantData,
          userInput: request.userInput,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const processingMs = Date.now() - startTime;
      const isSimulated = !!data.note;

      const agentResponse: AgentResponse = {
        requestId,
        agentType: request.agentType,
        content: data.result ?? "",
        isSimulated,
        processingMs,
        timestamp: new Date(),
      };

      this.storeMemory({
        tenantId: request.tenantId,
        agentType: request.agentType,
        prompt: request.userInput ?? "",
        response: agentResponse.content,
        tags: [request.agentType, request.tenantName],
      });

      eventBus.emit("ai.interaction.created", {
        tenantId: request.tenantId,
        agentType: request.agentType,
        success: true,
      });

      auditLogger.log({
        action: "ai.interaction",
        tenantId: request.tenantId,
        userId: request.userId,
        resource: "ai.agent",
        details: { agentType: request.agentType, isSimulated, processingMs },
        status: "success",
      });

      return agentResponse;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[AI] Agent error: ${errMsg}`, { tenantId: request.tenantId, module: "AI" });

      eventBus.emit("ai.interaction.failed", {
        tenantId: request.tenantId,
        agentType: request.agentType,
        error: errMsg,
      });

      throw error;
    }
  }

  queueAgentRequest(request: AgentRequest): string {
    const job = queue.add("ai.requests", request, {
      tenantId: request.tenantId,
      priority: 6,
      maxAttempts: 2,
    });
    return job.id;
  }

  private storeMemory(entry: Omit<AIMemoryEntry, "id" | "timestamp">): void {
    const mem: AIMemoryEntry = {
      ...entry,
      id: `mem_${Date.now()}`,
      timestamp: new Date(),
    };
    this.memory = [mem, ...this.memory].slice(0, 500);
  }

  getMemory(tenantId: string, agentType?: AgentType, limit = 10): AIMemoryEntry[] {
    return this.memory
      .filter((m) => m.tenantId === tenantId && (!agentType || m.agentType === agentType))
      .slice(0, limit);
  }

  private incrementUsage(tenantId: string, agentType: AgentType): void {
    const existing = this.usageStats.get(tenantId);
    const today = new Date().toDateString();

    if (!existing) {
      this.usageStats.set(tenantId, {
        tenantId,
        totalRequests: 1,
        todayRequests: 1,
        byAgent: { social_media: 0, copywriter: 0, analyst: 0, traffic_manager: 0, general: 0, [agentType]: 1 },
        avgResponseMs: 0,
        simulatedRequests: 0,
      });
    } else {
      existing.totalRequests++;
      existing.todayRequests++;
      existing.byAgent[agentType] = (existing.byAgent[agentType] ?? 0) + 1;
    }
  }

  getUsageStats(tenantId: string): AIUsageStats | undefined {
    return this.usageStats.get(tenantId);
  }

  clearMemory(tenantId?: string): void {
    if (tenantId) {
      this.memory = this.memory.filter((m) => m.tenantId !== tenantId);
    } else {
      this.memory = [];
    }
  }
}

export const aiDomain = new AIDomain();
export default aiDomain;
