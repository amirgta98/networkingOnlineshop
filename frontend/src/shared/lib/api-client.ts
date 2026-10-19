import { ApiErrorResponse, QueryParams, RequestOptions } from "../types/api";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly details?: Record<string, unknown> | Array<unknown>;

  constructor(payload: ApiErrorResponse) {
    super(payload.message || "An unexpected API error occurred");
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.error = payload.error;
    this.details = payload.details;
  }
}

type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export class ApiClient {
  private readonly configuredBaseUrl?: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl?: string) {
    this.configuredBaseUrl = baseUrl ? baseUrl.replace(/\/$/, "") : undefined;
  }

  public getBaseUrl(): string {
    if (this.configuredBaseUrl) {
      return this.configuredBaseUrl;
    }

    // Server-side (Node.js / SSR inside Docker container or production VPS)
    if (typeof window === "undefined") {
      const internalUrl = process.env.BACKEND_INTERNAL_URL || process.env.INTERNAL_API_URL;
      if (internalUrl) {
        const cleanInternal = internalUrl.replace(/\/$/, "");
        return cleanInternal.endsWith("/api/v1") ? cleanInternal : `${cleanInternal}/api/v1`;
      }
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;
      if (publicUrl && !publicUrl.startsWith("/")) {
        return publicUrl.replace(/\/$/, "");
      }
      return "http://127.0.0.1:3001/api/v1";
    }

    // Client-side (in browser)
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]";

    if (envUrl) {
      const pointsToLocal = envUrl.includes("localhost") || envUrl.includes("127.0.0.1");
      // If deployed to a remote server/IP, but the build had localhost, redirect to relative /api/v1
      // so requests are proxied by Caddy/Nginx on the server rather than failing on visitor's device
      if (!isLocalhost && pointsToLocal) {
        return "/api/v1";
      }
      return envUrl.replace(/\/$/, "");
    }

    return isLocalhost ? "http://localhost:3001/api/v1" : "/api/v1";
  }

  public useRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public useResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private buildUrl(endpoint: string, params?: QueryParams): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const baseUrl = this.getBaseUrl();
    const url = new URL(`${baseUrl}${cleanEndpoint}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, timeout = 15000, headers: customHeaders, ...restOptions } = options;

    const url = this.buildUrl(endpoint, params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const defaultHeaders: Record<string, string> = {
      Accept: "application/json",
    };
    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("velox_auth_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          const token = parsed?.accessToken || parsed?.token;
          if (token && !defaultHeaders["Authorization"]) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
          }
        }
      } catch {
        // ignore
      }
    }

    let init: RequestInit = {
      ...restOptions,
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      signal: controller.signal,
    };

    if (body !== undefined) {
      init.body = isFormData ? (body as BodyInit) : typeof body === "string" ? body : JSON.stringify(body);
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      init = await interceptor(init);
    }

    try {
      let response = await fetch(url, init);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            statusCode: response.status,
            error: response.statusText || "HttpError",
            message: `Request failed with status ${response.status}`,
          };
        }
        throw new ApiError(errorData);
      }

      // 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      const rawText = await response.text();
      if (!rawText || !rawText.trim()) {
        return null as unknown as T;
      }

      try {
        return JSON.parse(rawText) as T;
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr, rawText);
        return null as unknown as T;
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError({
          statusCode: 408,
          error: "TimeoutError",
          message: `Request timed out after ${timeout}ms`,
        });
      }

      throw new ApiError({
        statusCode: 500,
        error: "NetworkError",
        message: err instanceof Error ? err.message : "Failed to execute network request",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

/**
 * Singleton instance of ApiClient configured for Fastify backend communication.
 */
export const apiClient = new ApiClient();
