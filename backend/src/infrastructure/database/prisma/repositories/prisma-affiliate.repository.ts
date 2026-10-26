import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma.service.js';
import type {
  IAffiliateRepository,
  PartnerQueryParams,
  CommissionQueryParams,
  PayoutQueryParams,
} from '../../../../domain/repositories/affiliate.repository.interface.js';
import {
  AffiliateSettingsEntity,
  AffiliatePartnerEntity,
  AffiliateCommissionEntity,
  AffiliatePayoutEntity,
  type AffiliateCommissionStatus,
  type AffiliatePartnerStatus,
} from '../../../../domain/entities/affiliate.entity.js';
import { InMemoryAffiliateRepository } from '../../in-memory/in-memory-affiliate.repository.js';

@Injectable()
export class PrismaAffiliateRepository implements IAffiliateRepository {
  private readonly logger = new Logger(PrismaAffiliateRepository.name);
  private readonly inMemoryFallback = new InMemoryAffiliateRepository();

  constructor(private readonly prisma: PrismaService) {}

  private isPrismaError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const name = (err as any).name;
    const code = (err as any).code;
    return (
      name === 'PrismaClientInitializationError' ||
      name === 'PrismaClientRustPanicError' ||
      name === 'PrismaClientUnknownRequestError' ||
      code === 'P1000' ||
      code === 'P1001' ||
      code === 'P2021' ||
      code === 'P2022'
    );
  }

  async getSettings(): Promise<AffiliateSettingsEntity> {
    try {
      let record = await this.prisma.affiliateSettings.findFirst();
      if (!record) {
        record = await this.prisma.affiliateSettings.create({
          data: {
            id: crypto.randomUUID(),
            defaultDiscountPercent: 8.0,
            defaultStaticIpCommission: BigInt(150000),
            defaultInternetCommission: BigInt(400000),
            isAffiliateSystemEnabled: true,
            isProductDiscountEnabled: true,
            isStaticIpCommissionEnabled: true,
            isInternetCommissionEnabled: true,
            eligibleProductIds: [],
            eligibleCategoryIds: [],
          },
        });
      }

      return new AffiliateSettingsEntity({
        id: record.id,
        defaultDiscountPercent: Number(record.defaultDiscountPercent),
        defaultStaticIpCommission: Number(record.defaultStaticIpCommission),
        defaultInternetCommission: Number(record.defaultInternetCommission),
        isAffiliateSystemEnabled: record.isAffiliateSystemEnabled,
        isProductDiscountEnabled: record.isProductDiscountEnabled,
        isStaticIpCommissionEnabled: record.isStaticIpCommissionEnabled,
        isInternetCommissionEnabled: record.isInternetCommissionEnabled,
        eligibleProductIds: record.eligibleProductIds,
        eligibleCategoryIds: record.eligibleCategoryIds,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch (err) {
      if (this.isPrismaError(err)) {
        this.logger.warn(`Prisma error in getSettings, falling back to in-memory: ${(err as any).message}`);
        return this.inMemoryFallback.getSettings();
      }
      throw err;
    }
  }

  async updateSettings(partial: Partial<AffiliateSettingsEntity['props']>): Promise<AffiliateSettingsEntity> {
    try {
      const existing = await this.prisma.affiliateSettings.findFirst();
      const id = existing ? existing.id : crypto.randomUUID();

      const data: any = {};
      if (partial.defaultDiscountPercent !== undefined) data.defaultDiscountPercent = partial.defaultDiscountPercent;
      if (partial.defaultStaticIpCommission !== undefined)
        data.defaultStaticIpCommission = BigInt(Math.round(partial.defaultStaticIpCommission));
      if (partial.defaultInternetCommission !== undefined)
        data.defaultInternetCommission = BigInt(Math.round(partial.defaultInternetCommission));
      if (partial.isAffiliateSystemEnabled !== undefined)
        data.isAffiliateSystemEnabled = partial.isAffiliateSystemEnabled;
      if (partial.isProductDiscountEnabled !== undefined)
        data.isProductDiscountEnabled = partial.isProductDiscountEnabled;
      if (partial.isStaticIpCommissionEnabled !== undefined)
        data.isStaticIpCommissionEnabled = partial.isStaticIpCommissionEnabled;
      if (partial.isInternetCommissionEnabled !== undefined)
        data.isInternetCommissionEnabled = partial.isInternetCommissionEnabled;
      if (partial.eligibleProductIds !== undefined) data.eligibleProductIds = partial.eligibleProductIds;
      if (partial.eligibleCategoryIds !== undefined) data.eligibleCategoryIds = partial.eligibleCategoryIds;

      const record = await this.prisma.affiliateSettings.upsert({
        where: { id },
        update: data,
        create: {
          id,
          defaultDiscountPercent: partial.defaultDiscountPercent ?? 8.0,
          defaultStaticIpCommission: BigInt(Math.round(partial.defaultStaticIpCommission ?? 150000)),
          defaultInternetCommission: BigInt(Math.round(partial.defaultInternetCommission ?? 400000)),
          isAffiliateSystemEnabled: partial.isAffiliateSystemEnabled ?? true,
          isProductDiscountEnabled: partial.isProductDiscountEnabled ?? true,
          isStaticIpCommissionEnabled: partial.isStaticIpCommissionEnabled ?? true,
          isInternetCommissionEnabled: partial.isInternetCommissionEnabled ?? true,
          eligibleProductIds: partial.eligibleProductIds ?? [],
          eligibleCategoryIds: partial.eligibleCategoryIds ?? [],
        },
      });

      return new AffiliateSettingsEntity({
        id: record.id,
        defaultDiscountPercent: Number(record.defaultDiscountPercent),
        defaultStaticIpCommission: Number(record.defaultStaticIpCommission),
        defaultInternetCommission: Number(record.defaultInternetCommission),
        isAffiliateSystemEnabled: record.isAffiliateSystemEnabled,
        isProductDiscountEnabled: record.isProductDiscountEnabled,
        isStaticIpCommissionEnabled: record.isStaticIpCommissionEnabled,
        isInternetCommissionEnabled: record.isInternetCommissionEnabled,
        eligibleProductIds: record.eligibleProductIds,
        eligibleCategoryIds: record.eligibleCategoryIds,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch (err) {
      if (this.isPrismaError(err)) {
        this.logger.warn(`Prisma error in updateSettings, falling back to in-memory: ${(err as any).message}`);
        return this.inMemoryFallback.updateSettings(partial);
      }
      throw err;
    }
  }

  private mapPartnerRecord(p: any): AffiliatePartnerEntity {
    return new AffiliatePartnerEntity({
      id: p.id,
      userId: p.userId,
      partnerCode: p.partnerCode,
      status: p.status as AffiliatePartnerStatus,
      customDiscountPercent: p.customDiscountPercent !== null && p.customDiscountPercent !== undefined ? Number(p.customDiscountPercent) : null,
      customStaticIpCommission: p.customStaticIpCommission !== null && p.customStaticIpCommission !== undefined ? Number(p.customStaticIpCommission) : null,
      customInternetCommission: p.customInternetCommission !== null && p.customInternetCommission !== undefined ? Number(p.customInternetCommission) : null,
      isDiscountEnabled: p.isDiscountEnabled,
      isCommissionEnabled: p.isCommissionEnabled,
      totalSales: Number(p.totalSales || 0),
      totalOrders: p.totalOrders || 0,
      totalCommission: Number(p.totalCommission || 0),
      paidCommission: Number(p.paidCommission || 0),
      approvedCommission: Number(p.approvedCommission || 0),
      notes: p.notes,
      joinedAt: p.joinedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: p.user
        ? {
            name: p.user.name,
            phone: p.user.phone,
            email: p.user.email,
          }
        : undefined,
    });
  }

  async findPartnerById(id: string): Promise<AffiliatePartnerEntity | null> {
    try {
      const record = await this.prisma.affiliatePartner.findUnique({
        where: { id },
        include: { user: true },
      });
      return record ? this.mapPartnerRecord(record) : null;
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findPartnerById(id);
      }
      throw err;
    }
  }

  async findPartnerByUserId(userId: string): Promise<AffiliatePartnerEntity | null> {
    try {
      const record = await this.prisma.affiliatePartner.findUnique({
        where: { userId },
        include: { user: true },
      });
      return record ? this.mapPartnerRecord(record) : null;
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findPartnerByUserId(userId);
      }
      throw err;
    }
  }

  async findPartnerByCode(partnerCode: string): Promise<AffiliatePartnerEntity | null> {
    try {
      const record = await this.prisma.affiliatePartner.findUnique({
        where: { partnerCode: partnerCode.trim().toUpperCase() },
        include: { user: true },
      });
      return record ? this.mapPartnerRecord(record) : null;
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findPartnerByCode(partnerCode);
      }
      throw err;
    }
  }

  async findPartners(params: PartnerQueryParams): Promise<{ items: AffiliatePartnerEntity[]; total: number }> {
    try {
      const where: any = {};
      if (params.status) {
        where.status = params.status;
      }
      if (params.search) {
        const q = params.search.trim();
        where.OR = [
          { partnerCode: { contains: q, mode: 'insensitive' } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
          { user: { phone: { contains: q } } },
        ];
      }

      const [records, total] = await Promise.all([
        this.prisma.affiliatePartner.findMany({
          where,
          include: { user: true },
          skip: params.skip,
          take: params.take || 50,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.affiliatePartner.count({ where }),
      ]);

      return {
        items: records.map((r) => this.mapPartnerRecord(r)),
        total,
      };
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findPartners(params);
      }
      throw err;
    }
  }

  async createPartner(props: Partial<AffiliatePartnerEntity['props']>): Promise<AffiliatePartnerEntity> {
    try {
      const partnerCode = props.partnerCode || `PRT-${Math.floor(1000 + Math.random() * 9000)}`;
      const record = await this.prisma.affiliatePartner.create({
        data: {
          id: props.id || crypto.randomUUID(),
          userId: props.userId!,
          partnerCode,
          status: (props.status as any) || 'ACTIVE',
          customDiscountPercent: props.customDiscountPercent ?? null,
          customStaticIpCommission:
            props.customStaticIpCommission !== null && props.customStaticIpCommission !== undefined
              ? BigInt(Math.round(props.customStaticIpCommission))
              : null,
          customInternetCommission:
            props.customInternetCommission !== null && props.customInternetCommission !== undefined
              ? BigInt(Math.round(props.customInternetCommission))
              : null,
          isDiscountEnabled: props.isDiscountEnabled ?? true,
          isCommissionEnabled: props.isCommissionEnabled ?? true,
          totalSales: BigInt(Math.round(props.totalSales || 0)),
          totalOrders: props.totalOrders || 0,
          totalCommission: BigInt(Math.round(props.totalCommission || 0)),
          paidCommission: BigInt(Math.round(props.paidCommission || 0)),
          approvedCommission: BigInt(Math.round(props.approvedCommission || 0)),
          notes: props.notes,
          joinedAt: props.joinedAt || new Date(),
        },
        include: { user: true },
      });
      return this.mapPartnerRecord(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.createPartner(props);
      }
      throw err;
    }
  }

  async updatePartner(id: string, updates: Partial<AffiliatePartnerEntity['props']>): Promise<AffiliatePartnerEntity> {
    try {
      const data: any = {};
      if (updates.status !== undefined) data.status = updates.status;
      if (updates.customDiscountPercent !== undefined) data.customDiscountPercent = updates.customDiscountPercent;
      if (updates.customStaticIpCommission !== undefined) {
        data.customStaticIpCommission =
          updates.customStaticIpCommission === null ? null : BigInt(Math.round(updates.customStaticIpCommission));
      }
      if (updates.customInternetCommission !== undefined) {
        data.customInternetCommission =
          updates.customInternetCommission === null ? null : BigInt(Math.round(updates.customInternetCommission));
      }
      if (updates.isDiscountEnabled !== undefined) data.isDiscountEnabled = updates.isDiscountEnabled;
      if (updates.isCommissionEnabled !== undefined) data.isCommissionEnabled = updates.isCommissionEnabled;
      if (updates.totalSales !== undefined) data.totalSales = BigInt(Math.round(updates.totalSales));
      if (updates.totalOrders !== undefined) data.totalOrders = updates.totalOrders;
      if (updates.totalCommission !== undefined) data.totalCommission = BigInt(Math.round(updates.totalCommission));
      if (updates.paidCommission !== undefined) data.paidCommission = BigInt(Math.round(updates.paidCommission));
      if (updates.approvedCommission !== undefined)
        data.approvedCommission = BigInt(Math.round(updates.approvedCommission));
      if (updates.notes !== undefined) data.notes = updates.notes;

      const record = await this.prisma.affiliatePartner.update({
        where: { id },
        data,
        include: { user: true },
      });
      return this.mapPartnerRecord(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.updatePartner(id, updates);
      }
      throw err;
    }
  }

  async resetPartnerDefaults(id: string): Promise<AffiliatePartnerEntity> {
    try {
      const record = await this.prisma.affiliatePartner.update({
        where: { id },
        data: {
          customDiscountPercent: null,
          customStaticIpCommission: null,
          customInternetCommission: null,
        },
        include: { user: true },
      });
      return this.mapPartnerRecord(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.resetPartnerDefaults(id);
      }
      throw err;
    }
  }

  private mapCommissionRecord(c: any): AffiliateCommissionEntity {
    return new AffiliateCommissionEntity({
      id: c.id,
      partnerId: c.partnerId,
      orderId: c.orderId,
      orderNumber: c.orderNumber,
      productType: c.productType,
      productTitle: c.productTitle,
      quantity: c.quantity,
      unitCommission: Number(c.unitCommission),
      totalCommission: Number(c.totalCommission),
      status: c.status as AffiliateCommissionStatus,
      notes: c.notes,
      partnerName: c.partner?.user?.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }

  async createCommission(props: Partial<AffiliateCommissionEntity['props']>): Promise<AffiliateCommissionEntity> {
    try {
      const totalCommission = BigInt(Math.round(props.totalCommission || 0));
      const record = await this.prisma.$transaction(async (tx) => {
        const comm = await tx.affiliateCommission.create({
          data: {
            id: props.id || crypto.randomUUID(),
            partnerId: props.partnerId!,
            orderId: props.orderId!,
            orderNumber: props.orderNumber || 'ORD-000',
            productType: props.productType || 'INTERNET',
            productTitle: props.productTitle || 'سرویس',
            quantity: props.quantity || 1,
            unitCommission: BigInt(Math.round(props.unitCommission || 0)),
            totalCommission,
            status: (props.status as any) || 'PENDING',
            notes: props.notes,
          },
          include: { partner: { include: { user: true } } },
        });

        // Atomically update partner's aggregate statistics
        await tx.affiliatePartner.update({
          where: { id: props.partnerId! },
          data: {
            totalCommission: { increment: totalCommission },
            approvedCommission: { increment: totalCommission },
          },
        });

        return comm;
      });

      return this.mapCommissionRecord(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.createCommission(props);
      }
      throw err;
    }
  }

  async findCommissions(params: CommissionQueryParams): Promise<{ items: AffiliateCommissionEntity[]; total: number }> {
    try {
      const where: any = {};
      if (params.partnerId) where.partnerId = params.partnerId;
      if (params.orderId) where.orderId = params.orderId;
      if (params.status) where.status = params.status;
      if (params.productType) where.productType = params.productType;

      const [records, total] = await Promise.all([
        this.prisma.affiliateCommission.findMany({
          where,
          include: { partner: { include: { user: true } } },
          skip: params.skip,
          take: params.take || 50,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.affiliateCommission.count({ where }),
      ]);

      return {
        items: records.map((r) => this.mapCommissionRecord(r)),
        total,
      };
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findCommissions(params);
      }
      throw err;
    }
  }

  async findCommissionByOrderAndType(orderId: string, productType: string): Promise<AffiliateCommissionEntity | null> {
    try {
      const record = await this.prisma.affiliateCommission.findFirst({
        where: { orderId, productType },
        include: { partner: { include: { user: true } } },
      });
      return record ? this.mapCommissionRecord(record) : null;
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findCommissionByOrderAndType(orderId, productType);
      }
      throw err;
    }
  }

  async updateCommissionStatus(
    id: string,
    status: AffiliateCommissionStatus,
    notes?: string,
  ): Promise<AffiliateCommissionEntity> {
    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.affiliateCommission.findUnique({ where: { id } });
        if (!existing) {
          throw new Error(`پورسانت با شناسه ${id} یافت نشد.`);
        }

        const oldStatus = existing.status;
        const updated = await tx.affiliateCommission.update({
          where: { id },
          data: {
            status: status as any,
            notes: notes !== undefined ? notes : existing.notes,
          },
          include: { partner: { include: { user: true } } },
        });

        // If cancelled, deduct from partner totalCommission
        if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
          await tx.affiliatePartner.update({
            where: { id: existing.partnerId },
            data: {
              totalCommission: { decrement: existing.totalCommission },
              approvedCommission: { decrement: existing.totalCommission },
            },
          });
        }

        return updated;
      });

      return this.mapCommissionRecord(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.updateCommissionStatus(id, status, notes);
      }
      throw err;
    }
  }

  async cancelCommissionsByOrderId(orderId: string): Promise<void> {
    try {
      const list = await this.prisma.affiliateCommission.findMany({
        where: { orderId, status: { not: 'CANCELLED' } },
      });
      for (const item of list) {
        await this.updateCommissionStatus(item.id, 'CANCELLED', 'لغو خودکار به دلیل لغو سفارش');
      }
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.cancelCommissionsByOrderId(orderId);
      }
      throw err;
    }
  }

  private mapPayoutRecord(p: any): AffiliatePayoutEntity {
    return new AffiliatePayoutEntity({
      id: p.id,
      partnerId: p.partnerId,
      amount: Number(p.amount),
      trackingCode: p.trackingCode,
      paymentMethod: p.paymentMethod,
      description: p.description,
      status: p.status,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      partnerName: p.partner?.user?.name,
    });
  }

  async createPayout(props: Partial<AffiliatePayoutEntity['props']>): Promise<AffiliatePayoutEntity> {
    try {
      const amount = BigInt(Math.round(props.amount || 0));
      const trackingCode = props.trackingCode || `PAY-${Date.now()}`;

      const record = await this.prisma.$transaction(async (tx) => {
        const payout = await tx.affiliatePayout.create({
          data: {
            id: props.id || crypto.randomUUID(),
            partnerId: props.partnerId!,
            amount,
            trackingCode,
            paymentMethod: props.paymentMethod || 'SATNA_PAYA',
            description: props.description,
            status: props.status || 'COMPLETED',
            paidAt: props.paidAt || new Date(),
          },
          include: { partner: { include: { user: true } } },
        });

        // Update partner payout statistics
        await tx.affiliatePartner.update({
          where: { id: props.partnerId! },
          data: {
            paidCommission: { increment: amount },
            approvedCommission: { decrement: amount },
          },
        });

        return payout;
      });

      return this.mapPayoutRecord(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.createPayout(props);
      }
      throw err;
    }
  }

  async findPayouts(params: PayoutQueryParams): Promise<{ items: AffiliatePayoutEntity[]; total: number }> {
    try {
      const where: any = {};
      if (params.partnerId) where.partnerId = params.partnerId;

      const [records, total] = await Promise.all([
        this.prisma.affiliatePayout.findMany({
          where,
          include: { partner: { include: { user: true } } },
          skip: params.skip,
          take: params.take || 50,
          orderBy: { paidAt: 'desc' },
        }),
        this.prisma.affiliatePayout.count({ where }),
      ]);

      return {
        items: records.map((r) => this.mapPayoutRecord(r)),
        total,
      };
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findPayouts(params);
      }
      throw err;
    }
  }
}
