import { Product } from "@/features/catalog/types";

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  notifyOnRestock: boolean;
  notifyOnPriceDrop: boolean;
  notes?: string;
  product: Product;
}
