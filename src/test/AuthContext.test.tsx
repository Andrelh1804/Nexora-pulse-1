import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import React from "react";

function TestComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "authenticated" : "unauthenticated"}</div>
      <div data-testid="user-name">{user?.name ?? ""}</div>
      <button
        data-testid="login-btn"
        onClick={() => login("test@test.com", "password")}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should start unauthenticated", async () => {
    render(<TestComponent />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe("unauthenticated");
    });
  });

  it("should authenticate on successful login", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: "u1", email: "test@test.com", name: "Test User", role: "admin", plan: "premium" },
        tenant: { id: "t1", slug: "test" },
        tokens: { accessToken: "fake-token", refreshToken: "fake-refresh", expiresIn: 900 },
      }),
    });

    render(<TestComponent />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe("authenticated");
      expect(screen.getByTestId("user-name").textContent).toBe("Test User");
    });
  });

  it("should return error on failed login", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "E-mail ou senha incorretos." }),
    });

    let loginResult: { success: boolean; error?: string } | null = null;

    function LoginCapture() {
      const { login } = useAuth();
      return (
        <button
          data-testid="login-capture"
          onClick={async () => { loginResult = await login("bad@test.com", "wrong"); }}
        >
          Login
        </button>
      );
    }

    render(<LoginCapture />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId("login-capture"));

    await waitFor(() => {
      expect(loginResult).not.toBeNull();
      expect(loginResult!.success).toBe(false);
      expect(loginResult!.error).toBe("E-mail ou senha incorretos.");
    });
  });

  it("should clear state on logout", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: "u1", email: "test@test.com", name: "Test User", role: "admin", plan: "premium" },
          tenant: { id: "t1", slug: "test" },
          tokens: { accessToken: "fake-token", refreshToken: "fake-refresh", expiresIn: 900 },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<TestComponent />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => expect(screen.getByTestId("auth-status").textContent).toBe("authenticated"));

    fireEvent.click(screen.getByTestId("logout-btn"));

    await waitFor(() => expect(screen.getByTestId("auth-status").textContent).toBe("unauthenticated"));
  });
});
