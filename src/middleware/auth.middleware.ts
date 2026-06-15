import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractBearerToken, hasRole, hasPlan, JWTRole, JWTPlan, JWTPayload } from "../lib/auth";
import auditLogger from "../lib/auditLogger";
import logger from "../lib/logger";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: "Token de autenticação não fornecido.", code: "UNAUTHORIZED" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.headers["x-tenant-id"] = payload.tenantId;
    next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Token inválido";
    if (msg.includes("expired")) {
      res.status(401).json({ error: "Sessão expirada. Faça login novamente.", code: "TOKEN_EXPIRED" });
      return;
    }
    logger.warn(`[Auth] Invalid token: ${msg}`, { module: "Auth" });
    res.status(401).json({ error: "Token inválido.", code: "INVALID_TOKEN" });
  }
}

export function requireRole(minRole: JWTRole) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado.", code: "UNAUTHORIZED" });
      return;
    }
    if (!hasRole(req.user.role, minRole)) {
      auditLogger.log({
        action: "user.updated",
        tenantId: req.user.tenantId,
        userId: req.user.sub,
        resource: req.path,
        details: { requiredRole: minRole, userRole: req.user.role },
        status: "failure",
      });
      res.status(403).json({
        error: `Permissão insuficiente. Requer perfil "${minRole}" ou superior.`,
        code: "FORBIDDEN",
        required: minRole,
        current: req.user.role,
      });
      return;
    }
    next();
  };
}

export function requirePlan(minPlan: JWTPlan) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado.", code: "UNAUTHORIZED" });
      return;
    }
    if (!hasPlan(req.user.plan, minPlan)) {
      res.status(403).json({
        error: `Este recurso requer o plano "${minPlan}" ou superior.`,
        code: "PLAN_REQUIRED",
        required: minPlan,
        current: req.user.plan,
        upgradeUrl: "/app/billing",
      });
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // silently ignore invalid token for optional auth
    }
  }
  next();
}
