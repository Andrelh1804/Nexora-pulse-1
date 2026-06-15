import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";

export type MarketplaceCategory =
  | "traffic_templates"
  | "whatsapp_flows"
  | "ai_prompts"
  | "landing_pages"
  | "ai_agents"
  | "automation_workflows"
  | "design_kits"
  | "report_templates";

export type MarketplaceItemStatus = "active" | "draft" | "deprecated" | "pending_review";

export interface MarketplaceItem {
  id: string;
  category: MarketplaceCategory;
  title: string;
  description: string;
  longDescription?: string;
  authorId: string;
  authorName: string;
  price: number;
  currency: "BRL";
  isFree: boolean;
  isPremiumOnly: boolean;
  status: MarketplaceItemStatus;
  tags: string[];
  thumbnail?: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  payload?: Record<string, unknown>;
}

export interface MarketplacePurchase {
  id: string;
  itemId: string;
  tenantId: string;
  userId: string;
  price: number;
  purchasedAt: Date;
  installedAt?: Date;
}

export interface MarketplaceReview {
  id: string;
  itemId: string;
  tenantId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const SEED_ITEMS: MarketplaceItem[] = [
  {
    id: "mkt_001", category: "traffic_templates", title: "Pack Meta Ads — E-commerce Premium",
    description: "8 templates de campanhas Meta Ads otimizados para e-commerce com públicos pré-configurados.",
    authorId: "nexora_official", authorName: "Nexora Pulse",
    price: 0, currency: "BRL", isFree: true, isPremiumOnly: false,
    status: "active", tags: ["meta", "ecommerce", "conversao"],
    downloads: 1240, rating: 4.8, reviewCount: 94,
    createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-05-01"), version: "2.1.0",
  },
  {
    id: "mkt_002", category: "whatsapp_flows", title: "Funil de Vendas WhatsApp — 7 Passos",
    description: "Fluxo completo de nutrição de leads no WhatsApp com 7 etapas de qualificação automática.",
    authorId: "nexora_official", authorName: "Nexora Pulse",
    price: 97, currency: "BRL", isFree: false, isPremiumOnly: false,
    status: "active", tags: ["whatsapp", "funil", "vendas", "evolution"],
    downloads: 856, rating: 4.9, reviewCount: 72,
    createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-05-10"), version: "1.4.0",
  },
  {
    id: "mkt_003", category: "ai_prompts", title: "Biblioteca de Prompts — Copywriter Pro",
    description: "50 prompts de copywriting de alta conversão para anúncios, e-mails e landing pages.",
    authorId: "nexora_official", authorName: "Nexora Pulse",
    price: 47, currency: "BRL", isFree: false, isPremiumOnly: false,
    status: "active", tags: ["ia", "copy", "prompts", "conversao"],
    downloads: 2103, rating: 4.7, reviewCount: 188,
    createdAt: new Date("2026-01-20"), updatedAt: new Date("2026-04-15"), version: "3.0.0",
  },
  {
    id: "mkt_004", category: "landing_pages", title: "Landing Page — SaaS B2B Ultra",
    description: "Template de landing page para SaaS B2B com seções de hero, features, pricing e CTA.",
    authorId: "nexora_official", authorName: "Nexora Pulse",
    price: 0, currency: "BRL", isFree: true, isPremiumOnly: false,
    status: "active", tags: ["landing", "saas", "b2b", "conversao"],
    downloads: 634, rating: 4.6, reviewCount: 41,
    createdAt: new Date("2026-03-10"), updatedAt: new Date("2026-05-20"), version: "1.0.0",
  },
  {
    id: "mkt_005", category: "automation_workflows", title: "Workflow — Lead Scoring Automático",
    description: "Fluxo de automação que pontua leads automaticamente baseado em comportamento e interações.",
    authorId: "nexora_official", authorName: "Nexora Pulse",
    price: 197, currency: "BRL", isFree: false, isPremiumOnly: true,
    status: "active", tags: ["automacao", "crm", "lead-scoring", "ia"],
    downloads: 312, rating: 5.0, reviewCount: 28,
    createdAt: new Date("2026-04-01"), updatedAt: new Date("2026-05-25"), version: "1.2.0",
  },
];

class MarketplaceDomain {
  private items: MarketplaceItem[] = [...SEED_ITEMS];
  private purchases: MarketplacePurchase[] = [];
  private reviews: MarketplaceReview[] = [];

  getItems(filters?: { category?: MarketplaceCategory; isFree?: boolean; isPremiumOnly?: boolean; search?: string }): MarketplaceItem[] {
    let result = this.items.filter((i) => i.status === "active");
    if (filters?.category) result = result.filter((i) => i.category === filters.category);
    if (filters?.isFree !== undefined) result = result.filter((i) => i.isFree === filters.isFree);
    if (filters?.isPremiumOnly !== undefined) result = result.filter((i) => i.isPremiumOnly === filters.isPremiumOnly);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some((t) => t.includes(q)));
    }
    return result;
  }

  getItem(id: string): MarketplaceItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  async purchase(itemId: string, tenantId: string, userId: string): Promise<MarketplacePurchase> {
    const item = this.getItem(itemId);
    if (!item) throw new Error("Item not found");

    const existing = this.purchases.find((p) => p.itemId === itemId && p.tenantId === tenantId);
    if (existing) throw new Error("Already purchased");

    const purchase: MarketplacePurchase = {
      id: `purchase_${Date.now()}`,
      itemId,
      tenantId,
      userId,
      price: item.price,
      purchasedAt: new Date(),
    };

    this.purchases.push(purchase);
    item.downloads++;

    auditLogger.log({
      action: "billing.charge",
      tenantId,
      userId,
      resource: "marketplace.item",
      resourceId: itemId,
      details: { itemTitle: item.title, price: item.price },
      status: "success",
    });

    logger.info(`[Marketplace] Purchase: ${item.title} by ${tenantId}`, { tenantId, module: "Marketplace" });
    return purchase;
  }

  hasPurchased(itemId: string, tenantId: string): boolean {
    const item = this.getItem(itemId);
    if (item?.isFree) return true;
    return this.purchases.some((p) => p.itemId === itemId && p.tenantId === tenantId);
  }

  getPurchases(tenantId: string): MarketplacePurchase[] {
    return this.purchases.filter((p) => p.tenantId === tenantId);
  }

  publishItem(item: Omit<MarketplaceItem, "id" | "createdAt" | "updatedAt" | "downloads" | "rating" | "reviewCount">): MarketplaceItem {
    const newItem: MarketplaceItem = {
      ...item,
      id: `mkt_${Date.now()}`,
      downloads: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(newItem);
    logger.info(`[Marketplace] New item published: ${newItem.title}`, { module: "Marketplace" });
    return newItem;
  }

  getStats() {
    return {
      totalItems: this.items.filter((i) => i.status === "active").length,
      freeItems: this.items.filter((i) => i.isFree && i.status === "active").length,
      totalDownloads: this.items.reduce((s, i) => s + i.downloads, 0),
      totalPurchases: this.purchases.length,
      byCategory: this.items.reduce((acc, i) => {
        if (i.status === "active") acc[i.category] = (acc[i.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const marketplaceDomain = new MarketplaceDomain();
export default marketplaceDomain;
