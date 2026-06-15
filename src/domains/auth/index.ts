import eventBus from "../../lib/eventBus";
import auditLogger from "../../lib/auditLogger";
import logger from "../../lib/logger";

export type AuthStatus = "authenticated" | "unauthenticated" | "pending";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: "admin" | "gestor" | "client" | "analyst";
  plan: "basic" | "premium" | "enterprise";
  avatarUrl?: string;
  lastLogin?: Date;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  document: string;
  plan: "basic" | "premium" | "enterprise";
}

export type AuthError =
  | "invalid_credentials"
  | "user_not_found"
  | "email_already_exists"
  | "weak_password"
  | "session_expired"
  | "insufficient_permissions"
  | "account_suspended";

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

class AuthDomain {
  private currentSession: AuthSession | null = null;
  private sessionListeners: ((session: AuthSession | null) => void)[] = [];

  async login(credentials: LoginCredentials): Promise<AuthResult<AuthSession>> {
    logger.info("[Auth] Login attempt", { module: "Auth", data: { email: credentials.email } });

    await new Promise((r) => setTimeout(r, 300));

    const mockUser: AuthUser = {
      id: "user_demo_001",
      email: credentials.email,
      name: "Admin Master",
      tenantId: credentials.tenantId ?? "glow",
      role: "admin",
      plan: "enterprise",
      lastLogin: new Date(),
    };

    const session: AuthSession = {
      user: mockUser,
      token: `jwt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      refreshToken: `refresh_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    this.currentSession = session;
    this.notifyListeners();

    auditLogger.log({
      action: "user.login",
      tenantId: mockUser.tenantId,
      userId: mockUser.id,
      userEmail: mockUser.email,
      resource: "auth",
      status: "success",
    });

    eventBus.emit("user.login", {
      userId: mockUser.id,
      email: mockUser.email,
      tenantId: mockUser.tenantId,
    });

    return { success: true, data: session };
  }

  async logout(): Promise<void> {
    if (this.currentSession) {
      auditLogger.log({
        action: "user.logout",
        tenantId: this.currentSession.user.tenantId,
        userId: this.currentSession.user.id,
        resource: "auth",
        status: "success",
      });
      eventBus.emit("user.logout", {
        userId: this.currentSession.user.id,
        tenantId: this.currentSession.user.tenantId,
      });
    }
    this.currentSession = null;
    this.notifyListeners();
  }

  async register(data: RegisterData): Promise<AuthResult<AuthSession>> {
    logger.info("[Auth] Registration attempt", { module: "Auth", data: { email: data.email } });
    await new Promise((r) => setTimeout(r, 500));

    const userId = `user_${Date.now()}`;
    const tenantId = `tenant_${Date.now()}`;

    auditLogger.log({
      action: "user.created",
      tenantId,
      userId,
      userEmail: data.email,
      resource: "user",
      resourceId: userId,
      details: { plan: data.plan, company: data.companyName },
      status: "success",
    });

    eventBus.emit("user.created", { userId, email: data.email, tenantId, role: "admin" });
    eventBus.emit("tenant.created", { tenantId, name: data.companyName, plan: data.plan });

    const mockUser: AuthUser = {
      id: userId,
      email: data.email,
      name: data.name,
      tenantId,
      role: "admin",
      plan: data.plan,
    };

    const session: AuthSession = {
      user: mockUser,
      token: `jwt_${Date.now()}`,
      refreshToken: `refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    this.currentSession = session;
    this.notifyListeners();
    return { success: true, data: session };
  }

  getSession(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && this.currentSession.expiresAt > new Date();
  }

  subscribe(handler: (session: AuthSession | null) => void): () => void {
    this.sessionListeners.push(handler);
    return () => { this.sessionListeners = this.sessionListeners.filter((h) => h !== handler); };
  }

  private notifyListeners(): void {
    this.sessionListeners.forEach((h) => h(this.currentSession));
  }
}

export const authDomain = new AuthDomain();
export default authDomain;
