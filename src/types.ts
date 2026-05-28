export interface TenantData {
  id: string;
  name: string;
  niche: string;
  followers: string;
  followersGrowth: string;
  leads: string;
  leadsGrowth: string;
  conversionRate: string;
  conversionGrowth: string;
  roi: string;
  roas: string;
  ctr: string;
  ctrGrowth: string;
  reach: string;
  reachGrowth: string;
  adSpend: string;
  adConversions: string;
  selectedPlan: string;
  avatar: string;
}

export interface MetricPoint {
  date: string;
  engajamento: number;
  conversões: number;
  cliques: number;
  leads: number;
  custo: number;
}

export interface SocialPost {
  id: string;
  title: string;
  platform: "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube" | "pinterest";
  scheduledTime: string;
  status: "scheduled" | "published" | "draft";
  caption: string;
  mediaUrl: string;
  hashtags: string[];
}

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "novo" | "contato" | "proposta" | "fechado";
  value: number;
  lastInteraction: string;
  notes: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: "meta" | "google" | "tiktok" | "linkedin" | "pinterest" | "x" | "taboola" | "outbrain" | "kwai" | "spotify" | "amazon" | "mercado" | "shopee" | "tiktok_shop" | "youtube" | "uol";
  budget: number;
  status: "active" | "paused" | "completed";
  spend: number;
  clicks: number;
  leads: number;
  roas: number;
}

export interface SaaSPlan {
  id: "basic" | "premium" | "enterprise";
  name: string;
  price: string;
  period: string;
  features: string[];
  description: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  tenant: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}
