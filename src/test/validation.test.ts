import { describe, it, expect } from "vitest";
import {
  loginSchema, registerSchema, createLeadSchema, createCampaignSchema, formatZodError
} from "../lib/validation";
import { ZodError } from "zod";

describe("Zod Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct credentials", () => {
      const result = loginSchema.parse({ email: "user@test.com", password: "senha123" });
      expect(result.email).toBe("user@test.com");
    });

    it("should reject invalid email", () => {
      expect(() => loginSchema.parse({ email: "invalid", password: "senha123" })).toThrow(ZodError);
    });

    it("should reject empty password", () => {
      expect(() => loginSchema.parse({ email: "user@test.com", password: "" })).toThrow(ZodError);
    });

    it("should lowercase email", () => {
      const result = loginSchema.parse({ email: "USER@TEST.COM", password: "pass" });
      expect(result.email).toBe("user@test.com");
    });
  });

  describe("registerSchema", () => {
    const valid = {
      name: "João Silva",
      email: "joao@empresa.com",
      password: "Senha@12345",
      companyName: "Empresa Teste",
      plan: "premium" as const,
    };

    it("should validate correct registration", () => {
      const result = registerSchema.parse(valid);
      expect(result.name).toBe("João Silva");
      expect(result.plan).toBe("premium");
    });

    it("should reject weak password (no uppercase)", () => {
      expect(() => registerSchema.parse({ ...valid, password: "senha12345" })).toThrow(ZodError);
    });

    it("should reject weak password (no number)", () => {
      expect(() => registerSchema.parse({ ...valid, password: "SenhaForte" })).toThrow(ZodError);
    });

    it("should reject short name", () => {
      expect(() => registerSchema.parse({ ...valid, name: "A" })).toThrow(ZodError);
    });

    it("should default plan to basic if not provided", () => {
      const { plan: _, ...noplan } = valid;
      const result = registerSchema.parse(noplan);
      expect(result.plan).toBe("basic");
    });
  });

  describe("createLeadSchema", () => {
    it("should validate a basic lead", () => {
      const result = createLeadSchema.parse({ name: "Maria Santos" });
      expect(result.name).toBe("Maria Santos");
      expect(result.status).toBe("novo");
      expect(result.value).toBe(0);
      expect(result.tags).toEqual([]);
    });

    it("should reject empty name", () => {
      expect(() => createLeadSchema.parse({ name: "" })).toThrow(ZodError);
    });

    it("should reject invalid email", () => {
      expect(() => createLeadSchema.parse({ name: "Lead", email: "bad-email" })).toThrow(ZodError);
    });
  });

  describe("createCampaignSchema", () => {
    it("should validate a meta campaign", () => {
      const result = createCampaignSchema.parse({ name: "Black Friday", platform: "meta" });
      expect(result.platform).toBe("meta");
    });

    it("should reject invalid platform", () => {
      expect(() => createCampaignSchema.parse({ name: "Test", platform: "twitter" })).toThrow(ZodError);
    });

    it("should reject negative budget", () => {
      expect(() => createCampaignSchema.parse({ name: "Test", platform: "meta", budget: -100 })).toThrow(ZodError);
    });
  });

  describe("formatZodError", () => {
    it("should format errors into a field map", () => {
      let error!: ZodError;
      try {
        loginSchema.parse({ email: "bad", password: "" });
      } catch (e) {
        error = e as ZodError;
      }
      expect(error).toBeDefined();
      const formatted = formatZodError(error);
      expect(typeof formatted).toBe("object");
      const keys = Object.keys(formatted);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach((k) => {
        expect(Array.isArray(formatted[k])).toBe(true);
        expect(formatted[k].length).toBeGreaterThan(0);
      });
    });
  });
});
