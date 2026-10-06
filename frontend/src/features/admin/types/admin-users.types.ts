export type AdminUserRole = "admin" | "sales_manager" | "partner_b2b" | "customer";
export type AdminUserStatus = "active" | "suspended" | "pending_verification";

export interface AdminUserActivity {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device?: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  nationalCode: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  nationalCodeVerified: boolean;
  twoFactorActive: boolean;
  ordersCount: number;
  totalSpent: number;
  walletBalance: number;
  registeredAt: string;
  lastLogin: string;
  companyName?: string;
  userTier?: "gold" | "silver" | "bronze";
  notes?: string;
  activities: AdminUserActivity[];
}
