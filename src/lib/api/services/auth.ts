import { apiClient, setTokens, clearTokens, getRefreshToken } from "../client";
import type { LoginResponse } from "../types";

/**
 * Authenticate against Django REST Framework using SimpleJWT.
 * Backend endpoints:
 *   POST /auth/login/             { username | email, password } -> { access, refresh, user }
 *   POST /auth/token/refresh/     { refresh }                    -> { access }
 *   POST /auth/logout/            { refresh }                    -> 205
 *   GET  /auth/me/                                               -> current user
 */
export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    // Send both fields so the backend accepts either username or email.
    const payload: Record<string, string> = { password };
    if (identifier.includes("@")) {
      payload.email = identifier;
      payload.username = identifier;
    } else {
      payload.username = identifier;
    }
    const { data } = await apiClient.post<LoginResponse>("/auth/login/", payload);
    setTokens(data.access, data.refresh);
    return data;
  },

  async me() {
    const { data } = await apiClient.get("/auth/me/");
    return data;
  },

  async logout() {
    const refresh = getRefreshToken();
    try {
      await apiClient.post("/auth/logout/", refresh ? { refresh } : {});
    } catch {
      /* ignore — still clear local tokens */
    } finally {
      clearTokens();
    }
  },

  async changePassword(old_password: string, new_password: string) {
    const { data } = await apiClient.post("/auth/change-password/", {
      old_password,
      new_password,
    });
    return data;
  },
};
