import { apiClient } from "@/shared/lib/api-client";
import type {
  ArticleItem,
  ArticleFormData,
  ArticleQueryOptions,
  PaginatedArticlesResponse,
  ArticleCategory,
  ContentStatus,
} from "../types";

export const articlesApi = {
  async getArticles(options: ArticleQueryOptions = {}): Promise<PaginatedArticlesResponse> {
    const params: Record<string, any> = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.search) params.search = options.search;
    if (options.category && options.category !== "all") params.category = options.category;
    if (options.tag) params.tag = options.tag;
    if (options.isFeatured !== undefined) params.isFeatured = options.isFeatured;
    if (options.status) params.status = options.status;

    return apiClient.get<PaginatedArticlesResponse>("/articles", { params });
  },

  async getArticleBySlug(slugOrId: string): Promise<ArticleItem & { relatedArticles?: ArticleItem[] }> {
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
    return apiClient.get<ArticleItem & { relatedArticles?: ArticleItem[] }>(`/articles/${encodeURIComponent(clean)}`);
  },

  async createArticle(data: ArticleFormData): Promise<ArticleItem> {
    return apiClient.post<ArticleItem>("/articles", data);
  },

  async updateArticle(id: string, data: Partial<ArticleFormData>): Promise<ArticleItem> {
    return apiClient.put<ArticleItem>(`/articles/${id}`, data);
  },

  async deleteArticle(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(`/articles/${id}`);
  },

  async updateStatus(id: string, status: ContentStatus): Promise<ArticleItem> {
    return apiClient.patch<ArticleItem>(`/articles/${id}/status`, { status });
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ url: string; filename: string; originalName: string; size: number }>(
      "/articles/upload-image",
      formData
    );
  },

  async uploadImages(files: File[]): Promise<{ images: Array<{ url: string; filename: string; originalName: string; size: number }> }> {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return apiClient.post<{ images: Array<{ url: string; filename: string; originalName: string; size: number }> }>(
      "/articles/upload-images",
      formData
    );
  },

  async uploadVideo(file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ url: string; filename: string; originalName: string; size: number }>(
      "/articles/upload-video",
      formData
    );
  },

  async deleteMedia(filename: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/articles/media/${filename}`);
  },

  async getCategories(): Promise<ArticleCategory[]> {
    return apiClient.get<ArticleCategory[]>("/articles/categories");
  },

  async getTags(): Promise<Array<{ id: string; name: string; slug: string; articleCount: number }>> {
    return apiClient.get<Array<{ id: string; name: string; slug: string; articleCount: number }>>("/articles/tags");
  },
};
