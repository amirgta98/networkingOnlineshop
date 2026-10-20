import { SpecialOfferCampaignEntity } from '../entities/special-offer.entity.js';

export interface SpecialOfferFilter {
  status?: string;
  isPublished?: boolean;
  search?: string;
}

export interface ActiveProductOfferInfo {
  campaignId: string;
  campaignTitle: string;
  productId: string;
  specialPrice: number;
  originalPrice: number;
  discountPercent: number;
  stockRemaining: number;
  maxPerOrder: number;
}

export interface DiscountedCatalogProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  basePrice: number;
  compareAtPrice: number;
  discountPercent: number;
  stock: number;
  images: string[];
  brand?: string;
  category?: string;
}

export interface ISpecialOfferRepository {
  create(campaign: SpecialOfferCampaignEntity): Promise<SpecialOfferCampaignEntity>;
  findById(id: string): Promise<SpecialOfferCampaignEntity | null>;
  findAll(filter?: SpecialOfferFilter): Promise<SpecialOfferCampaignEntity[]>;
  findActiveCampaign(): Promise<SpecialOfferCampaignEntity | null>;
  update(campaign: SpecialOfferCampaignEntity): Promise<SpecialOfferCampaignEntity>;
  delete(id: string): Promise<boolean>;
  getActiveProductOffer(productId: string): Promise<ActiveProductOfferInfo | null>;
  incrementSold(campaignId: string, productId: string, quantity: number): Promise<void>;
  getDiscountedProducts(): Promise<DiscountedCatalogProduct[]>;
  deactivateAllActive(): Promise<void>;
  activateCampaign(id: string): Promise<SpecialOfferCampaignEntity>;
}

