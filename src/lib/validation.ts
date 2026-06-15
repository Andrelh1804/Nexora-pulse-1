import { z } from "zod";

// ──────────────────────────────────────────────
// COMMON
// ──────────────────────────────────────────────
export const uuidSchema = z.string().uuid("ID inválido");
export const emailSchema = z.string().email("E-mail inválido").toLowerCase();
export const phoneSchema = z.string().regex(/^\+?[0-9\s\-\(\)]{8,20}$/, "Telefone inválido");
export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número");

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha obrigatória"),
  tenantSlug: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(255),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
  companyName: z.string().min(2, "Nome da empresa obrigatório").max(255),
  document: z.string().optional(),
  plan: z.enum(["basic", "premium", "enterprise"]).default("basic"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token obrigatório"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

// ──────────────────────────────────────────────
// TENANTS
// ──────────────────────────────────────────────
export const updateTenantSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  niche: z.string().max(255).optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  custom_domain: z.string().max(255).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  timezone: z.string().max(60).optional(),
  language: z.string().max(10).optional(),
});

// ──────────────────────────────────────────────
// CAMPAIGNS
// ──────────────────────────────────────────────
export const createCampaignSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(255),
  platform: z.enum(["meta", "google", "tiktok", "linkedin", "youtube", "organic"]),
  budget: z.number().min(0).optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
  spend: z.number().min(0).optional(),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  leads: z.number().int().min(0).optional(),
  roas: z.number().min(0).optional(),
});

// ──────────────────────────────────────────────
// LEADS
// ──────────────────────────────────────────────
export const createLeadSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(255),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  status: z.enum(["novo", "contato", "proposta", "fechado", "perdido"]).default("novo"),
  value: z.number().min(0).default(0),
  source: z.string().max(60).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  campaign_id: uuidSchema.optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

// ──────────────────────────────────────────────
// SOCIAL POSTS
// ──────────────────────────────────────────────
export const createPostSchema = z.object({
  title: z.string().max(255).optional(),
  platform: z.enum(["instagram", "facebook", "tiktok", "linkedin", "youtube", "pinterest"]),
  caption: z.string().max(5000).optional(),
  media_url: z.string().url().optional(),
  hashtags: z.array(z.string().max(100)).default([]),
  scheduled_at: z.string().datetime().optional(),
});

// ──────────────────────────────────────────────
// AI AGENT
// ──────────────────────────────────────────────
export const aiAgentSchema = z.object({
  agentType: z.enum(["social_media", "copywriter", "analyst", "traffic_manager", "general"]),
  tenantName: z.string().min(1).max(255),
  tenantData: z.record(z.unknown()).optional(),
  userInput: z.string().max(4000).optional(),
});

// ──────────────────────────────────────────────
// USERS
// ──────────────────────────────────────────────
export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["admin", "gestor", "analyst", "client"]).default("client"),
  phone: phoneSchema.optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url().optional(),
});

// ──────────────────────────────────────────────
// QUERY PARAMS
// ──────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// ──────────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────────
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const issues = (error.issues ?? (error as unknown as { errors: z.ZodError["issues"] }).errors ?? []);
  return issues.reduce((acc, e) => {
    const key = e.path.length > 0 ? e.path.join(".") : "_";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e.message);
    return acc;
  }, {} as Record<string, string[]>);
}
