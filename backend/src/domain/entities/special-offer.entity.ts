export type CampaignStatusType = 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';
export type DiscountValueType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface SpecialOfferItemProductInfo {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  basePrice: number;
  stock: number;
  images: string[];
  brand?: string | null;
  category?: string | null;
  shortDescription?: string | null;
  specs?: string[];
  inStock?: boolean;
}

export interface SpecialOfferItemProps {
  id: string;
  campaignId: string;
  productId: string;
  discountType: DiscountValueType;
  discountValue: number;
  originalPrice: number;
  specialPrice: number;
  stockQuota?: number | null;
  stockSold?: number;
  maxPerOrder?: number | null;
  sortOrder?: number;
  product?: SpecialOfferItemProductInfo | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SpecialOfferItemEntity {
  public readonly id: string;
  public readonly campaignId: string;
  public readonly productId: string;
  public readonly discountType: DiscountValueType;
  public readonly discountValue: number;
  public readonly originalPrice: number;
  public readonly specialPrice: number;
  public readonly stockQuota: number | null;
  public stockSold: number;
  public readonly maxPerOrder: number;
  public readonly sortOrder: number;
  public product?: SpecialOfferItemProductInfo | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SpecialOfferItemProps) {
    this.id = props.id;
    this.campaignId = props.campaignId;
    this.productId = props.productId;
    this.discountType = props.discountType || 'PERCENTAGE';
    this.discountValue = Number(props.discountValue);
    this.originalPrice = Number(props.originalPrice);
    this.specialPrice = Number(props.specialPrice);
    this.stockQuota = props.stockQuota !== undefined && props.stockQuota !== null ? Number(props.stockQuota) : null;
    this.stockSold = Number(props.stockSold || 0);
    this.maxPerOrder = props.maxPerOrder ? Number(props.maxPerOrder) : 5;
    this.sortOrder = Number(props.sortOrder || 0);
    this.product = props.product || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public getStockRemaining(): number {
    if (this.stockQuota !== null) {
      return Math.max(0, this.stockQuota - this.stockSold);
    }
    if (this.product && typeof this.product.stock === 'number') {
      return Math.max(0, this.product.stock);
    }
    return 10;
  }

  public getStockTotal(): number {
    if (this.stockQuota !== null) {
      return Math.max(this.stockQuota, this.stockSold);
    }
    if (this.product && typeof this.product.stock === 'number') {
      return Math.max(this.product.stock + this.stockSold, 10);
    }
    return 20;
  }

  public getDiscountPercent(): number {
    if (this.discountType === 'PERCENTAGE') {
      return Math.round(this.discountValue);
    }
    if (this.originalPrice > 0 && this.originalPrice > this.specialPrice) {
      return Math.round(((this.originalPrice - this.specialPrice) / this.originalPrice) * 100);
    }
    return 0;
  }

  public isCapacityReached(): boolean {
    if (this.stockQuota !== null && this.stockSold >= this.stockQuota) {
      return true;
    }
    if (this.getStockRemaining() <= 0) {
      return true;
    }
    if (this.product && this.product.inStock === false) {
      return true;
    }
    return false;
  }

  public toJSON() {
    return {
      id: this.id,
      campaignId: this.campaignId,
      productId: this.productId,
      discountType: this.discountType,
      discountValue: this.discountValue,
      originalPrice: this.originalPrice,
      specialPrice: this.specialPrice,
      discountPercent: this.getDiscountPercent(),
      stockQuota: this.stockQuota,
      stockSold: this.stockSold,
      stockRemaining: this.getStockRemaining(),
      stockTotal: this.getStockTotal(),
      isCapacityReached: this.isCapacityReached(),
      maxPerOrder: this.maxPerOrder,
      sortOrder: this.sortOrder,
      product: this.product,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export interface SpecialOfferCampaignProps {
  id: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  startDate: Date;
  endDate: Date;
  status?: CampaignStatusType;
  priority?: number;
  isPublished?: boolean;
  items?: SpecialOfferItemEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class SpecialOfferCampaignEntity {
  public readonly id: string;
  public title: string;
  public tagline: string | null;
  public description: string | null;
  public bannerUrl: string | null;
  public startDate: Date;
  public endDate: Date;
  public status: CampaignStatusType;
  public priority: number;
  public isPublished: boolean;
  public items: SpecialOfferItemEntity[];
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: SpecialOfferCampaignProps) {
    this.id = props.id;
    this.title = props.title;
    this.tagline = props.tagline ?? null;
    this.description = props.description ?? null;
    this.bannerUrl = props.bannerUrl ?? null;
    this.startDate = props.startDate instanceof Date ? props.startDate : new Date(props.startDate);
    this.endDate = props.endDate instanceof Date ? props.endDate : new Date(props.endDate);
    this.status = props.status || 'ACTIVE';
    this.priority = Number(props.priority || 0);
    this.isPublished = props.isPublished !== undefined ? Boolean(props.isPublished) : true;
    this.items = props.items || [];
    this.createdAt = props.createdAt instanceof Date ? props.createdAt : new Date(props.createdAt || Date.now());
    this.updatedAt = props.updatedAt instanceof Date ? props.updatedAt : new Date(props.updatedAt || Date.now());
  }

  public getComputedStatus(now: Date = new Date()): CampaignStatusType {
    if (this.status === 'INACTIVE') return 'INACTIVE';
    if (now < this.startDate) return 'SCHEDULED';
    if (now > this.endDate) return 'EXPIRED';
    return 'ACTIVE';
  }

  public isCurrentlyActive(now: Date = new Date()): boolean {
    return this.isPublished && this.getComputedStatus(now) === 'ACTIVE';
  }

  public getAvailableItems(): SpecialOfferItemEntity[] {
    return this.items.filter((it) => !it.isCapacityReached());
  }

  public toJSON() {
    const computedStatus = this.getComputedStatus();
    return {
      id: this.id,
      title: this.title,
      tagline: this.tagline,
      description: this.description,
      bannerUrl: this.bannerUrl,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      status: this.status,
      computedStatus,
      priority: this.priority,
      isPublished: this.isPublished,
      itemsCount: this.items.length,
      items: this.items.map((it) => it.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
