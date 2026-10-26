import { apiClient } from "@/shared/lib/api-client";
import type {
  ProjectItem,
  PortfolioFormData,
  PortfolioQueryOptions,
  PaginatedPortfolioResponse,
  PortfolioCategory,
  ContentStatus,
} from "../types";

export const portfolioApi = {
  async getPortfolios(options: PortfolioQueryOptions = {}): Promise<PaginatedPortfolioResponse> {
    const params: Record<string, any> = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.search) params.search = options.search;
    if (options.category && options.category !== "all") params.category = options.category;
    if (options.tag) params.tag = options.tag;
    if (options.isFeatured !== undefined) params.isFeatured = options.isFeatured;
    if (options.status) params.status = options.status;

    return apiClient.get<PaginatedPortfolioResponse>("/portfolio", { params });
  },

  async getPortfolioBySlug(slugOrId: string): Promise<ProjectItem> {
    let clean = slugOrId;
    for (let i = 0; i < 3; i++) {
      try {
        const next = decodeURIComponent(clean);
        if (next === clean) break;
        clean = next;
      } catch {
        break;
      }
    }
    return apiClient.get<ProjectItem>(`/portfolio/${encodeURIComponent(clean)}`);
  },

  async createPortfolio(data: PortfolioFormData): Promise<ProjectItem> {
    return apiClient.post<ProjectItem>("/portfolio", data);
  },

  async updatePortfolio(id: string, data: Partial<PortfolioFormData>): Promise<ProjectItem> {
    return apiClient.put<ProjectItem>(`/portfolio/${id}`, data);
  },

  async deletePortfolio(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(`/portfolio/${id}`);
  },

  async updateStatus(id: string, status: ContentStatus): Promise<ProjectItem> {
    return apiClient.patch<ProjectItem>(`/portfolio/${id}/status`, { status });
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ url: string; filename: string; originalName: string; size: number }>(
      "/portfolio/upload-image",
      formData
    );
  },

  async uploadImages(files: File[]): Promise<{ images: Array<{ url: string; filename: string; originalName: string; size: number }> }> {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return apiClient.post<{ images: Array<{ url: string; filename: string; originalName: string; size: number }> }>(
      "/portfolio/upload-images",
      formData
    );
  },

  async uploadVideo(file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ url: string; filename: string; originalName: string; size: number }>(
      "/portfolio/upload-video",
      formData
    );
  },

  async deleteMedia(filename: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/portfolio/media/${filename}`);
  },

  async getCategories(): Promise<PortfolioCategory[]> {
    return apiClient.get<PortfolioCategory[]>("/portfolio/categories");
  },

  async getTags(): Promise<Array<{ id: string; name: string; slug: string; projectCount: number }>> {
    return apiClient.get<Array<{ id: string; name: string; slug: string; projectCount: number }>>("/portfolio/tags");
  },
};
