import { AuditLog } from "../types";
import { BaseRepository, generateId } from "./index";
import { GLOBAL_AUDIT_LOGS } from "../data";

class AuditLogRepository implements BaseRepository<AuditLog> {
  private store: AuditLog[] = [...GLOBAL_AUDIT_LOGS];

  findById(id: string): AuditLog | undefined {
    return this.store.find((l) => l.id === id);
  }

  findAll(filters?: Partial<AuditLog>): AuditLog[] {
    if (!filters) return [...this.store];
    return this.store.filter((l) =>
      Object.entries(filters).every(([k, v]) => (l as unknown as Record<string, unknown>)[k] === v)
    );
  }

  findByTenantId(tenantId: string): AuditLog[] {
    return this.store.filter((l) => l.tenant === tenantId || l.tenant.toLowerCase().includes(tenantId));
  }

  findByUser(userEmail: string): AuditLog[] {
    return this.store.filter((l) => l.user === userEmail);
  }

  create(data: Omit<AuditLog, "id">): AuditLog {
    const log: AuditLog = { ...data, id: generateId("log") };
    this.store.unshift(log);
    if (this.store.length > 2000) this.store = this.store.slice(0, 2000);
    return log;
  }

  update(id: string, data: Partial<AuditLog>): AuditLog | undefined {
    const idx = this.store.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  delete(id: string): boolean {
    const idx = this.store.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    return true;
  }

  count(filters?: Partial<AuditLog>): number {
    return this.findAll(filters).length;
  }

  prepend(log: AuditLog): void {
    this.store.unshift(log);
    if (this.store.length > 2000) this.store.pop();
  }

  getAll(): AuditLog[] {
    return [...this.store];
  }

  setAll(logs: AuditLog[]): void {
    this.store = [...logs];
  }
}

export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;
