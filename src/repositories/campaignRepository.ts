import { AdCampaign } from "../types";
import { TenantScoped, generateId } from "./index";
import { INITIAL_CAMPAIGNS } from "../data";
import eventBus from "../lib/eventBus";
import logger from "../lib/logger";

class CampaignRepository implements TenantScoped<AdCampaign> {
  private store: Record<string, AdCampaign[]>;

  constructor() {
    this.store = JSON.parse(JSON.stringify(INITIAL_CAMPAIGNS));
  }

  findById(id: string): AdCampaign | undefined {
    return Object.values(this.store).flat().find((c) => c.id === id);
  }

  findAll(filters?: Partial<AdCampaign>): AdCampaign[] {
    const all = Object.values(this.store).flat();
    if (!filters) return all;
    return all.filter((c) =>
      Object.entries(filters).every(([k, v]) => (c as unknown as Record<string, unknown>)[k] === v)
    );
  }

  findByTenantId(tenantId: string): AdCampaign[] {
    return this.store[tenantId] ?? [];
  }

  create(data: Omit<AdCampaign, "id"> & { tenantId: string }): AdCampaign {
    const { tenantId, ...campaignData } = data as Omit<AdCampaign, "id"> & { tenantId: string };
    const campaign: AdCampaign = { ...campaignData, id: generateId("cmp") };

    if (!this.store[tenantId]) this.store[tenantId] = [];
    this.store[tenantId].unshift(campaign);

    logger.info(`[CampaignRepository] Campaign created: ${campaign.name}`, { tenantId, module: "Traffic" });
    eventBus.emit("campaign.created", {
      campaignId: campaign.id,
      tenantId,
      platform: campaign.platform,
      budget: campaign.budget,
    });

    return campaign;
  }

  update(id: string, data: Partial<AdCampaign>): AdCampaign | undefined {
    for (const tenantId of Object.keys(this.store)) {
      const idx = this.store[tenantId].findIndex((c) => c.id === id);
      if (idx !== -1) {
        this.store[tenantId][idx] = { ...this.store[tenantId][idx], ...data };
        eventBus.emit("campaign.updated", { campaignId: id, tenantId, changes: data as Record<string, unknown> });
        return this.store[tenantId][idx];
      }
    }
    return undefined;
  }

  delete(id: string): boolean {
    for (const tenantId of Object.keys(this.store)) {
      const idx = this.store[tenantId].findIndex((c) => c.id === id);
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

  count(filters?: Partial<AdCampaign>): number {
    return this.findAll(filters).length;
  }

  setAll(tenantId: string, campaigns: AdCampaign[]): void {
    this.store[tenantId] = campaigns;
  }

  getAll(): Record<string, AdCampaign[]> {
    return this.store;
  }
}

export const campaignRepository = new CampaignRepository();
export default campaignRepository;
