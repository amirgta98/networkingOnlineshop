import type {
  AffiliateSettingsEntity,
  AffiliatePartnerEntity,
  AffiliateCommissionEntity,
  AffiliatePayoutEntity,
  AffiliateCommissionStatus,
  AffiliatePartnerStatus,
} from '../entities/affiliate.entity.js';

export interface PartnerQueryParams {
  search?: string;
  status?: AffiliatePartnerStatus;
  skip?: number;
  take?: number;
}

export interface CommissionQueryParams {
  partnerId?: string;
  orderId?: string;
  status?: AffiliateCommissionStatus;
  productType?: string;
  skip?: number;
  take?: number;
}

export interface PayoutQueryParams {
  partnerId?: string;
  skip?: number;
  take?: number;
}

export interface IAffiliateRepository {
  getSettings(): Promise<AffiliateSettingsEntity>;
  updateSettings(partial: Partial<AffiliateSettingsEntity['props']>): Promise<AffiliateSettingsEntity>;

  findPartnerById(id: string): Promise<AffiliatePartnerEntity | null>;
  findPartnerByUserId(userId: string): Promise<AffiliatePartnerEntity | null>;
  findPartnerByCode(partnerCode: string): Promise<AffiliatePartnerEntity | null>;
  findPartners(params: PartnerQueryParams): Promise<{ items: AffiliatePartnerEntity[]; total: number }>;
  createPartner(partner: Partial<AffiliatePartnerEntity['props']>): Promise<AffiliatePartnerEntity>;
  updatePartner(id: string, updates: Partial<AffiliatePartnerEntity['props']>): Promise<AffiliatePartnerEntity>;
  resetPartnerDefaults(id: string): Promise<AffiliatePartnerEntity>;

  createCommission(commission: Partial<AffiliateCommissionEntity['props']>): Promise<AffiliateCommissionEntity>;
  findCommissions(params: CommissionQueryParams): Promise<{ items: AffiliateCommissionEntity[]; total: number }>;
  findCommissionByOrderAndType(orderId: string, productType: string): Promise<AffiliateCommissionEntity | null>;
  updateCommissionStatus(id: string, status: AffiliateCommissionStatus, notes?: string): Promise<AffiliateCommissionEntity>;
  cancelCommissionsByOrderId(orderId: string): Promise<void>;

  createPayout(payout: Partial<AffiliatePayoutEntity['props']>): Promise<AffiliatePayoutEntity>;
  findPayouts(params: PayoutQueryParams): Promise<{ items: AffiliatePayoutEntity[]; total: number }>;
}
