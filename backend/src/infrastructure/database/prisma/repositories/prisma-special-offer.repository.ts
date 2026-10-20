import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import {
  ISpecialOfferRepository,
  SpecialOfferFilter,
  ActiveProductOfferInfo,
  DiscountedCatalogProduct,
} from '../../../../domain/repositories/special-offer.repository.interface.js';
import {
  SpecialOfferCampaignEntity,
  SpecialOfferItemEntity,
  CampaignStatusType,
  DiscountValueType,
} from '../../../../domain/entities/special-offer.entity.js';

@Injectable()
export class PrismaSpecialOfferRepository implements ISpecialOfferRepository {
  private readonly logger = new Logger(PrismaSpecialOfferRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async create(campaign: SpecialOfferCampaignEntity): Promise<SpecialOfferCampaignEntity> {
    // Only one campaign can be active at a time: deactivate others if this one is active
    if (campaign.status === 'ACTIVE') {
      await this.prisma.specialOfferCampaign.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'INACTIVE', isPublished: false, updatedAt: new Date() },
      });
    }

    const created = await this.prisma.specialOfferCampaign.create({
      data: {
        id: campaign.id,
        title: campaign.title,
        tagline: campaign.tagline,
        description: campaign.description,
        bannerUrl: campaign.bannerUrl,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status as any,
        priority: campaign.priority,
        isPublished: campaign.isPublished,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        items: {
          create: campaign.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            discountType: it.discountType as any,
            discountValue: it.discountValue,
            originalPrice: it.originalPrice,
            specialPrice: it.specialPrice,
            stockQuota: it.stockQuota,
            stockSold: it.stockSold,
            maxPerOrder: it.maxPerOrder,
            sortOrder: it.sortOrder,
            createdAt: it.createdAt,
            updatedAt: it.updatedAt,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
                variants: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapToEntity(created);
  }

  public async findById(id: string): Promise<SpecialOfferCampaignEntity | null> {
    const record = await this.prisma.specialOfferCampaign.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
                variants: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async findAll(filter?: SpecialOfferFilter): Promise<SpecialOfferCampaignEntity[]> {
    const where: any = {};

    if (filter?.status && filter.status !== 'all') {
      const now = new Date();
      const statusUpper = filter.status.toUpperCase();
      if (statusUpper === 'ACTIVE') {
        where.status = 'ACTIVE';
        where.isPublished = true;
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      } else if (statusUpper === 'SCHEDULED') {
        where.status = 'ACTIVE';
        where.startDate = { gt: now };
      } else if (statusUpper === 'EXPIRED') {
        where.endDate = { lt: now };
      } else if (statusUpper === 'INACTIVE') {
        where.status = 'INACTIVE';
      } else {
        where.status = statusUpper;
      }
    }

    if (filter?.isPublished !== undefined) {
      where.isPublished = filter.isPublished;
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          items: {
            some: {
              product: {
                name: { contains: q, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const records = await this.prisma.specialOfferCampaign.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
                variants: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((r) => this.mapToEntity(r));
  }

  public async findActiveCampaign(): Promise<SpecialOfferCampaignEntity | null> {
    const now = new Date();
    const record = await this.prisma.specialOfferCampaign.findFirst({
      where: {
        status: 'ACTIVE',
        isPublished: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
                variants: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async update(campaign: SpecialOfferCampaignEntity): Promise<SpecialOfferCampaignEntity> {
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Delete removed items or replace
      await tx.specialOfferItem.deleteMany({
        where: { campaignId: campaign.id },
      });

      // 2. Update campaign and recreate items
      return await tx.specialOfferCampaign.update({
        where: { id: campaign.id },
        data: {
          title: campaign.title,
          tagline: campaign.tagline,
          description: campaign.description,
          bannerUrl: campaign.bannerUrl,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          status: campaign.status as any,
          priority: campaign.priority,
          isPublished: campaign.isPublished,
          updatedAt: new Date(),
          items: {
            create: campaign.items.map((it) => ({
              id: it.id,
              productId: it.productId,
              discountType: it.discountType as any,
              discountValue: it.discountValue,
              originalPrice: it.originalPrice,
              specialPrice: it.specialPrice,
              stockQuota: it.stockQuota,
              stockSold: it.stockSold,
              maxPerOrder: it.maxPerOrder,
              sortOrder: it.sortOrder,
              createdAt: it.createdAt,
              updatedAt: new Date(),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  brand: true,
                  category: true,
                  variants: {
                    include: {
                      inventory: true,
                    },
                  },
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });

    return this.mapToEntity(updated);
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.specialOfferCampaign.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async getActiveProductOffer(productId: string): Promise<ActiveProductOfferInfo | null> {
    const now = new Date();
    const items = await this.prisma.specialOfferItem.findMany({
      where: {
        productId,
        campaign: {
          status: 'ACTIVE',
          isPublished: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      include: {
        campaign: true,
      },
      orderBy: [
        { campaign: { priority: 'desc' } },
        { specialPrice: 'asc' },
      ],
    });

    if (!items || items.length === 0) return null;

    // Pick top priority item that still has remaining quota/capacity
    for (const item of items) {
      const stockQuota = item.stockQuota !== null ? Number(item.stockQuota) : 999;
      const stockRemaining = Math.max(0, stockQuota - item.stockSold);
      if (stockRemaining <= 0) {
        continue;
      }

      const originalPrice = item.originalPrice ? Number(item.originalPrice) : 0;
      const specialPrice = Number(item.specialPrice);
      const discountPercent =
        item.discountType === 'PERCENTAGE'
          ? Number(item.discountValue)
          : originalPrice > 0
          ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100)
          : 0;

      return {
        campaignId: item.campaignId,
        campaignTitle: item.campaign.title,
        productId: item.productId,
        specialPrice,
        originalPrice,
        discountPercent,
        stockRemaining,
        maxPerOrder: item.maxPerOrder ?? 5,
      };
    }

    return null;
  }

  public async incrementSold(campaignId: string, productId: string, quantity: number): Promise<void> {
    try {
      await this.prisma.specialOfferItem.updateMany({
        where: { campaignId, productId },
        data: {
          stockSold: { increment: quantity },
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      this.logger.warn(`Could not increment stockSold for campaign ${campaignId}, product ${productId}:`, err);
    }
  }

  public async deactivateAllActive(): Promise<void> {
    await this.prisma.specialOfferCampaign.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'INACTIVE', isPublished: false, updatedAt: new Date() },
    });
  }

  public async activateCampaign(id: string): Promise<SpecialOfferCampaignEntity> {
    const now = new Date();

    // 1. Deactivate any previously active campaign
    await this.prisma.specialOfferCampaign.updateMany({
      where: { status: 'ACTIVE', id: { not: id } },
      data: { status: 'INACTIVE', isPublished: false, updatedAt: now },
    });

    // 2. Fetch target campaign to inspect its schedule
    const target = await this.prisma.specialOfferCampaign.findUnique({
      where: { id },
    });
    if (!target) {
      throw new Error(`کمپین با شناسه ${id} یافت نشد.`);
    }

    // "در صورت فعال شدن جشنواره ای که موعد ان نرسیده قبلی غیر فعال میشه و تاریخ شروع ان به لحظه فعال شدن ان تنظیم میشود"
    const newStartDate = target.startDate > now ? now : target.startDate;
    const newEndDate =
      target.endDate <= now
        ? new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        : target.endDate;

    const updated = await this.prisma.specialOfferCampaign.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        isPublished: true,
        startDate: newStartDate,
        endDate: newEndDate,
        updatedAt: now,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
                variants: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapToEntity(updated);
  }

  public async getDiscountedProducts(): Promise<DiscountedCatalogProduct[]> {
    const products = await this.prisma.product.findMany({
      where: {
        status: { not: 'ARCHIVED' },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        category: true,
        variants: { include: { inventory: true } },
        discounts: { where: { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products
      .map((prod) => {
        const basePrice = Number(prod.basePrice);
        let compareAtPrice = prod.compareAtPrice ? Number(prod.compareAtPrice) : 0;
        let discountPercent = 0;

        if (compareAtPrice > basePrice) {
          discountPercent = Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
        } else if (prod.discounts && prod.discounts.length > 0) {
          const disc = prod.discounts[0];
          if (disc.discountType === 'PERCENTAGE') {
            discountPercent = Number(disc.discountValue);
            compareAtPrice = Math.round(basePrice / (1 - discountPercent / 100));
          } else {
            const fixedDisc = Number(disc.discountValue);
            compareAtPrice = basePrice + fixedDisc;
            discountPercent = Math.round((fixedDisc / compareAtPrice) * 100);
          }
        }

        const defaultVariant = prod.variants && prod.variants[0];
        const stock = defaultVariant?.inventory?.quantity ?? 10;

        return {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku || undefined,
          basePrice,
          compareAtPrice: Math.max(compareAtPrice, basePrice),
          discountPercent: Math.max(0, discountPercent),
          stock,
          images: prod.images.map((img) => img.url),
          brand: prod.brand?.name || undefined,
          category: prod.category?.shortName || prod.category?.longName || undefined,
        };
      })
      .filter((p) => (p.compareAtPrice > p.basePrice && p.discountPercent > 0) || p.discountPercent > 0);
  }

  private mapToEntity(raw: any): SpecialOfferCampaignEntity {
    const items = (raw.items || []).map((it: any) => {
      let productInfo = null;
      if (it.product) {
        const prod = it.product;
        const defaultVariant = prod.variants && prod.variants[0];
        const stock = defaultVariant?.inventory?.quantity ?? 10;
        productInfo = {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          basePrice: Number(prod.basePrice),
          stock,
          images: (prod.images || []).map((img: any) => img.url),
          brand: prod.brand?.name || null,
          category: prod.category?.shortName || prod.category?.slug || null,
          shortDescription: prod.shortDescription || null,
          specs: [],
          inStock: stock > 0,
        };
      }

      return new SpecialOfferItemEntity({
        id: it.id,
        campaignId: it.campaignId,
        productId: it.productId,
        discountType: it.discountType as DiscountValueType,
        discountValue: Number(it.discountValue),
        originalPrice: it.originalPrice ? Number(it.originalPrice) : Number(it.product?.basePrice || 0),
        specialPrice: Number(it.specialPrice),
        stockQuota: it.stockQuota,
        stockSold: it.stockSold || 0,
        maxPerOrder: it.maxPerOrder,
        sortOrder: it.sortOrder || 0,
        product: productInfo,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
      });
    });

    return new SpecialOfferCampaignEntity({
      id: raw.id,
      title: raw.title,
      tagline: raw.tagline,
      description: raw.description,
      bannerUrl: raw.bannerUrl,
      startDate: raw.startDate,
      endDate: raw.endDate,
      status: raw.status as CampaignStatusType,
      priority: raw.priority,
      isPublished: raw.isPublished,
      items,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
