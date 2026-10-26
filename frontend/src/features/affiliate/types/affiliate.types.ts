export type AffiliatePartnerStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE';
export type AffiliateCommissionStatus = 'PENDING' | 'APPROVED' | 'READY_FOR_PAYMENT' | 'PAID' | 'CANCELLED';

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
  notes: string | null;
  joinedAt: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
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
  productType: 'STATIC_IP' | 'INTERNET' | string;
  productTitle: string;
  quantity: number;
  unitCommission: number;
  totalCommission: number;
  status: AffiliateCommissionStatus;
  notes: string | null;
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
  partner?: {
    id: string;
    partnerCode: string;
    user?: {
      name: string;
      phone?: string | null;
    } | null;
  } | null;
}

export interface AffiliateProfileResponse {
  isPartner: boolean;
  partner?: AffiliatePartnerDto;
  effectiveDiscountPercent?: number;
  effectiveStaticIpCommission?: number;
  effectiveInternetCommission?: number;
  settings?: {
    defaultDiscountPercent: number;
  };
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

export interface EvaluateDiscountItem {
  productId?: string;
  categoryId?: string;
  sku?: string;
  title?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  hasTieredDiscount?: boolean;
  quantity: number;
}

export interface EvaluateDiscountResponse {
  isPartner: boolean;
  partnerCode?: string;
  totalAffiliateDiscount: number;
  items: Array<{
    isEligible: boolean;
    discountPercent: number;
    discountAmount: number;
    unitPriceAfterDiscount: number;
    reason?: string;
    itemDiscountTotal: number;
    quantity: number;
  }>;
}
