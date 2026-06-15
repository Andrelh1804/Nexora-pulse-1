import storageService, { StorageBucket } from "../../lib/storage";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";

export type ContentType = "landing_page" | "ad_creative" | "social_post" | "email_template" | "video_script";

export interface ContentAsset {
  id: string;
  tenantId: string;
  type: ContentType;
  title: string;
  status: "draft" | "review" | "approved" | "published" | "archived";
  platform?: string;
  fileId?: string;
  fileUrl?: string;
  thumbnail?: string;
  generatedByAI: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface SiteConfig {
  id: string;
  tenantId: string;
  title: string;
  subtitle: string;
  ctaText: string;
  template: "saas" | "lp" | "capture" | "ecommerce";
  accentColor: string;
  publishedUrl?: string;
  isPublished: boolean;
  formFields: string[];
  visitCount: number;
  conversionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignCreative {
  id: string;
  tenantId: string;
  title: string;
  format: "square" | "story" | "landscape";
  theme: "neon" | "cosmic" | "emerald" | "amber";
  platform?: string;
  status: "generating" | "ready" | "error";
  previewUrl?: string;
  downloadUrl?: string;
  syncedToAds: boolean;
  generatedAt?: Date;
  createdAt: Date;
}

class ContentDomain {
  private assets: ContentAsset[] = [];
  private sites: SiteConfig[] = [];
  private creatives: DesignCreative[] = [];

  async createAsset(tenantId: string, userId: string, data: Omit<ContentAsset, "id" | "createdAt" | "updatedAt">): Promise<ContentAsset> {
    const asset: ContentAsset = {
      ...data,
      id: `asset_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.assets.push(asset);

    auditLogger.log({
      action: "file.uploaded",
      tenantId,
      userId,
      resource: "content.asset",
      resourceId: asset.id,
      details: { type: asset.type, title: asset.title, generatedByAI: asset.generatedByAI },
      status: "success",
    });

    logger.info(`[Content] Asset created: ${asset.title} (${asset.type})`, { tenantId, module: "Content" });
    return asset;
  }

  async uploadFile(tenantId: string, userId: string, file: Blob, filename: string, bucket: StorageBucket) {
    const stored = await storageService.upload(file, {
      bucket,
      filename,
      mimeType: file.type || "application/octet-stream",
      tenantId,
      uploadedBy: userId,
      isPublic: true,
    });

    auditLogger.log({
      action: "file.uploaded",
      tenantId,
      userId,
      resource: `storage.${bucket}`,
      resourceId: stored.id,
      details: { filename, size: stored.size, bucket },
      status: "success",
    });

    return stored;
  }

  createSite(tenantId: string, userId: string, data: Omit<SiteConfig, "id" | "visitCount" | "conversionCount" | "createdAt" | "updatedAt">): SiteConfig {
    const site: SiteConfig = {
      ...data,
      id: `site_${Date.now()}`,
      visitCount: 0,
      conversionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sites.push(site);

    logger.info(`[Content] Site created: ${site.title}`, { tenantId, module: "Content" });
    return site;
  }

  publishSite(siteId: string, tenantId: string, userId: string): SiteConfig | undefined {
    const site = this.sites.find((s) => s.id === siteId && s.tenantId === tenantId);
    if (!site) return undefined;

    site.isPublished = true;
    site.publishedUrl = `https://sites.nexorapulse.io/${tenantId}/${siteId}`;
    site.updatedAt = new Date();

    auditLogger.log({
      action: "settings.updated",
      tenantId,
      userId,
      resource: "content.site",
      resourceId: siteId,
      details: { action: "publish", url: site.publishedUrl },
      status: "success",
    });

    return site;
  }

  async generateCreative(tenantId: string, userId: string, data: Omit<DesignCreative, "id" | "status" | "syncedToAds" | "createdAt">): Promise<DesignCreative> {
    const creative: DesignCreative = {
      ...data,
      id: `creative_${Date.now()}`,
      status: "generating",
      syncedToAds: false,
      createdAt: new Date(),
    };
    this.creatives.push(creative);

    await new Promise((r) => setTimeout(r, 1200));

    creative.status = "ready";
    creative.generatedAt = new Date();
    creative.previewUrl = `https://creatives.nexorapulse.io/${tenantId}/${creative.id}/preview.png`;

    logger.info(`[Content] Creative generated: ${creative.title}`, { tenantId, module: "Content" });
    return creative;
  }

  getAssets(tenantId: string, type?: ContentType): ContentAsset[] {
    return this.assets.filter((a) => a.tenantId === tenantId && (!type || a.type === type));
  }

  getSites(tenantId: string): SiteConfig[] {
    return this.sites.filter((s) => s.tenantId === tenantId);
  }

  getCreatives(tenantId: string): DesignCreative[] {
    return this.creatives.filter((c) => c.tenantId === tenantId);
  }

  getStats(tenantId: string) {
    return {
      totalAssets: this.assets.filter((a) => a.tenantId === tenantId).length,
      publishedSites: this.sites.filter((s) => s.tenantId === tenantId && s.isPublished).length,
      totalCreatives: this.creatives.filter((c) => c.tenantId === tenantId).length,
      aiGeneratedAssets: this.assets.filter((a) => a.tenantId === tenantId && a.generatedByAI).length,
      storageStats: storageService.getStats(tenantId),
    };
  }
}

export const contentDomain = new ContentDomain();
export default contentDomain;
