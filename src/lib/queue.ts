import logger from "./logger";

export type QueueName =
  | "ai.requests"
  | "whatsapp.messages"
  | "integrations.sync"
  | "reports.generate"
  | "exports.process"
  | "notifications.send"
  | "capi.dispatch"
  | "billing.webhooks";

export interface QueueJob<T = unknown> {
  id: string;
  queue: QueueName;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: "waiting" | "active" | "completed" | "failed" | "delayed";
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  tenantId?: string;
}

type JobProcessor<T> = (job: QueueJob<T>) => Promise<void>;

class NexoraQueue {
  private queues: Map<QueueName, QueueJob<unknown>[]> = new Map();
  private processors: Map<QueueName, JobProcessor<unknown>> = new Map();
  private processing = new Set<string>();

  add<T>(
    queueName: QueueName,
    data: T,
    options?: { priority?: number; maxAttempts?: number; tenantId?: string }
  ): QueueJob<T> {
    const job: QueueJob<T> = {
      id: `job_${queueName}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      queue: queueName,
      data,
      priority: options?.priority ?? 5,
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      status: "waiting",
      createdAt: new Date(),
      tenantId: options?.tenantId,
    };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    const queue = this.queues.get(queueName)!;
    queue.push(job as QueueJob<unknown>);
    queue.sort((a, b) => b.priority - a.priority);

    logger.debug(`[Queue] Job added to "${queueName}"`, {
      module: "Queue",
      tenantId: options?.tenantId,
      data: { jobId: job.id, queue: queueName },
    });

    this.tryProcess(queueName);
    return job;
  }

  process<T>(queueName: QueueName, processor: JobProcessor<T>): void {
    this.processors.set(queueName, processor as JobProcessor<unknown>);
  }

  private async tryProcess(queueName: QueueName): Promise<void> {
    const processor = this.processors.get(queueName);
    if (!processor) return;

    const queue = this.queues.get(queueName) ?? [];
    const nextJob = queue.find((j) => j.status === "waiting" && !this.processing.has(j.id));
    if (!nextJob) return;

    this.processing.add(nextJob.id);
    nextJob.status = "active";
    nextJob.processedAt = new Date();
    nextJob.attempts++;

    try {
      await processor(nextJob);
      nextJob.status = "completed";
      nextJob.completedAt = new Date();
      logger.info(`[Queue] Job "${nextJob.id}" completed`, { module: "Queue", tenantId: nextJob.tenantId });
    } catch (err: unknown) {
      nextJob.error = err instanceof Error ? err.message : String(err);
      if (nextJob.attempts >= nextJob.maxAttempts) {
        nextJob.status = "failed";
        nextJob.failedAt = new Date();
        logger.error(`[Queue] Job "${nextJob.id}" failed after ${nextJob.attempts} attempts`, {
          module: "Queue",
          tenantId: nextJob.tenantId,
          error: nextJob.error,
        });
      } else {
        nextJob.status = "waiting";
        logger.warn(`[Queue] Job "${nextJob.id}" retrying (${nextJob.attempts}/${nextJob.maxAttempts})`, {
          module: "Queue",
          tenantId: nextJob.tenantId,
        });
      }
    } finally {
      this.processing.delete(nextJob.id);
      setTimeout(() => this.tryProcess(queueName), 100);
    }
  }

  getStats(queueName?: QueueName) {
    const entries = queueName
      ? [[queueName, this.queues.get(queueName) ?? []]] as [QueueName, QueueJob<unknown>[]][]
      : [...this.queues.entries()];

    return entries.map(([name, jobs]) => ({
      queue: name,
      waiting: jobs.filter((j) => j.status === "waiting").length,
      active: jobs.filter((j) => j.status === "active").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      total: jobs.length,
    }));
  }
}

export const queue = new NexoraQueue();
export default queue;
