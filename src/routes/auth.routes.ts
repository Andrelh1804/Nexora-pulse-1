import { Router, Request, Response } from "express";
import { query, queryOne } from "../lib/db";
import {
  hashPassword, comparePassword, createTokenPair,
  signAccessToken, verifyRefreshToken, generateSecureToken,
} from "../lib/auth";
import { loginSchema, registerSchema, refreshTokenSchema, formatZodError } from "../lib/validation";
import { ZodError } from "zod";
import auditLogger from "../lib/auditLogger";
import logger from "../lib/logger";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import crypto from "crypto";

const router = Router();

// ──────────────────────────────────────────────
// POST /api/v1/auth/register
// ──────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    // Check email uniqueness
    const existing = await queryOne(
      "SELECT id FROM users WHERE email = $1",
      [body.email]
    );
    if (existing) {
      return res.status(409).json({ error: "E-mail já cadastrado.", code: "EMAIL_EXISTS" });
    }

    // Create tenant slug
    const slug = body.companyName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 50) + `-${Date.now().toString(36)}`;

    // Transaction: create tenant + user + subscription
    const trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    const tenant = await queryOne<{ id: string }>(
      `INSERT INTO tenants (slug, name, plan, status, trial_ends_at)
       VALUES ($1, $2, $3, 'trial', $4) RETURNING id`,
      [slug, body.companyName, body.plan, trialEndsAt]
    );

    if (!tenant) throw new Error("Failed to create tenant");

    const passwordHash = await hashPassword(body.password);
    const user = await queryOne<{ id: string; name: string; email: string }>(
      `INSERT INTO users (tenant_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, 'admin') RETURNING id, name, email`,
      [tenant.id, body.email, passwordHash, body.name]
    );

    if (!user) throw new Error("Failed to create user");

    await query(
      `INSERT INTO subscriptions (tenant_id, plan, status, amount_brl, trial_ends_at)
       VALUES ($1, $2, 'trial', $3, $4)`,
      [tenant.id, body.plan, body.plan === "basic" ? 197 : body.plan === "premium" ? 497 : 1997, trialEndsAt]
    );

    const tokens = createTokenPair({
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: tenant.id,
      tenantSlug: slug,
      role: "admin",
      plan: body.plan,
    });

    // Store refresh token hash
    const tokenHash = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex");
    await query(
      `INSERT INTO refresh_tokens (user_id, tenant_id, token_hash, ip_address, expires_at)
       VALUES ($1, $2, $3, $4::inet, NOW() + INTERVAL '30 days')`,
      [user.id, tenant.id, tokenHash, (req.ip ?? "0.0.0.0").replace("::ffff:", "")]
    );

    auditLogger.log({
      action: "user.created",
      tenantId: tenant.id,
      userId: user.id,
      userEmail: user.email,
      resource: "auth.register",
      details: { plan: body.plan, company: body.companyName },
      status: "success",
    });

    logger.info(`[Auth] New user registered: ${user.email} (${slug})`, { module: "Auth", tenantId: tenant.id });

    return res.status(201).json({
      message: "Conta criada com sucesso!",
      user: { id: user.id, email: user.email, name: user.name, role: "admin", plan: body.plan },
      tenant: { id: tenant.id, slug },
      tokens,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({ error: "Dados inválidos.", fields: formatZodError(err) });
    }
    logger.error(`[Auth] Register error: ${err instanceof Error ? err.message : err}`, { module: "Auth" });
    return res.status(500).json({ error: "Erro ao criar conta.", code: "REGISTER_ERROR" });
  }
});

// ──────────────────────────────────────────────
// POST /api/v1/auth/login
// ──────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await queryOne<{
      id: string; name: string; email: string; password_hash: string;
      is_active: boolean; role: string; tenant_id: string; plan: string; tenant_slug: string;
    }>(
      `SELECT u.id, u.name, u.email, u.password_hash, u.is_active, u.role,
              u.tenant_id, t.plan, t.slug AS tenant_slug
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.email = $1`,
      [body.email]
    );

    if (!user || !user.is_active) {
      auditLogger.log({
        action: "user.login",
        tenantId: user?.tenant_id ?? "unknown",
        userId: user?.id ?? "unknown",
        userEmail: body.email,
        resource: "auth.login",
        status: "failure",
        details: { reason: !user ? "user_not_found" : "inactive" },
      });
      return res.status(401).json({ error: "E-mail ou senha incorretos.", code: "INVALID_CREDENTIALS" });
    }

    const passwordValid = await comparePassword(body.password, user.password_hash);
    if (!passwordValid) {
      auditLogger.log({
        action: "user.login",
        tenantId: user.tenant_id,
        userId: user.id,
        userEmail: user.email,
        resource: "auth.login",
        status: "failure",
        details: { reason: "wrong_password" },
      });
      return res.status(401).json({ error: "E-mail ou senha incorretos.", code: "INVALID_CREDENTIALS" });
    }

    const tokens = createTokenPair({
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenant_id,
      tenantSlug: user.tenant_slug,
      role: user.role as never,
      plan: user.plan as never,
    });

    const tokenHash = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex");
    await query(
      `INSERT INTO refresh_tokens (user_id, tenant_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4::inet, $5, NOW() + INTERVAL '30 days')`,
      [user.id, user.tenant_id, tokenHash, (req.ip ?? "0.0.0.0").replace("::ffff:", ""), req.headers["user-agent"] ?? ""]
    );

    await query(
      "UPDATE users SET last_login_at = NOW() WHERE id = $1",
      [user.id]
    );

    auditLogger.log({
      action: "user.login",
      tenantId: user.tenant_id,
      userId: user.id,
      userEmail: user.email,
      resource: "auth.login",
      status: "success",
    });

    return res.json({
      message: "Login realizado com sucesso!",
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan },
      tokens,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({ error: "Dados inválidos.", fields: formatZodError(err) });
    }
    logger.error(`[Auth] Login error: ${err instanceof Error ? err.message : err}`, { module: "Auth" });
    return res.status(500).json({ error: "Erro ao fazer login.", code: "LOGIN_ERROR" });
  }
});

// ──────────────────────────────────────────────
// POST /api/v1/auth/refresh
// ──────────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const storedToken = await queryOne<{ id: string; revoked_at: string | null }>(
      "SELECT id, revoked_at FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()",
      [tokenHash]
    );

    if (!storedToken || storedToken.revoked_at) {
      return res.status(401).json({ error: "Refresh token inválido ou expirado.", code: "INVALID_REFRESH_TOKEN" });
    }

    const user = await queryOne<{ id: string; name: string; email: string; role: string; tenant_id: string; plan: string; tenant_slug: string }>(
      `SELECT u.id, u.name, u.email, u.role, u.tenant_id, t.plan, t.slug AS tenant_slug
       FROM users u JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1 AND u.is_active = TRUE`,
      [payload.sub]
    );

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado.", code: "USER_NOT_FOUND" });
    }

    const newTokens = createTokenPair({
      sub: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenant_id,
      tenantSlug: user.tenant_slug,
      role: user.role as never,
      plan: user.plan as never,
    });

    // Rotate refresh token
    await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [storedToken.id]);
    const newHash = crypto.createHash("sha256").update(newTokens.refreshToken).digest("hex");
    await query(
      `INSERT INTO refresh_tokens (user_id, tenant_id, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [user.id, user.tenant_id, newHash]
    );

    return res.json({ tokens: newTokens });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({ error: "Dados inválidos.", fields: formatZodError(err) });
    }
    return res.status(401).json({ error: "Refresh token inválido.", code: "INVALID_REFRESH_TOKEN" });
  }
});

// ──────────────────────────────────────────────
// POST /api/v1/auth/logout
// ──────────────────────────────────────────────
router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1", [tokenHash]);
    }

    auditLogger.log({
      action: "user.logout",
      tenantId: req.user!.tenantId,
      userId: req.user!.sub,
      resource: "auth.logout",
      status: "success",
    });

    return res.json({ message: "Logout realizado com sucesso." });
  } catch {
    return res.json({ message: "Logout realizado." });
  }
});

// ──────────────────────────────────────────────
// GET /api/v1/auth/me
// ──────────────────────────────────────────────
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await queryOne<{
    id: string; name: string; email: string; role: string; avatar_url: string | null;
    phone: string | null; is_verified: boolean; mfa_enabled: boolean; last_login_at: string | null;
    tenant_name: string; plan: string; tenant_slug: string; tenant_status: string;
  }>(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.phone,
            u.is_verified, u.mfa_enabled, u.last_login_at,
            t.name AS tenant_name, t.plan, t.slug AS tenant_slug, t.status AS tenant_status
     FROM users u JOIN tenants t ON t.id = u.tenant_id
     WHERE u.id = $1`,
    [req.user!.sub]
  );

  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  return res.json({ user });
});

export default router;
