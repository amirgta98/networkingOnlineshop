import { randomUUID } from 'node:crypto';
import type {
  IAffiliateRepository,
  PartnerQueryParams,
  CommissionQueryParams,
  PayoutQueryParams,
} from '../../../domain/repositories/affiliate.repository.interface.js';
import {
  AffiliateSettingsEntity,
  AffiliatePartnerEntity,
  AffiliateCommissionEntity,
  AffiliatePayoutEntity,
  type AffiliateCommissionStatus,
  type AffiliatePartnerStatus,
} from '../../../domain/entities/affiliate.entity.js';

export class InMemoryAffiliateRepository implements IAffiliateRepository {
  private settings: AffiliateSettingsEntity = new AffiliateSettingsEntity({
    id: 'default-affiliate-settings',
    defaultDiscountPercent: 8,
    defaultStaticIpCommission: 150000,
    defaultInternetCommission: 400000,
    isAffiliateSystemEnabled: true,
    isProductDiscountEnabled: true,
    isStaticIpCommissionEnabled: true,
    isInternetCommissionEnabled: true,
    eligibleProductIds: [],
    eligibleCategoryIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  private partners: Map<string, AffiliatePartnerEntity> = new Map();
  private commissions: Map<string, AffiliateCommissionEntity> = new Map();
  private payouts: Map<string, AffiliatePayoutEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Seed Kamran Rostami as default partner
    const partnerId = '00000000-0000-4000-a000-000000000002';
    const partner = new AffiliatePartnerEntity({
      id: partnerId,
      userId: partnerId,
      partnerCode: 'PRT-8801',
      status: 'ACTIVE',
      customDiscountPercent: null, // uses default 8%
      customStaticIpCommission: null, // uses default 150k
      customInternetCommission: null, // uses default 400k
      isDiscountEnabled: true,
      isCommissionEnabled: true,
      totalSales: 185000000,
      totalOrders: 14,
      totalCommission: 6400000,
      paidCommission: 4200000,
      approvedCommission: 2200000,
      notes: 'همکار رسمی و تأییدشده B2B شبکه',
      joinedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      user: {
        name: 'کامران رستمی',
        phone: '09162947222',
        email: 'partner@kahkeshan-net.ir',
      },
    });
    this.partners.set(partnerId, partner);

    // Seed Reza Karimi with customized rates (12%, 200k, 500k)
    const partnerId2 = 'partner-reza-karimi';
    const partner2 = new AffiliatePartnerEntity({
      id: partnerId2,
      userId: 'usr-reza-karimi',
      partnerCode: 'PRT-9902',
      status: 'ACTIVE',
      customDiscountPercent: 12,
      customStaticIpCommission: 200000,
      customInternetCommission: 500000,
      isDiscountEnabled: true,
      isCommissionEnabled: true,
      totalSales: 320000000,
      totalOrders: 22,
      totalCommission: 12500000,
      paidCommission: 8500000,
      approvedCommission: 4000000,
      notes: 'همکار برتر ویژه با تخفیف ۱۲٪',
      joinedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000),
      createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      user: {
        name: 'رضا کریمی',
        phone: '09123333333',
        email: 'karimi@network-pro.ir',
      },
    });
    this.partners.set(partnerId2, partner2);

    // Seed Maryam Hosseini as pending partner
    const partnerId3 = 'partner-maryam-hosseini';
    const partner3 = new AffiliatePartnerEntity({
      id: partnerId3,
      userId: 'usr-maryam-hosseini',
      partnerCode: 'PRT-7703',
      status: 'PENDING_APPROVAL',
      customDiscountPercent: 5,
      customStaticIpCommission: 100000,
      customInternetCommission: 300000,
      isDiscountEnabled: true,
      isCommissionEnabled: true,
      totalSales: 0,
      totalOrders: 0,
      totalCommission: 0,
      paidCommission: 0,
      approvedCommission: 0,
      notes: 'پرونده در انتظار احراز مدارک',
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        name: 'مریم حسینی',
        phone: '09124444444',
        email: 'hosseini@infra-net.ir',
      },
    });
    this.partners.set(partnerId3, partner3);
  }

  async getSettings(): Promise<AffiliateSettingsEntity> {
    return this.settings;
  }

  async updateSettings(partial: Partial<AffiliateSettingsEntity['props']>): Promise<AffiliateSettingsEntity> {
    this.settings = new AffiliateSettingsEntity({
      ...this.settings.props,
      ...partial,
      updatedAt: new Date(),
    });
    return this.settings;
  }

  async findPartnerById(id: string): Promise<AffiliatePartnerEntity | null> {
    return this.partners.get(id) || null;
  }

  async findPartnerByUserId(userId: string): Promise<AffiliatePartnerEntity | null> {
    for (const p of this.partners.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  async findPartnerByCode(partnerCode: string): Promise<AffiliatePartnerEntity | null> {
    const code = partnerCode.trim().toUpperCase();
    for (const p of this.partners.values()) {
      if (p.partnerCode.toUpperCase() === code) return p;
    }
    return null;
  }

  async findPartners(params: PartnerQueryParams): Promise<{ items: AffiliatePartnerEntity[]; total: number }> {
    let result = Array.from(this.partners.values());

    if (params.status) {
      result = result.filter((p) => p.status === params.status);
    }

    if (params.search) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.partnerCode.toLowerCase().includes(q) ||
          p.userId.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.user?.name.toLowerCase().includes(q) ||
          p.user?.phone.includes(q),
      );
    }

    const total = result.length;
    const skip = params.skip || 0;
    const take = params.take || 50;
    const items = result.slice(skip, skip + take);

    return { items, total };
  }

  async createPartner(props: Partial<AffiliatePartnerEntity['props']>): Promise<AffiliatePartnerEntity> {
    const id = props.id || randomUUID();
    const partnerCode = props.partnerCode || `PRT-${Math.floor(1000 + Math.random() * 9000)}`;
    const partner = new AffiliatePartnerEntity({
      id,
      userId: props.userId || randomUUID(),
      partnerCode,
      status: props.status || 'ACTIVE',
      customDiscountPercent: props.customDiscountPercent ?? null,
      customStaticIpCommission: props.customStaticIpCommission ?? null,
      customInternetCommission: props.customInternetCommission ?? null,
      isDiscountEnabled: props.isDiscountEnabled ?? true,
      isCommissionEnabled: props.isCommissionEnabled ?? true,
      totalSales: props.totalSales || 0,
      totalOrders: props.totalOrders || 0,
      totalCommission: props.totalCommission || 0,
      paidCommission: props.paidCommission || 0,
      approvedCommission: props.approvedCommission || 0,
      notes: props.notes || null,
      joinedAt: props.joinedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: props.user,
    });
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: string, updates: Partial<AffiliatePartnerEntity['props']>): Promise<AffiliatePartnerEntity> {
    const existing = this.partners.get(id);
    if (!existing) {
      throw new Error(`همکار با شناسه ${id} یافت نشد.`);
    }
    existing.updateDetails(updates);
    return existing;
  }

  async resetPartnerDefaults(id: string): Promise<AffiliatePartnerEntity> {
    const existing = this.partners.get(id);
    if (!existing) {
      throw new Error(`همکار با شناسه ${id} یافت نشد.`);
    }
    existing.resetCustomDefaults();
    return existing;
  }

  async createCommission(props: Partial<AffiliateCommissionEntity['props']>): Promise<AffiliateCommissionEntity> {
    const id = props.id || randomUUID();
    const comm = new AffiliateCommissionEntity({
      id,
      partnerId: props.partnerId!,
      orderId: props.orderId!,
      orderNumber: props.orderNumber || 'ORD-000',
      productType: props.productType || 'INTERNET',
      productTitle: props.productTitle || 'سرویس',
      quantity: props.quantity || 1,
      unitCommission: props.unitCommission || 0,
      totalCommission: props.totalCommission || 0,
      status: props.status || 'PENDING',
      notes: props.notes || null,
      partnerName: props.partnerName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.commissions.set(id, comm);

    // Update partner aggregate metrics
    const partner = this.partners.get(props.partnerId!);
    if (partner) {
      partner.updateDetails({
        totalCommission: partner.totalCommission + (props.totalCommission || 0),
        approvedCommission: partner.approvedCommission + (props.totalCommission || 0),
      });
    }

    return comm;
  }

  async findCommissions(params: CommissionQueryParams): Promise<{ items: AffiliateCommissionEntity[]; total: number }> {
    let result = Array.from(this.commissions.values());

    if (params.partnerId) {
      result = result.filter((c) => c.partnerId === params.partnerId);
    }
    if (params.orderId) {
      result = result.filter((c) => c.orderId === params.orderId);
    }
    if (params.status) {
      result = result.filter((c) => c.status === params.status);
    }
    if (params.productType) {
      result = result.filter((c) => c.productType === params.productType);
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = result.length;
    const skip = params.skip || 0;
    const take = params.take || 50;
    const items = result.slice(skip, skip + take);

    return { items, total };
  }

  async findCommissionByOrderAndType(orderId: string, productType: string): Promise<AffiliateCommissionEntity | null> {
    for (const c of this.commissions.values()) {
      if (c.orderId === orderId && c.productType === productType) {
        return c;
      }
    }
    return null;
  }

  async updateCommissionStatus(
    id: string,
    status: AffiliateCommissionStatus,
    notes?: string,
  ): Promise<AffiliateCommissionEntity> {
    const existing = this.commissions.get(id);
    if (!existing) {
      throw new Error(`پورسانت با شناسه ${id} یافت نشد.`);
    }
    const oldStatus = existing.status;
    existing.updateStatus(status, notes);

    // If cancelled, subtract from partner totalCommission
    if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      const partner = this.partners.get(existing.partnerId);
      if (partner) {
        partner.updateDetails({
          totalCommission: Math.max(0, partner.totalCommission - existing.totalCommission),
          approvedCommission: Math.max(0, partner.approvedCommission - existing.totalCommission),
        });
      }
    }

    return existing;
  }

  async cancelCommissionsByOrderId(orderId: string): Promise<void> {
    for (const c of this.commissions.values()) {
      if (c.orderId === orderId && c.status !== 'CANCELLED') {
        await this.updateCommissionStatus(c.id, 'CANCELLED', 'سفارش لغو شد.');
      }
    }
  }

  async createPayout(props: Partial<AffiliatePayoutEntity['props']>): Promise<AffiliatePayoutEntity> {
    const id = props.id || randomUUID();
    const payout = new AffiliatePayoutEntity({
      id,
      partnerId: props.partnerId!,
      amount: props.amount || 0,
      trackingCode: props.trackingCode || `PAY-${Date.now()}`,
      paymentMethod: props.paymentMethod || 'SATNA_PAYA',
      description: props.description || null,
      status: props.status || 'COMPLETED',
      paidAt: props.paidAt || new Date(),
      createdAt: new Date(),
      partnerName: props.partnerName,
    });
    this.payouts.set(id, payout);

    // Update partner paid commission
    const partner = this.partners.get(props.partnerId!);
    if (partner) {
      partner.updateDetails({
        paidCommission: partner.paidCommission + (props.amount || 0),
        approvedCommission: Math.max(0, partner.approvedCommission - (props.amount || 0)),
      });
    }

    return payout;
  }

  async findPayouts(params: PayoutQueryParams): Promise<{ items: AffiliatePayoutEntity[]; total: number }> {
    let result = Array.from(this.payouts.values());
    if (params.partnerId) {
      result = result.filter((p) => p.partnerId === params.partnerId);
    }
    result.sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
    const total = result.length;
    const skip = params.skip || 0;
    const take = params.take || 50;
    return { items: result.slice(skip, skip + take), total };
  }
}
