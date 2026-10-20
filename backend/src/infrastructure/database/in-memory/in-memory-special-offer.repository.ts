import {
  ISpecialOfferRepository,
  SpecialOfferFilter,
  ActiveProductOfferInfo,
} from '../../../domain/repositories/special-offer.repository.interface.js';
import { SpecialOfferCampaignEntity } from '../../../domain/entities/special-offer.entity.js';

export class InMemorySpecialOfferRepository implements ISpecialOfferRepository {
  private campaigns: Map<string, SpecialOfferCampaignEntity> = new Map();

  async create(campaign: SpecialOfferCampaignEntity): Promise<SpecialOfferCampaignEntity> {
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async findById(id: string): Promise<SpecialOfferCampaignEntity | null> {
    return this.campaigns.get(id) || null;
  }

  async findAll(filter?: SpecialOfferFilter): Promise<SpecialOfferCampaignEntity[]> {
    let list = Array.from(this.campaigns.values());
    const now = new Date();

    if (filter?.status && filter.status !== 'all') {
      const s = filter.status.toUpperCase();
      if (s === 'ACTIVE') {
        list = list.filter((c) => c.isCurrentlyActive(now));
      } else if (s === 'SCHEDULED') {
        list = list.filter((c) => now < c.startDate);
      } else if (s === 'EXPIRED') {
        list = list.filter((c) => now > c.endDate);
      } else if (s === 'INACTIVE') {
        list = list.filter((c) => c.status === 'INACTIVE');
      }
    }

    if (filter?.isPublished !== undefined) {
      list = list.filter((c) => c.isPublished === filter.isPublished);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    }

    return list.sort((a, b) => b.priority - a.priority);
  }

  async findActiveCampaign(): Promise<SpecialOfferCampaignEntity | null> {
    const now = new Date();
    const active = Array.from(this.campaigns.values())
      .filter((c) => c.isCurrentlyActive(now))
      .sort((a, b) => b.priority - a.priority);
    return active[0] || null;
  }

  async update(campaign: SpecialOfferCampaignEntity): Promise<SpecialOfferCampaignEntity> {
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  async delete(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async getActiveProductOffer(productId: string): Promise<ActiveProductOfferInfo | null> {
    const now = new Date();
    for (const c of Array.from(this.campaigns.values())) {
      if (!c.isCurrentlyActive(now)) continue;
      const item = c.items.find((it) => it.productId === productId);
      if (item) {
        const remaining = item.getStockRemaining();
        if (remaining <= 0 || item.isCapacityReached()) continue;
        return {
          campaignId: c.id,
          campaignTitle: c.title,
          productId,
          specialPrice: item.specialPrice,
          originalPrice: item.originalPrice,
          discountPercent: item.getDiscountPercent(),
          stockRemaining: remaining,
          maxPerOrder: item.maxPerOrder,
        };
      }
    }
    return null;
  }

  async incrementSold(campaignId: string, productId: string, quantity: number): Promise<void> {
    const c = this.campaigns.get(campaignId);
    if (!c) return;
    const item = c.items.find((it) => it.productId === productId);
    if (item) {
      item.stockSold += quantity;
    }
  }

  async deactivateAllActive(): Promise<void> {
    for (const c of this.campaigns.values()) {
      if (c.status === 'ACTIVE') {
        c.status = 'INACTIVE' as any;
        c.isPublished = false;
      }
    }
  }

  async activateCampaign(id: string): Promise<SpecialOfferCampaignEntity> {
    const now = new Date();
    await this.deactivateAllActive();
    const c = this.campaigns.get(id);
    if (!c) throw new Error('Campaign not found');
    if (c.startDate > now) c.startDate = now;
    c.status = 'ACTIVE' as any;
    c.isPublished = true;
    return c;
  }

  async getDiscountedProducts(): Promise<any[]> {
    return [];
  }
}

