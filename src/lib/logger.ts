export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  tenantId?: string;
  userId?: string;
  module?: string;
  data?: Record<string, unknown>;
  error?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  maxEntries: number;
  enableConsole: boolean;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: "color: #9CA3AF",
  info: "color: #60A5FA",
  warn: "color: #FBBF24",
  error: "color: #F87171; font-weight: bold",
};

class Logger {
  private entries: LogEntry[] = [];
  private config: LoggerConfig = {
    minLevel: "info",
    maxEntries: 500,
    enableConsole: true,
  };
  private subscribers: ((entry: LogEntry) => void)[] = [];

  private log(level: LogLevel, message: string, ctx?: Omit<LogEntry, "id" | "level" | "message" | "timestamp">): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.config.minLevel]) return;

    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      level,
      message,
      timestamp: new Date(),
      ...ctx,
    };

    this.entries = [entry, ...this.entries].slice(0, this.config.maxEntries);

    if (this.config.enableConsole) {
      const prefix = `[${level.toUpperCase()}]${ctx?.tenantId ? ` [${ctx.tenantId}]` : ""}${ctx?.module ? ` [${ctx.module}]` : ""}`;
      console.log(`%c${prefix} ${message}`, LEVEL_STYLES[level], ctx?.data || "");
    }

    this.subscribers.forEach((sub) => sub(entry));
  }

  debug(message: string, ctx?: Omit<LogEntry, "id" | "level" | "message" | "timestamp">): void {
    this.log("debug", message, ctx);
  }

  info(message: string, ctx?: Omit<LogEntry, "id" | "level" | "message" | "timestamp">): void {
    this.log("info", message, ctx);
  }

  warn(message: string, ctx?: Omit<LogEntry, "id" | "level" | "message" | "timestamp">): void {
    this.log("warn", message, ctx);
  }

  error(message: string, ctx?: Omit<LogEntry, "id" | "level" | "message" | "timestamp">): void {
    this.log("error", message, ctx);
  }

  subscribe(handler: (entry: LogEntry) => void): () => void {
    this.subscribers.push(handler);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== handler);
    };
  }

  getEntries(filters?: { level?: LogLevel; tenantId?: string; module?: string; limit?: number }): LogEntry[] {
    let result = [...this.entries];
    if (filters?.level) result = result.filter((e) => LEVEL_ORDER[e.level] >= LEVEL_ORDER[filters.level!]);
    if (filters?.tenantId) result = result.filter((e) => e.tenantId === filters.tenantId);
    if (filters?.module) result = result.filter((e) => e.module === filters.module);
    return result.slice(0, filters?.limit ?? 100);
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  clear(): void {
    this.entries = [];
  }
}

export const logger = new Logger();
export default logger;
