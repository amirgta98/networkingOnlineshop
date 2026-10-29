import { apiClient } from "@/shared/lib/api-client";
import type {
  JobPosition,
  JobApplication,
  JobApplicationStats,
} from "../types";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const careersApi = {
  // ─── Public ───────────────────────────────────────────────────

  async getPublicPositions(params?: {
    search?: string;
    department?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<JobPosition>> {
    return apiClient.get<PaginatedResponse<JobPosition>>("/careers/positions", {
      params: {
        limit: params?.limit || 50,
        page: params?.page || 1,
        search: params?.search,
        department: params?.department,
      },
    });
  },

  async getPublicPosition(id: string): Promise<JobPosition> {
    return apiClient.get<JobPosition>(`/careers/positions/${id}`);
  },

  async submitApplication(formData: FormData): Promise<JobApplication> {
    return apiClient.post<JobApplication>("/careers/applications", formData);
  },

  // ─── Admin Positions ──────────────────────────────────────────

  async getAdminPositions(params?: {
    search?: string;
    department?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<JobPosition>> {
    return apiClient.get<PaginatedResponse<JobPosition>>("/careers/admin/positions", {
      params: {
        search: params?.search,
        department: params?.department,
        isActive: params?.isActive,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },

  async getAdminStats(): Promise<JobApplicationStats> {
    return apiClient.get<JobApplicationStats>("/careers/admin/stats");
  },

  async createPosition(payload: Partial<JobPosition>): Promise<JobPosition> {
    return apiClient.post<JobPosition>("/careers/positions", payload);
  },

  async updatePosition(
    id: string,
    payload: Partial<JobPosition>,
  ): Promise<JobPosition> {
    return apiClient.put<JobPosition>(`/careers/positions/${id}`, payload);
  },

  async togglePositionActive(
    id: string,
    isActive: boolean,
  ): Promise<JobPosition> {
    return apiClient.patch<JobPosition>(`/careers/positions/${id}/toggle-active`, {
      isActive,
    });
  },

  async deletePosition(
    id: string,
    force = false,
  ): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(
      `/careers/positions/${id}`,
      {
        params: force ? { force: true } : undefined,
      },
    );
  },

  // ─── Admin Applications ───────────────────────────────────────

  async getAdminApplications(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    positionId?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    return apiClient.get<PaginatedResponse<JobApplication>>("/careers/applications", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        search: params?.search,
        status: params?.status,
        positionId: params?.positionId,
      },
    });
  },

  async getApplicationById(id: string): Promise<JobApplication> {
    return apiClient.get<JobApplication>(`/careers/applications/${id}`);
  },

  async updateApplicationStatus(
    id: string,
    status: string,
    adminNotes?: string,
  ): Promise<JobApplication> {
    return apiClient.patch<JobApplication>(`/careers/applications/${id}/status`, {
      status,
      adminNotes,
    });
  },

  async deleteApplication(
    id: string,
  ): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(
      `/careers/applications/${id}`,
    );
  },
};
