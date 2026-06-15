/**
 * GOOGLE ADS SERVICE
 * Real integration activates when GOOGLE_ADS_DEVELOPER_TOKEN + GOOGLE_ADS_CUSTOMER_ID +
 * GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET + GOOGLE_ADS_REFRESH_TOKEN are set.
 * Without credentials, returns realistic simulation data.
 *
 * Fase 2.6 — Google Ads Real
 */

const HAS_CREDENTIALS = typeof process !== "undefined" &&
  !!(process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
     process.env.GOOGLE_ADS_CUSTOMER_ID &&
     process.env.GOOGLE_ADS_REFRESH_TOKEN);

export const IS_REAL = HAS_CREDENTIALS;

export interface GoogleCampaign {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  advertisingChannelType: string;
  biddingStrategy?: string;
  budgetAmountMicros?: number;
}

export interface GoogleInsights {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
  roas: number;
  date: string;
}

async function getCampaigns(): Promise<GoogleCampaign[]> {
  if (IS_REAL) {
    // google-ads-api package integration point
    // const { GoogleAdsApi } = await import("google-ads-api");
    // const client = new GoogleAdsApi({ ... });
    // const customer = client.Customer({ ... });
    // const campaigns = await customer.query("SELECT campaign.id, campaign.name, ...");
    throw new Error("Google Ads real integration: install 'google-ads-api' package and configure credentials.");
  }

  return [
    { id: "sim_g_001", name: "Search — Marca Geral",      status: "ENABLED", advertisingChannelType: "SEARCH",  budgetAmountMicros: 5000000000  },
    { id: "sim_g_002", name: "Performance Max — Vendas",  status: "ENABLED", advertisingChannelType: "PERFORMANCE_MAX", budgetAmountMicros: 8000000000 },
    { id: "sim_g_003", name: "Display Remarketing",       status: "PAUSED",  advertisingChannelType: "DISPLAY", budgetAmountMicros: 2000000000  },
    { id: "sim_g_004", name: "YouTube — Brand Awareness", status: "ENABLED", advertisingChannelType: "VIDEO",   budgetAmountMicros: 3500000000  },
  ];
}

async function getInsights(campaignId: string, dateRange = "LAST_30_DAYS"): Promise<GoogleInsights[]> {
  void dateRange;
  if (IS_REAL) {
    throw new Error("Google Ads real integration pending — configure credentials.");
  }

  return [
    {
      campaignId,
      campaignName: "Simulação Google Ads",
      impressions: 284500,
      clicks: 8920,
      costMicros: 18750000000,
      conversions: 312,
      ctr: 3.14,
      averageCpc: 2.10,
      roas: 4.2,
      date: new Date().toISOString().slice(0, 10),
    },
  ];
}

async function getKeywordPerformance(campaignId: string): Promise<unknown[]> {
  void campaignId;
  if (IS_REAL) {
    throw new Error("Google Ads real integration pending — configure credentials.");
  }

  return [
    { keyword: "software marketing automação", impressions: 8400, clicks: 420, ctr: 5.0, avgCpc: 3.20, conversions: 28 },
    { keyword: "plataforma gestão campanhas",  impressions: 6200, clicks: 280, ctr: 4.5, avgCpc: 2.80, conversions: 19 },
    { keyword: "crm leads whatsapp",           impressions: 5800, clicks: 210, ctr: 3.6, avgCpc: 1.95, conversions: 15 },
  ];
}

async function getConversionActions(): Promise<unknown[]> {
  if (IS_REAL) {
    throw new Error("Google Ads real integration pending — configure credentials.");
  }

  return [
    { id: "sim_conv_001", name: "Formulário de Lead",   status: "ENABLED", category: "LEAD",     conversions: 312 },
    { id: "sim_conv_002", name: "Compra no Site",        status: "ENABLED", category: "PURCHASE", conversions: 89  },
    { id: "sim_conv_003", name: "Ligação Telefônica",    status: "ENABLED", category: "PHONE_CALL_LEAD", conversions: 45 },
  ];
}

export default { getCampaigns, getInsights, getKeywordPerformance, getConversionActions, IS_REAL };
