export interface BaseRepository<T> {
  findById(id: string): T | undefined;
  findAll(filters?: Partial<T>): T[];
  create(data: Omit<T, "id">): T;
  update(id: string, data: Partial<T>): T | undefined;
  delete(id: string): boolean;
  count(filters?: Partial<T>): number;
}

export interface TenantScoped<T> extends BaseRepository<T> {
  findByTenantId(tenantId: string): T[];
  deleteByTenantId(tenantId: string): number;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export { default as LeadRepository } from "./leadRepository";
export { default as CampaignRepository } from "./campaignRepository";
export { default as AuditLogRepository } from "./auditLogRepository";
