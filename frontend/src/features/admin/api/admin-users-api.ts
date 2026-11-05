import { apiClient } from "@/shared/lib/api-client";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  AdminUserAddress,
  AdminUserCart,
  AdminUserOrder,
  AdminUserInvoice,
  AdminUserWallet,
  AdminUserFavorite,
  AdminUserRfq,
  AdminUserAuthenticity,
  AdminUserLoyalty,
  AdminUserSession,
} from "../types/admin-users.types";

export interface BackendUserDto {
  id: string;
  fullName?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  nationalCode?: string | null;
  role?: string;
  permissions?: string[];
  status?: string;
  isActive?: boolean;
  nationalCodeVerified?: boolean;
  twoFactorActive?: boolean;
  twoFactorMethod?: string;
  canBuyInternet?: boolean;
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
  } else if (r === "site_manager" || r === "sitemanager") {
    mappedRole = "site_manager";
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

  const rawName = (dto.fullName || dto.name || "").trim();
  const phoneVal = (dto.phone || "").trim();
  const isCorrupted = !rawName || /^[\s\?؟]+$/.test(rawName) || rawName.includes("***");
  const cleanFullName = isCorrupted ? (phoneVal || "کاربر") : rawName;

  return {
    id: dto.id,
    fullName: cleanFullName,
    phone: phoneVal,
    nationalCode: dto.nationalCode || "",
    role: mappedRole,
    permissions: Array.isArray(dto.permissions) ? dto.permissions : [],
    status: mappedStatus,
    nationalCodeVerified: Boolean(dto.nationalCodeVerified),
    twoFactorActive: Boolean(dto.twoFactorActive),
    canBuyInternet: Boolean(dto.canBuyInternet),
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
  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminUser[]> {
    const data = await apiClient.get<BackendUserDto[]>("/users", {
      params: {
        ...(params?.role && params.role !== "all" && { role: params.role }),
        ...(params?.status && params.status !== "all" && { status: params.status }),
        ...(params?.search && params.search.trim() && { search: params.search.trim() }),
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return (data || []).map(mapBackendUserToAdmin);
  },

  async getUserById(id: string): Promise<AdminUser> {
    const data = await apiClient.get<BackendUserDto>(`/users/${id}`);
    return mapBackendUserToAdmin(data);
  },

  async updateUserRole(id: string, role: AdminUserRole, permissions?: string[]): Promise<AdminUser> {
    const data = await apiClient.patch<BackendUserDto>(`/users/${id}/role`, { role, permissions });
    return mapBackendUserToAdmin(data);
  },

  async updateUserPermissions(id: string, permissions: string[]): Promise<AdminUser> {
    const data = await apiClient.patch<BackendUserDto>(`/users/${id}/permissions`, { permissions });
    return mapBackendUserToAdmin(data);
  },

  async getPermissionsCatalog(): Promise<{
    roles: Array<{ code: string; name: string }>;
    permissions: Array<{ id: string; name: string; description?: string }>;
  }> {
    return apiClient.get(`/users/permissions/catalog`);
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
    role?: AdminUserRole;
    status?: AdminUserStatus;
    nationalCode?: string;
    companyName?: string;
    notes?: string;
    canBuyInternet?: boolean;
  }): Promise<AdminUser> {
    const data = await apiClient.post<BackendUserDto>("/users", {
      name: payload.fullName,
      fullName: payload.fullName,
      phone: payload.phone,
      role: payload.role || "customer",
      status: payload.status || "active",
      nationalCode: payload.nationalCode,
      companyName: payload.companyName,
      notes: payload.notes,
      canBuyInternet: payload.canBuyInternet,
    });
    return mapBackendUserToAdmin(data);
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/users/${id}`);
  },

  async getUserAddresses(userId: string): Promise<AdminUserAddress[]> {
    return apiClient.get<AdminUserAddress[]>(`/users/${userId}/addresses`);
  },

  async getUserCart(userId: string): Promise<AdminUserCart | null> {
    const res = await apiClient.get<any>(`/users/${userId}/cart`);
    if (!res || res.cart === null) return null;
    if (!res.id && (!Array.isArray(res.items) || res.items.length === 0)) return null;
    return res as AdminUserCart;
  },

  async addCartItem(userId: string, productId: string, quantity: number = 1): Promise<AdminUserCart> {
    return apiClient.post<AdminUserCart>(`/users/${userId}/cart/items`, { productId, quantity });
  },

  async updateCartItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<AdminUserCart> {
    return apiClient.patch<AdminUserCart>(`/users/${userId}/cart/items/${cartItemId}`, { quantity });
  },

  async removeCartItem(userId: string, cartItemId: string): Promise<AdminUserCart> {
    return apiClient.delete<AdminUserCart>(`/users/${userId}/cart/items/${cartItemId}`);
  },

  async clearUserCart(userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}/cart`);
  },

  async syncUserCart(userId: string, items: Array<{ productId: string; quantity: number }>): Promise<AdminUserCart> {
    return apiClient.post<AdminUserCart>(`/users/${userId}/cart/sync`, { items });
  },

  async getUserOrders(userId: string): Promise<AdminUserOrder[]> {
    const res = await apiClient.get<AdminUserOrder[]>(`/users/${userId}/orders`);
    return Array.isArray(res) ? res : [];
  },

  async getUserInvoices(userId: string): Promise<AdminUserInvoice[]> {
    const res = await apiClient.get<AdminUserInvoice[]>(`/users/${userId}/invoices`);
    return Array.isArray(res) ? res : [];
  },

  async getUserWallet(userId: string): Promise<AdminUserWallet | null> {
    const res = await apiClient.get<any>(`/users/${userId}/wallet`);
    if (!res || res.wallet === null || !res.id) return null;
    return res as AdminUserWallet;
  },

  async getUserFavorites(userId: string): Promise<AdminUserFavorite[]> {
    const res = await apiClient.get<AdminUserFavorite[]>(`/users/${userId}/favorites`);
    return Array.isArray(res) ? res : [];
  },

  async getUserRfq(userId: string): Promise<AdminUserRfq[]> {
    const res = await apiClient.get<AdminUserRfq[]>(`/users/${userId}/rfq`);
    return Array.isArray(res) ? res : [];
  },

  async getUserAuthenticity(userId: string): Promise<AdminUserAuthenticity[]> {
    const res = await apiClient.get<AdminUserAuthenticity[]>(`/users/${userId}/authenticity`);
    return Array.isArray(res) ? res : [];
  },

  async getUserLoyalty(userId: string): Promise<AdminUserLoyalty | null> {
    const res = await apiClient.get<any>(`/users/${userId}/loyalty`);
    if (!res || res.loyalty === null || !res.id) return null;
    return res as AdminUserLoyalty;
  },

  async getUserSessions(userId: string): Promise<AdminUserSession[]> {
    return apiClient.get<AdminUserSession[]>(`/users/${userId}/sessions`);
  },

  async revokeUserSession(userId: string, sessionId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}/sessions/${sessionId}`);
  },
};
