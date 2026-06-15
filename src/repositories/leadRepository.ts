import { CRMLead } from "../types";
import { TenantScoped, generateId } from "./index";
import { INITIAL_LEADS } from "../data";
import eventBus from "../lib/eventBus";
import logger from "../lib/logger";

class LeadRepository implements TenantScoped<CRMLead> {
  private store: Record<string, CRMLead[]>;

  constructor() {
    this.store = JSON.parse(JSON.stringify(INITIAL_LEADS));
  }

  findById(id: string): CRMLead | undefined {
    return Object.values(this.store).flat().find((l) => l.id === id);
  }

  findAll(filters?: Partial<CRMLead>): CRMLead[] {
    const all = Object.values(this.store).flat();
    if (!filters) return all;
    return all.filter((l) =>
      Object.entries(filters).every(([k, v]) => (l as unknown as Record<string, unknown>)[k] === v)
    );
  }

  findByTenantId(tenantId: string): CRMLead[] {
    return this.store[tenantId] ?? [];
  }

  create(data: Omit<CRMLead, "id"> & { tenantId: string }): CRMLead {
    const { tenantId, ...leadData } = data as Omit<CRMLead, "id"> & { tenantId: string };
    const lead: CRMLead = { ...leadData, id: generateId("lead") };

    if (!this.store[tenantId]) this.store[tenantId] = [];
    this.store[tenantId].unshift(lead);

    logger.info(`[LeadRepository] Lead created: ${lead.name}`, { tenantId, module: "CRM" });
    eventBus.emit("lead.created", { leadId: lead.id, tenantId, name: lead.name });

    return lead;
  }

  update(id: string, data: Partial<CRMLead>): CRMLead | undefined {
    for (const tenantId of Object.keys(this.store)) {
      const idx = this.store[tenantId].findIndex((l) => l.id === id);
      if (idx !== -1) {
        const prev = this.store[tenantId][idx];
        this.store[tenantId][idx] = { ...prev, ...data };
        if (data.status && data.status !== prev.status) {
          eventBus.emit("lead.updated", { leadId: id, tenantId, status: data.status });
          if (data.status === "fechado") {
            eventBus.emit("lead.converted", { leadId: id, tenantId, value: this.store[tenantId][idx].value });
          }
        }
        return this.store[tenantId][idx];
      }
    }
    return undefined;
  }

  delete(id: string): boolean {
    for (const tenantId of Object.keys(this.store)) {
      const idx = this.store[tenantId].findIndex((l) => l.id === id);
      if (idx !== -1) {
        this.store[tenantId].splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  deleteByTenantId(tenantId: string): number {
    const count = (this.store[tenantId] ?? []).length;
    this.store[tenantId] = [];
    return count;
  }

  count(filters?: Partial<CRMLead>): number {
    return this.findAll(filters).length;
  }

  setAll(tenantId: string, leads: CRMLead[]): void {
    this.store[tenantId] = leads;
  }

  getAll(): Record<string, CRMLead[]> {
    return this.store;
  }
}

export const leadRepository = new LeadRepository();
export default leadRepository;
