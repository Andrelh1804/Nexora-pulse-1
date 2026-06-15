import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashPassword, comparePassword, signAccessToken, verifyAccessToken, hasRole, hasPlan } from "../lib/auth";

describe("Auth Utilities", () => {
  describe("hashPassword / comparePassword", () => {
    it("should hash a password and compare correctly", async () => {
      const password = "Test@12345";
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2b$")).toBe(true);
      const valid = await comparePassword(password, hash);
      expect(valid).toBe(true);
    });

    it("should reject wrong password", async () => {
      const hash = await hashPassword("correct");
      const valid = await comparePassword("wrong", hash);
      expect(valid).toBe(false);
    });
  });

  describe("signAccessToken / verifyAccessToken", () => {
    const payload = {
      sub: "user-123",
      email: "test@nexora.com",
      name: "Test User",
      tenantId: "tenant-abc",
      tenantSlug: "test-tenant",
      role: "admin" as const,
      plan: "premium" as const,
    };

    it("should sign and verify a token", () => {
      const token = signAccessToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("should reject a tampered token", () => {
      const token = signAccessToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(() => verifyAccessToken(tampered)).toThrow();
    });
  });

  describe("hasRole", () => {
    it("super_admin should have all roles", () => {
      expect(hasRole("super_admin", "admin")).toBe(true);
      expect(hasRole("super_admin", "gestor")).toBe(true);
      expect(hasRole("super_admin", "client")).toBe(true);
    });

    it("client should not have higher roles", () => {
      expect(hasRole("client", "analyst")).toBe(false);
      expect(hasRole("client", "gestor")).toBe(false);
      expect(hasRole("client", "admin")).toBe(false);
    });

    it("gestor should have analyst and client access", () => {
      expect(hasRole("gestor", "analyst")).toBe(true);
      expect(hasRole("gestor", "client")).toBe(true);
      expect(hasRole("gestor", "admin")).toBe(false);
    });
  });

  describe("hasPlan", () => {
    it("enterprise covers all plans", () => {
      expect(hasPlan("enterprise", "basic")).toBe(true);
      expect(hasPlan("enterprise", "premium")).toBe(true);
      expect(hasPlan("enterprise", "enterprise")).toBe(true);
    });

    it("basic does not cover higher plans", () => {
      expect(hasPlan("basic", "premium")).toBe(false);
      expect(hasPlan("basic", "enterprise")).toBe(false);
    });
  });
});
