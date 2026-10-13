export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  category: "switches" | "routers" | "wireless" | "fiber" | "cables" | "passive" | "audio" | "wearables" | "workspace" | "accessories";
  brand?: string;
  inStock: boolean;
  featured: boolean;
  images: string[];
  badges?: string[];
  specs?: string[];
  options?: import("@/features/catalog/types").ProductOption[];
  specGroups?: { category: string; items: { label: string; value: string }[] }[];
  warranty?: string;
  sku?: string;
  tieredPricing?: import("@/features/catalog/types").TieredPricingRule[];
}

/**
 * Mock products list is empty. All products must be fetched from the backend API.
 */
export const MOCK_PRODUCTS: MockProduct[] = [];
