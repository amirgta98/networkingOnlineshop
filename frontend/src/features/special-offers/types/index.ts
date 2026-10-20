import { Product } from "@/features/catalog/types";

export type CampaignStatus = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED";
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface SpecialOfferProduct extends Product {
  discountPercent: number;        // e.g. 25 (%)
  originalPrice: number;          // pre-discount price
  stockTotal: number;             // total quantity in special sale
  stockRemaining: number;         // current remaining quantity in special sale
  brand?: string;                 // brand name e.g. "Cisco", "MikroTik", "Ubiquiti"
  specs?: string[];               // key technical specs
  saleEndsAt?: string;            // ISO date string for when offer ends
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface SpecialOfferItem {
  id: string;
  campaignId: string;
  productId: string;
  discountType: DiscountType;
  discountValue: number;
  originalPrice: number;
  specialPrice: number;
  stockQuota?: number | null;
  stockSold: number;
  stockRemaining: number;
  stockTotal: number;
  discountPercent: number;
  maxPerOrder?: number;
  sortOrder: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    basePrice: number;
    stock: number;
    images: string[];
    brand?: string;
    category?: string;
    shortDescription?: string;
    specs?: string[];
    inStock?: boolean;
  };
}

export interface SpecialOfferCampaign {
  id: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  computedStatus: CampaignStatus;
  priority: number;
  isPublished: boolean;
  itemsCount: number;
  items: SpecialOfferItem[];
  products: SpecialOfferProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSpecialOfferResponse {
  campaign: SpecialOfferCampaign | null;
  products: SpecialOfferProduct[];
  title?: string;
  subtitle?: string;
  targetDate?: string;
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

export interface SpecialOfferItemInput {
  productId: string;
  discountType?: DiscountType;
  discountValue?: number;
  stockQuota?: number;
  maxPerOrder?: number;
  sortOrder?: number;
}

export interface CreateSpecialOfferInput {
  title: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  status?: "ACTIVE" | "INACTIVE";
  priority?: number;
  isPublished?: boolean;
  items: SpecialOfferItemInput[];
}

export interface UpdateSpecialOfferInput {
  title?: string;
  tagline?: string;
  description?: string;
  bannerUrl?: string;
  startDate?: string;
  endDate?: string;
  status?: "ACTIVE" | "INACTIVE";
  priority?: number;
  isPublished?: boolean;
  items?: SpecialOfferItemInput[];
}

