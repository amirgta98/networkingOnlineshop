export interface ProductFeatureProps {
  id: string;
  productId?: string;
  title: string;
  description: string;
  iconUrl?: string;
  iconName?: string;
  sortOrder: number;
}

export class ProductFeature {
  constructor(public readonly props: ProductFeatureProps) {}

  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get iconUrl(): string | undefined {
    return this.props.iconUrl;
  }
  get iconName(): string | undefined {
    return this.props.iconName;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
}

export interface ProductImageProps {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  storageKey?: string;
}

export class ProductImage {
  constructor(public readonly props: ProductImageProps) {}

  get id(): string {
    return this.props.id;
  }
  get url(): string {
    return this.props.url;
  }
  get isPrimary(): boolean {
    return this.props.isPrimary;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
}

export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  reservedStock: number;
  warehouseLocation: string;
  status: "active" | "inactive" | "out_of_stock" | "discontinued";
  featured: boolean;
  isSpecialOffer?: boolean;
  discountPercent?: number;
  inStock?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  productImages?: ProductImageProps[];
  warranty: string;
  badges: string[];
  specs: string[];
  features?: ProductFeatureProps[];
  relatedProductIds?: string[];
  relatedProducts?: any[];
  shortDescription: string;
  fullDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get slug(): string {
    return this.props.slug;
  }
  get sku(): string {
    return this.props.sku;
  }
  get category(): string {
    return this.props.category;
  }
  get brand(): string {
    return this.props.brand;
  }
  get price(): number {
    return this.props.price;
  }
  get originalPrice(): number | undefined {
    return this.props.originalPrice;
  }
  get costPrice(): number {
    return this.props.costPrice;
  }
  get stock(): number {
    return this.props.stock;
  }
  get minStockAlert(): number {
    return this.props.minStockAlert;
  }
  get reservedStock(): number {
    return this.props.reservedStock;
  }
  get warehouseLocation(): string {
    return this.props.warehouseLocation;
  }
  get status(): "active" | "inactive" | "out_of_stock" | "discontinued" {
    return this.props.status;
  }
  get featured(): boolean {
    return this.props.featured;
  }
  get rating(): number {
    return this.props.rating;
  }
  get reviewCount(): number {
    return this.props.reviewCount;
  }
  get images(): string[] {
    return this.props.images;
  }
  get warranty(): string {
    return this.props.warranty;
  }
  get badges(): string[] {
    return this.props.badges;
  }
  get specs(): string[] {
    return this.props.specs;
  }
  get features(): ProductFeatureProps[] | undefined {
    return this.props.features;
  }
  get relatedProductIds(): string[] | undefined {
    return this.props.relatedProductIds;
  }
  get relatedProducts(): any[] | undefined {
    return this.props.relatedProducts;
  }
  get shortDescription(): string {
    return this.props.shortDescription;
  }
  get fullDescription(): string | undefined {
    return this.props.fullDescription;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateStock(newStock: number, newPrice?: number): void {
    if (newStock < 0) {
      throw new Error("تعداد موجودی نمی‌تواند کمتر از صفر باشد.");
    }
    this.props.stock = newStock;
    if (newPrice !== undefined && newPrice > 0) {
      this.props.price = newPrice;
    }
    if (newStock === 0 && this.props.status === "active") {
      this.props.status = "out_of_stock";
    } else if (newStock > 0 && this.props.status === "out_of_stock") {
      this.props.status = "active";
    }
    this.props.updatedAt = new Date();
  }

  public updateDetails(updates: Partial<ProductProps>): void {
    this.props = {
      ...this.props,
      ...updates,
      id: this.props.id,
      updatedAt: new Date(),
    };
  }

  public toJSON(): ProductProps {
    const computedInStock = this.props.stock > 0 && this.props.status !== "out_of_stock";
    return {
      ...this.props,
      inStock: this.props.inStock !== undefined ? this.props.inStock : computedInStock,
    };
  }
}
