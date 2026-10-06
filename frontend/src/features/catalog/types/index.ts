export type ProductCategory =
  | "all"
  | "switches"
  | "routers"
  | "wireless"
  | "fiber"
  | "cables"
  | "passive"
  | "audio"
  | "wearables"
  | "workspace"
  | "accessories";

export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "bestselling";

export interface ProductOptionValue {
  label: string;
  value: string;
  priceModifier?: number;
  inStock?: boolean;
  colorHex?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
  defaultSelected?: string;
}

export interface TieredPricingRule {
  minQuantity: number;
  discountPercent: number;
  label?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  category: ProductCategory;
  brand?: string;
  inStock: boolean;
  featured: boolean;
  images: string[];
  badges?: string[];
  specs?: string[];
  options?: ProductOption[];
  specGroups?: { category: string; items: { label: string; value: string }[] }[];
  warranty?: string;
  sku?: string;
  tieredPricing?: TieredPricingRule[];
}

export interface ProductFilterParams {
  search?: string;
  category?: ProductCategory;
  brands?: string[];
  sort?: ProductSortOption;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  page?: number;
  limit?: number;
}
