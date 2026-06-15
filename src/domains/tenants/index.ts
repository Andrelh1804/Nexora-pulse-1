import { TENANTS } from "../../data";
import { TenantData } from "../../types";
import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";

export interface TenantConfig {
  tenantId: string;
  whitelabelEnabled: boolean;
  customDomain?: string;
  customLogoUrl?: string;
  primaryColor?: string;
  companyName?: string;
  timezone: string;
  language: string;
  maxUsers: number;
  maxCampaigns: number;
  integrations: {
    metaPixelId?: string;
    googleConversionId?: string;
    evolutionApiUrl?: string;
    evolutionApiKey?: string;
    stripeCustomerId?: string;
  };
  modules: {
    social: boolean;
    ads: boolean;
    crm: boolean;
    ai: boolean;
    sites: boolean;
    design: boolean;
    automation: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

class TenantsDomain {
  private tenants: TenantData[] = [...TENANTS];
  private configs: Map<string, TenantConfig> = new Map();

  private getDefaultConfig(tenantId: string): TenantConfig {
    return {
      tenantId,
      whitelabelEnabled: false,
      timezone: "America/Sao_Paulo",
      language: "pt-BR",
      maxUsers: 3,
      maxCampaigns: 30,
      integrations: {},
      modules: { social: true, ads: true, crm: true, ai: true, sites: true, design: true, automation: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  getTenant(id: string): TenantData | undefined {
    return this.tenants.find((t) => t.id === id);
  }

  getAllTenants(): TenantData[] {
    return [...this.tenants];
  }

  getConfig(tenantId: string): TenantConfig {
    return this.configs.get(tenantId) ?? this.getDefaultConfig(tenantId);
  }

  updateConfig(tenantId: string, updates: Partial<TenantConfig>, userId: string): TenantConfig {
    const existing = this.getConfig(tenantId);
    const updated: TenantConfig = { ...existing, ...updates, updatedAt: new Date() };
    this.configs.set(tenantId, updated);

    auditLogger.log({
      action: "tenant.updated",
      tenantId,
      userId,
      resource: "tenant.config",
      details: { changes: Object.keys(updates) },
      status: "success",
    });

    eventBus.emit("tenant.updated", { tenantId, changes: updates as Record<string, unknown> });
    logger.info(`[Tenants] Config updated for ${tenantId}`, { tenantId, module: "Tenants" });

    return updated;
  }

  enableWhiteLabel(tenantId: string, userId: string, config: { customDomain?: string; customLogoUrl?: string; primaryColor?: string; companyName?: string }): TenantConfig {
    return this.updateConfig(tenantId, { whitelabelEnabled: true, ...config }, userId);
  }

  updateIntegrations(tenantId: string, userId: string, integrations: Partial<TenantConfig["integrations"]>): void {
    const config = this.getConfig(tenantId);
    this.updateConfig(tenantId, { integrations: { ...config.integrations, ...integrations } }, userId);

    auditLogger.log({
      action: "integration.connected",
      tenantId,
      userId,
      resource: "tenant.integrations",
      details: { updated: Object.keys(integrations) },
      status: "success",
    });
  }

  getStats() {
    return {
      total: this.tenants.length,
      withWhiteLabel: [...this.configs.values()].filter((c) => c.whitelabelEnabled).length,
      withCustomDomain: [...this.configs.values()].filter((c) => c.customDomain).length,
    };
  }
}

export const tenantsDomain = new TenantsDomain();
export default tenantsDomain;
