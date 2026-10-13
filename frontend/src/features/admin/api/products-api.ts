import { apiClient } from "@/shared/lib/api-client";
import type { AdminProduct } from "../types/admin-products.types";

export interface GetProductsParams {
  search?: string;
  category?: string;
  status?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface GetProductsResponse {
  products: AdminProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadImageResult {
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}

export interface UploadIconResult {
  url: string;
  filename: string;
}

export function sanitizeProductPayload(payload: Partial<AdminProduct>): Partial<AdminProduct> {
  const allowedKeys = new Set([
    "name",
    "slug",
    "sku",
    "category",
    "brand",
    "price",
    "originalPrice",
    "costPrice",
    "stock",
    "minStockAlert",
    "reservedStock",
    "warehouseLocation",
    "status",
    "featured",
    "isSpecialOffer",
    "rating",
    "reviewCount",
    "discountPercent",
    "images",
    "warranty",
    "badges",
    "specs",
    "features",
    "relatedProductIds",
    "relatedProducts",
    "shortDescription",
    "fullDescription",
  ]);

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (allowedKeys.has(key) && value !== undefined) {
      sanitized[key] = value;
    }
  }

  if (Array.isArray(sanitized.features)) {
    sanitized.features = sanitized.features
      .filter((f: any) => f && (f.title?.trim() || f.description?.trim()))
      .map((f: any, idx: number) => ({
        ...(f.id ? { id: f.id } : {}),
        title: f.title?.trim() || "",
        description: f.description?.trim() || "",
        ...(f.iconUrl ? { iconUrl: f.iconUrl } : {}),
        iconName: f.iconName || "network",
        sortOrder: typeof f.sortOrder === "number" ? f.sortOrder : idx,
      }));
  }

  if (Array.isArray(sanitized.relatedProductIds)) {
    sanitized.relatedProductIds = sanitized.relatedProductIds
      .filter((id: any) => Boolean(id) && typeof id === "string" && id.trim())
      .map((id: string) => id.trim());
  }

  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images
      .filter(Boolean)
      .map((img: string) => {
        if (!img) return "";
        if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("blob:") || img.startsWith("data:")) {
          return img;
        }
        if (img.startsWith("/")) {
          return img;
        }
        if (img.startsWith("uploads/")) {
          return `/${img}`;
        }
        return `/uploads/products/${img}`;
      })
      .filter(Boolean);
  }

  return sanitized as Partial<AdminProduct>;
}

export const productsApi = {
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    return apiClient.get<GetProductsResponse>("/products", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getProductById(id: string): Promise<AdminProduct> {
    return apiClient.get<AdminProduct>(`/products/${id}`);
  },

  async createProduct(payload: Partial<AdminProduct>): Promise<AdminProduct> {
    const cleanPayload = sanitizeProductPayload(payload);
    return apiClient.post<AdminProduct>("/products", cleanPayload);
  },

  async updateProduct(id: string, payload: Partial<AdminProduct>): Promise<AdminProduct> {
    const cleanPayload = sanitizeProductPayload(payload);
    return apiClient.put<AdminProduct>(`/products/${id}`, cleanPayload);
  },

  async deleteProduct(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(`/products/${id}`);
  },

  async updateStock(
    id: string,
    payload: { stock: number; price?: number; note?: string }
  ): Promise<AdminProduct> {
    return apiClient.patch<AdminProduct>(`/products/${id}/stock`, payload);
  },

  async uploadImages(files: File[]): Promise<{ images: UploadImageResult[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return apiClient.post<{ images: UploadImageResult[] }>(
      "/products/upload-images",
      formData
    );
  },

  async uploadFeatureIcon(file: File): Promise<UploadIconResult> {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<UploadIconResult>("/products/upload-icon", formData);
  },

  async deleteImage(filename: string): Promise<{ success: boolean }> {
    const cleanFilename = filename.split("/").pop() || filename;
    return apiClient.delete<{ success: boolean }>(`/products/images/${cleanFilename}`);
  },

  async deleteFeatureIcon(filename: string): Promise<{ success: boolean }> {
    const cleanFilename = filename.split("/").pop() || filename;
    return apiClient.delete<{ success: boolean }>(`/products/icons/${cleanFilename}`);
  },

  async updateProductImages(id: string, images: string[]): Promise<AdminProduct> {
    return apiClient.patch<AdminProduct>(`/products/${id}/images`, { images });
  },
};
