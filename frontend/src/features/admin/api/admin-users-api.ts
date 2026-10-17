import { apiClient } from "@/shared/lib/api-client";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../types/admin-users.types";

export interface BackendUserDto {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  nationalCode?: string | null;
  role?: string;
  status?: string;
  isActive?: boolean;
  nationalCodeVerified?: boolean;
  twoFactorActive?: boolean;
  twoFactorMethod?: string;
  ordersCount?: number;
  totalSpent?: number;
  walletBalance?: number;
  registeredAt?: string;
  lastLogin?: string;
  companyName?: string | null;
  userTier?: "gold" | "silver" | "bronze";
  notes?: string | null;
  activities?: Array<{
    id: string;
    action: string;
    timestamp: string;
    ip: string;
    device?: string;
  }>;
}

export function mapBackendUserToAdmin(dto: BackendUserDto): AdminUser {
  let mappedRole: AdminUserRole = "customer";
  const r = (dto.role || "").toLowerCase();
  if (r === "admin" || r === "super_admin" || r === "staff_manager") {
    mappedRole = "admin";
  } else if (r === "sales_manager") {
    mappedRole = "sales_manager";
  } else if (r === "partner_b2b" || r === "partner") {
    mappedRole = "partner_b2b";
  } else {
    mappedRole = "customer";
  }

  let mappedStatus: AdminUserStatus = "active";
  const s = (dto.status || "").toLowerCase();
  if (s === "suspended" || s === "blocked") {
    mappedStatus = "suspended";
  } else if (s === "pending_verification" || s === "pending") {
    mappedStatus = "pending_verification";
  } else if (dto.isActive === false) {
    mappedStatus = "suspended";
  } else {
    mappedStatus = "active";
  }

  return {
    id: dto.id,
    fullName: dto.fullName || dto.name || "کاربر ناشناس",
    phone: dto.phone || "",
    email: dto.email || undefined,
    nationalCode: dto.nationalCode || "",
    role: mappedRole,
    status: mappedStatus,
    nationalCodeVerified: Boolean(dto.nationalCodeVerified),
    twoFactorActive: Boolean(dto.twoFactorActive),
    ordersCount: dto.ordersCount ?? 0,
    totalSpent: dto.totalSpent ?? 0,
    walletBalance: dto.walletBalance ?? 0,
    registeredAt: dto.registeredAt || "نامشخص",
    lastLogin: dto.lastLogin || "ثبت نشده",
    companyName: dto.companyName || undefined,
    userTier: dto.userTier,
    notes: dto.notes || undefined,
    activities: dto.activities || [],
  };
}

export const adminUsersApi = {
  async getUsers(params?: { role?: string; status?: string; search?: string }): Promise<AdminUser[]> {
    const data = await apiClient.get<BackendUserDto[]>("/users", {
      params: {
        ...(params?.role && params.role !== "all" && { role: params.role }),
        ...(params?.status && params.status !== "all" && { status: params.status }),
        ...(params?.search && params.search.trim() && { search: params.search.trim() }),
      },
    });
    return (data || []).map(mapBackendUserToAdmin);
  },

  async getUserById(id: string): Promise<AdminUser> {
    const data = await apiClient.get<BackendUserDto>(`/users/${id}`);
    return mapBackendUserToAdmin(data);
  },

  async updateUserRole(id: string, role: AdminUserRole): Promise<AdminUser> {
    const data = await apiClient.patch<BackendUserDto>(`/users/${id}/role`, { role });
    return mapBackendUserToAdmin(data);
  },

  async updateUserStatus(id: string, status: AdminUserStatus): Promise<AdminUser> {
    const data = await apiClient.patch<BackendUserDto>(`/users/${id}/status`, { status });
    return mapBackendUserToAdmin(data);
  },

  async updateUser(id: string, payload: Partial<AdminUser>): Promise<AdminUser> {
    const data = await apiClient.put<BackendUserDto>(`/users/${id}`, {
      ...payload,
      name: payload.fullName || (payload as any).name,
      fullName: payload.fullName || (payload as any).name,
    });
    return mapBackendUserToAdmin(data);
  },

  async createUser(payload: {
    fullName: string;
    phone: string;
    email?: string;
    role?: AdminUserRole;
    status?: AdminUserStatus;
    nationalCode?: string;
    companyName?: string;
    notes?: string;
  }): Promise<AdminUser> {
    const data = await apiClient.post<BackendUserDto>("/users", {
      name: payload.fullName,
      fullName: payload.fullName,
      email: payload.email || `user_${Date.now()}@fonix-academic.ir`,
      phone: payload.phone,
      role: payload.role || "customer",
      status: payload.status || "active",
      nationalCode: payload.nationalCode,
      companyName: payload.companyName,
      notes: payload.notes,
    });
    return mapBackendUserToAdmin(data);
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/users/${id}`);
  },
};
