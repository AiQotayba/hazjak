import { createApi, type ApiOptions, type HttpMethod } from "./api-client";
import { useAuthStore } from "@/features/auth/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient = createApi({
  baseUrl: API_URL,
  credentials: "include",
  getLang: () => "ar",
  getToken: () => {
    if (typeof window === "undefined") return null;
    return useAuthStore.getState().token;
  },
  onUnauthorized: () => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    const publicAuthPaths = [
      "/login",
      "/register",
      "/register/owner",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
    ];
    if (publicAuthPaths.some((p) => path === p || path.startsWith(`${p}/`))) return;
    useAuthStore.getState().logout();
    window.location.href = "/login";
  },
  defaultTimeout: 20000,
});

export type FetchApiOptions = RequestInit & {
  token?: string;
};

export type FetchApiResult<T> = {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function toFetchResult<T>(response: Record<string, unknown>): FetchApiResult<T> {
  if (typeof response.success === "boolean") {
    return response as FetchApiResult<T>;
  }

  return {
    success: !response.isError,
    message: (response.message as string) ?? "",
    data: response.data as T | undefined,
    errors: response.errors as FetchApiResult<T>["errors"],
    meta: response.meta as FetchApiResult<T>["meta"],
  };
}

function parseRequestBody(options?: FetchApiOptions): unknown {
  if (!options?.body) return undefined;
  if (typeof options.body === "string") {
    try {
      return JSON.parse(options.body) as unknown;
    } catch {
      return options.body;
    }
  }
  return options.body;
}

async function request<T>(
  path: string,
  options?: FetchApiOptions
): Promise<FetchApiResult<T>> {
  const method = (options?.method ?? "GET").toUpperCase() as HttpMethod;
  const { token, body: _body, method: _method, headers, ...fetchRest } = options ?? {};

  const requestOptions: ApiOptions = {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    fetchOptions: fetchRest,
    showErrorToast: false,
  };

  const data = method === "GET" ? undefined : parseRequestBody(options);
  const response = await apiClient.request<T>(method, path, data, requestOptions);
  return toFetchResult<T>(response as unknown as Record<string, unknown>);
}

/** Hazjak fetch helper — `{ success, data, message }` responses */
export const api = request;

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options?: { token?: string }
): Promise<FetchApiResult<T>> {
  const response = await apiClient.request<T>("POST", path, formData, {
    headers: options?.token ? { Authorization: `Bearer ${options.token}` } : {},
    showErrorToast: false,
  });
  return toFetchResult<T>(response as unknown as Record<string, unknown>);
}
