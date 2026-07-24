import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

/**
 * Axios instance for the Django REST Framework backend.
 *
 * Configure the base URL via the `VITE_API_BASE_URL` environment variable.
 * Defaults to the deployed Django backend on Render.
 */
export const API_BASE_URL: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "https://zeal-deptdesk.onrender.com/api";

const ACCESS_TOKEN_KEY = "deptdesk.access_token";
const REFRESH_TOKEN_KEY = "deptdesk.refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        return Promise.reject(error);
      }
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(error);
            original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` };
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
        const newAccess = (data as any).access as string;
        setTokens(newAccess);
        flushQueue(newAccess);
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newAccess}` };
        return apiClient(original);
      } catch (e) {
        flushQueue(null);
        clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

/** Paginated DRF response shape. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Helper: unwrap a DRF list endpoint that may be paginated or a raw array. */
export function unwrapList<T>(payload: Paginated<T> | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.results ?? [];
}
