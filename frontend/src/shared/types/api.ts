export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, unknown> | Array<unknown>;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null | string[] | number[];
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: QueryParams;
  body?: unknown;
  timeout?: number;
  token?: string;
}
