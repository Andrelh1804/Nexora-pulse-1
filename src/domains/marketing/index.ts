import { SocialPost, AdCampaign } from "../../types";
import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";

export type Platform = SocialPost["platform"] | AdCampaign["platform"];

export interface ContentCalendarEntry {
  id: string;
  tenantId: string;
  postId: string;
  scheduledAt: Date;
  platform: SocialPost["platform"];
  status: "scheduled" | "published" | "failed" | "draft";
  boosted: boolean;
  boostBudget?: number;
}

export interface PerformanceSummary {
  tenantId: string;
  period: "7d" | "30d" | "90d";
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpa: number;
  leadCount: number;
  topPlatform: Platform;
  generatedAt: Date;
}

export interface ContentSuggestion {
  id: string;
  tenantId: string;
  platform: SocialPost["platform"];
  hook: string;
  body: string;
  hashtags: string[];
  bestTimeToPost: string;
  estimatedReach: string;
  generatedByAI: boolean;
  createdAt: Date;
}

class MarketingDomain {
  private calendar: ContentCalendarEntry[] = [];
  private suggestions: ContentSuggestion[] = [];

  schedulePost(tenantId: string, userId: string, postId: string, scheduledAt: Date, platform: SocialPost["platform"]): ContentCalendarEntry {
    const entry: ContentCalendarEntry = {
      id: `cal_${Date.now()}`,
      tenantId,
      postId,
      scheduledAt,
      platform,
      status: "scheduled",
      boosted: false,
    };
    this.calendar.push(entry);

    auditLogger.log({
      action: "campaign.created",
      tenantId,
      userId,
      resource: "content.calendar",
      resourceId: entry.id,
      details: { platform, scheduledAt: scheduledAt.toISOString() },
      status: "success",
    });

    logger.info(`[Marketing] Post scheduled on ${platform} at ${scheduledAt.toISOString()}`, { tenantId, module: "Marketing" });
    return entry;
  }

  getCalendar(tenantId: string, from?: Date, to?: Date): ContentCalendarEntry[] {
    return this.calendar.filter((e) => {
      if (e.tenantId !== tenantId) return false;
      if (from && e.scheduledAt < from) return false;
      if (to && e.scheduledAt > to) return false;
      return true;
    });
  }

  generatePerformanceSummary(tenantId: string, period: "7d" | "30d" | "90d"): PerformanceSummary {
    const mock: PerformanceSummary = {
      tenantId,
      period,
      impressions: Math.floor(Math.random() * 100000) + 10000,
      clicks: Math.floor(Math.random() * 5000) + 500,
      conversions: Math.floor(Math.random() * 500) + 50,
      spend: Math.floor(Math.random() * 10000) + 2000,
      revenue: Math.floor(Math.random() * 40000) + 8000,
      roas: parseFloat((Math.random() * 4 + 2).toFixed(2)),
      ctr: parseFloat((Math.random() * 3 + 1).toFixed(2)),
      cpc: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      cpa: parseFloat((Math.random() * 20 + 10).toFixed(2)),
      leadCount: Math.floor(Math.random() * 300) + 50,
      topPlatform: "meta",
      generatedAt: new Date(),
    };
    return mock;
  }

  addContentSuggestion(tenantId: string, suggestion: Omit<ContentSuggestion, "id" | "createdAt">): ContentSuggestion {
    const entry: ContentSuggestion = { ...suggestion, id: `sug_${Date.now()}`, createdAt: new Date() };
    this.suggestions = [entry, ...this.suggestions].slice(0, 100);
    return entry;
  }

  getContentSuggestions(tenantId: string, platform?: SocialPost["platform"]): ContentSuggestion[] {
    return this.suggestions.filter((s) => s.tenantId === tenantId && (!platform || s.platform === platform));
  }

  getBestPostingTimes(platform: SocialPost["platform"]): string[] {
    const times: Record<string, string[]> = {
      instagram: ["08:00", "12:00", "18:00", "21:00"],
      tiktok: ["07:00", "11:00", "19:00", "22:00"],
      facebook: ["09:00", "13:00", "17:00"],
      linkedin: ["08:00", "12:00", "17:00"],
      youtube: ["15:00", "20:00"],
      pinterest: ["14:00", "20:00"],
    };
    return times[platform] ?? ["09:00", "18:00"];
  }
}

export const marketingDomain = new MarketingDomain();
export default marketingDomain;
