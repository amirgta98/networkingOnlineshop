export interface ProductFeatureInput {
  id?: string;
  title: string;
  description: string;
  iconUrl?: string;
  iconName?: string;
  sortOrder?: number;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  minStockAlert?: number;
  reservedStock?: number;
  warehouseLocation?: string;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  featured?: boolean;
  isSpecialOffer?: boolean;
  rating?: number;
  reviewCount?: number;
  discountPercent?: number;
  images: string[];
  warranty?: string;
  badges?: string[];
  specs?: string[];
  features?: ProductFeatureInput[];
  relatedProductIds?: string[];
  shortDescription?: string;
  fullDescription?: string;
}
