export type AffiliatePartnerStatus = "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
export type AffiliateCommissionStatus =
  | "PENDING"
  | "APPROVED"
  | "READY_FOR_PAYMENT"
  | "PAID"
  | "CANCELLED";

export interface AffiliateAdminStats {
  partners: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
  };
  commissions: {
    total: number;
    pending: number;
    approved: number;
    readyForPayment: number;
    paid: number;
    cancelled: number;
  };
}

export interface AffiliatePublicSettings {
  isAffiliateSystemEnabled: boolean;
  isProductDiscountEnabled: boolean;
  defaultDiscountPercent: number;
  defaultStaticIpCommission: number;
  defaultInternetCommission: number;
  eligibleProductIds: string[];
  eligibleCategoryIds: string[];
}

export interface AffiliateSettingsDto extends AffiliatePublicSettings {
  id: string;
  isStaticIpCommissionEnabled: boolean;
  isInternetCommissionEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AffiliatePartnerUserDto {
  id?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}

export interface AffiliatePartnerDto {
  id: string;
  userId: string;
  partnerCode: string;
  status: AffiliatePartnerStatus;
  customDiscountPercent: number | null;
  customStaticIpCommission: number | null;
  customInternetCommission: number | null;
  isDiscountEnabled: boolean;
  isCommissionEnabled: boolean;
  totalSales: number;
  totalOrders: number;
  totalCommission: number;
  paidCommission: number;
  approvedCommission: number;
  pendingCommission?: number;
  notes: string | null;
  joinedAt: string;
  createdAt?: string;
  updatedAt?: string;
  user?: AffiliatePartnerUserDto | null;
  effectiveDiscountPercent?: number;
  effectiveStaticIpCommission?: number;
  effectiveInternetCommission?: number;
  isUsingDefaultDiscount?: boolean;
  isUsingDefaultStaticIpCommission?: boolean;
  isUsingDefaultInternetCommission?: boolean;
}

export interface AffiliateCommissionDto {
  id: string;
  partnerId: string;
  orderId: string;
  orderNumber: string;
  productType: "STATIC_IP" | "INTERNET" | string;
  productTitle: string;
  quantity: number;
  unitCommission: number;
  totalCommission: number;
  status: AffiliateCommissionStatus;
  notes: string | null;
  partnerName?: string;
  createdAt: string;
  updatedAt?: string;
  partner?: {
    id: string;
    partnerCode: string;
    user?: {
      name: string;
      phone?: string | null;
    } | null;
  } | null;
}

export interface AffiliatePayoutDto {
  id: string;
  partnerId: string;
  amount: number;
  trackingCode: string;
  paymentMethod: string;
  description: string | null;
  status: string;
  paidAt: string;
  createdAt: string;
  partnerName?: string;
  partner?: {
    id: string;
    partnerCode: string;
    user?: {
      name: string;
      phone?: string | null;
    } | null;
  } | null;
}

export interface UpdateAffiliateSettingsPayload {
  defaultDiscountPercent?: number;
  defaultStaticIpCommission?: number;
  defaultInternetCommission?: number;
  isAffiliateSystemEnabled?: boolean;
  isProductDiscountEnabled?: boolean;
  isStaticIpCommissionEnabled?: boolean;
  isInternetCommissionEnabled?: boolean;
  eligibleProductIds?: string[];
  eligibleCategoryIds?: string[];
}

export interface CreateAffiliatePartnerPayload {
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  partnerCode?: string;
  status?: AffiliatePartnerStatus;
  customDiscountPercent?: number | null;
  customStaticIpCommission?: number | null;
  customInternetCommission?: number | null;
  isDiscountEnabled?: boolean;
  isCommissionEnabled?: boolean;
  notes?: string;
}

export interface UpdateAffiliatePartnerPayload {
  status?: AffiliatePartnerStatus;
  customDiscountPercent?: number | null;
  customStaticIpCommission?: number | null;
  customInternetCommission?: number | null;
  isDiscountEnabled?: boolean;
  isCommissionEnabled?: boolean;
  notes?: string | null;
}

export interface CreateAffiliatePayoutPayload {
  partnerId: string;
  amount: number;
  trackingCode: string;
  paymentMethod?: string;
  description?: string;
}

export interface AdminAffiliatesQueryParams {
  search?: string;
  status?: AffiliatePartnerStatus | string;
  skip?: number;
  take?: number;
}

export interface AdminCommissionsQueryParams {
  partnerId?: string;
  orderId?: string;
  status?: AffiliateCommissionStatus | string;
  productType?: string;
  skip?: number;
  take?: number;
}

export interface AdminPayoutsQueryParams {
  partnerId?: string;
  skip?: number;
  take?: number;
}
