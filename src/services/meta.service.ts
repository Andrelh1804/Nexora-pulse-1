/**
 * META ADS API SERVICE
 * Real integration activates automatically when META_ACCESS_TOKEN + META_AD_ACCOUNT_ID are set.
 * Without credentials, returns realistic simulation data identical in structure to the real API.
 *
 * Fase 2.5 — Meta Ads Real
 * API Reference: https://developers.facebook.com/docs/marketing-api
 */

const META_ACCESS_TOKEN  = typeof process !== "undefined" ? process.env.META_ACCESS_TOKEN  : undefined;
const META_AD_ACCOUNT_ID = typeof process !== "undefined" ? process.env.META_AD_ACCOUNT_ID : undefined;
const META_PIXEL_ID      = typeof process !== "undefined" ? process.env.META_PIXEL_ID      : undefined;
const META_API_VERSION   = "v20.0";
const META_BASE_URL      = `https://graph.facebook.com/${META_API_VERSION}`;

export const IS_REAL = !!META_ACCESS_TOKEN && !!META_AD_ACCOUNT_ID;

export interface MetaCampaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED" | "DELETED";
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

export interface MetaInsights {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  cpc: number;
  ctr: number;
  cpm: number;
  actions: { action_type: string; value: string }[];
  date_start: string;
  date_stop: string;
}

async function apiRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${META_BASE_URL}/${endpoint}`);
  url.searchParams.set("access_token", META_ACCESS_TOKEN!);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta API error: ${JSON.stringify(err.error)}`);
  }
  return res.json() as Promise<T>;
}

async function getCampaigns(limit = 20): Promise<MetaCampaign[]> {
  if (IS_REAL) {
    const data = await apiRequest<{ data: MetaCampaign[] }>(
      `act_${META_AD_ACCOUNT_ID}/campaigns`,
      { fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time", limit: String(limit) }
    );
    return data.data;
  }

  return [
    { id: "sim_camp_001", name: "Black Friday 2025 — Meta", status: "ACTIVE",   objective: "CONVERSIONS", daily_budget: "15000" },
    { id: "sim_camp_002", name: "Remarketing Premium Q4",   status: "ACTIVE",   objective: "CONVERSIONS", daily_budget: "8000"  },
    { id: "sim_camp_003", name: "Brand Awareness Jul",      status: "PAUSED",   objective: "REACH",       daily_budget: "5000"  },
    { id: "sim_camp_004", name: "Lookalike Audience 3%",    status: "ACTIVE",   objective: "LEAD_GENERATION", daily_budget: "12000" },
  ];
}

async function getInsights(campaignId: string, datePreset = "last_30d"): Promise<MetaInsights[]> {
  if (IS_REAL) {
    const data = await apiRequest<{ data: MetaInsights[] }>(
      `${campaignId}/insights`,
      {
        fields: "campaign_id,campaign_name,impressions,clicks,spend,reach,cpc,ctr,cpm,actions",
        date_preset: datePreset,
        level: "campaign",
      }
    );
    return data.data;
  }

  return [
    {
      campaign_id: campaignId,
      campaign_name: "Simulação Meta Ads",
      impressions: 182400,
      clicks: 4380,
      spend: 2850.50,
      reach: 95300,
      cpc: 0.65,
      ctr: 2.4,
      cpm: 15.63,
      actions: [
        { action_type: "lead",     value: "348" },
        { action_type: "purchase", value: "89"  },
      ],
      date_start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
      date_stop:  new Date().toISOString().slice(0, 10),
    },
  ];
}

async function createCampaign(params: {
  name: string;
  objective: string;
  status: "ACTIVE" | "PAUSED";
  dailyBudget?: number;
}): Promise<{ id: string }> {
  if (IS_REAL) {
    const body = new URLSearchParams({
      name: params.name,
      objective: params.objective,
      status: params.status,
      access_token: META_ACCESS_TOKEN!,
    });
    if (params.dailyBudget) body.set("daily_budget", String(params.dailyBudget));

    const res = await fetch(`${META_BASE_URL}/act_${META_AD_ACCOUNT_ID}/campaigns`, {
      method: "POST",
      body,
    });
    if (!res.ok) throw new Error("Failed to create Meta campaign");
    return res.json();
  }
  return { id: `sim_${Date.now()}` };
}

async function getPixelEvents(pixelId?: string): Promise<unknown[]> {
  if (IS_REAL && (pixelId ?? META_PIXEL_ID)) {
    const data = await apiRequest<{ data: unknown[] }>(
      `${pixelId ?? META_PIXEL_ID}/stats`,
      { fields: "name,event_count,unique_event_count", time_range: '{"since":"2025-01-01","until":"2025-12-31"}' }
    );
    return data.data;
  }
  return [
    { name: "PageView",     event_count: 45820, unique_event_count: 38100 },
    { name: "AddToCart",    event_count: 8240,  unique_event_count: 6830  },
    { name: "Purchase",     event_count: 1240,  unique_event_count: 1190  },
    { name: "Lead",         event_count: 2890,  unique_event_count: 2720  },
  ];
}

export default { getCampaigns, getInsights, createCampaign, getPixelEvents, IS_REAL, META_API_VERSION };
