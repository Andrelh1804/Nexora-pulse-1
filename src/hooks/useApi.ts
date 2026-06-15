import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export function useApi() {
  const { tokens } = useAuth();

  const authHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (tokens?.accessToken) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
    return headers;
  }, [tokens]);

  const get = useCallback(async <T>(path: string): Promise<ApiResponse<T>> => {
    try {
      const res = await fetch(`/api/v1${path}`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error ?? "Erro ao carregar dados.", status: res.status };
      return { data: json as T, error: null, status: res.status };
    } catch {
      return { data: null, error: "Erro de conexão.", status: 0 };
    }
  }, [authHeaders]);

  const post = useCallback(async <T>(path: string, body: unknown): Promise<ApiResponse<T>> => {
    try {
      const res = await fetch(`/api/v1${path}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error ?? "Erro na requisição.", status: res.status };
      return { data: json as T, error: null, status: res.status };
    } catch {
      return { data: null, error: "Erro de conexão.", status: 0 };
    }
  }, [authHeaders]);

  const patch = useCallback(async <T>(path: string, body: unknown): Promise<ApiResponse<T>> => {
    try {
      const res = await fetch(`/api/v1${path}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error ?? "Erro na requisição.", status: res.status };
      return { data: json as T, error: null, status: res.status };
    } catch {
      return { data: null, error: "Erro de conexão.", status: 0 };
    }
  }, [authHeaders]);

  const del = useCallback(async <T>(path: string): Promise<ApiResponse<T>> => {
    try {
      const res = await fetch(`/api/v1${path}`, { method: "DELETE", headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error ?? "Erro na requisição.", status: res.status };
      return { data: json as T, error: null, status: res.status };
    } catch {
      return { data: null, error: "Erro de conexão.", status: 0 };
    }
  }, [authHeaders]);

  return { get, post, patch, del };
}

export default useApi;
