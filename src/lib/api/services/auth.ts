import { apiClient, setTokens, clearTokens } from "../client";
import type { LoginResponse } from "../types";

/**
 * Authenticate against Django REST Framework using SimpleJWT.
 * Expected backend endpoints:
 *   POST /auth/login/         { email, password } -> { access, refresh, user }
 *   POST /auth/token/refresh/ { refresh }         -> { access }
 *   POST /auth/logout/        { refresh }         -> 205
 *   GET  /auth/me/                                -> current user
 */
export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/auth/login/", { email, password });
    setTokens(data.access, data.refresh);
    return data;
  },

  async me() {
    const { data } = await apiClient.get("/auth/me/");
    return data;
  },

  async logout(refresh?: string) {
    try {
      await apiClient.post("/auth/logout/", refresh ? { refresh } : {});
    } catch {
      /* ignore — still clear local tokens */
    } finally {
      clearTokens();
    }
  },

  async changePassword(old_password: string, new_password: string) {
    const { data } = await apiClient.post("/auth/password/change/", {
      old_password,
      new_password,
    });
    return data;
  },

  async requestPasswordReset(email: string) {
    const { data } = await apiClient.post("/auth/password/reset/", { email });
    return data;
  },
};
