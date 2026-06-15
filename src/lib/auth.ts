import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET ?? "nexora-pulse-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "nexora-refresh-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

export type JWTRole = "super_admin" | "admin" | "gestor" | "analyst" | "client";
export type JWTPlan = "basic" | "premium" | "enterprise";

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  tenantId: string;
  tenantSlug: string;
  role: JWTRole;
  plan: JWTPlan;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function signAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(userId: string, tenantId: string): string {
  return jwt.sign({ sub: userId, tenantId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): { sub: string; tenantId: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string; tenantId: string };
}

export function createTokenPair(payload: Omit<JWTPayload, "iat" | "exp">): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload.sub, payload.tenantId),
    expiresIn: 15 * 60,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export function generateSecureToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const ROLE_HIERARCHY: Record<JWTRole, number> = {
  super_admin: 5,
  admin: 4,
  gestor: 3,
  analyst: 2,
  client: 1,
};

export function hasRole(userRole: JWTRole, requiredRole: JWTRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasPlan(userPlan: JWTPlan, requiredPlan: JWTPlan): boolean {
  const planOrder: Record<JWTPlan, number> = { basic: 1, premium: 2, enterprise: 3 };
  return planOrder[userPlan] >= planOrder[requiredPlan];
}
