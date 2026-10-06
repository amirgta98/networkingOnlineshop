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
  private readonly baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");
  }

  public useRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public useResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private buildUrl(endpoint: string, params?: QueryParams): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

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

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let init: RequestInit = {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      signal: controller.signal,
    };

    if (body !== undefined) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
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
        return undefined as unknown as T;
      }

      return (await response.json()) as T;
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
