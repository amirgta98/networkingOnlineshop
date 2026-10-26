import { apiClient, ApiError } from "@/shared/lib/api-client";
import { normalizeProduct } from "@/features/catalog";
import { WishlistItem } from "../types/wishlist.types";

export interface BackendFavoriteDto {
  id: string;
  productId: string;
  title: string;
  name?: string;
  slug: string;
  sku?: string;
  brand?: string;
  category?: string;
  basePrice: number;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  ratingAvg?: number;
  rating?: number;
  inStock: boolean;
  imageUrl?: string;
  images?: string[];
  addedAt: string;
  notifyOnRestock?: boolean;
  notifyOnPriceDrop?: boolean;
  notes?: string;
  product?: any;
}

export function mapBackendFavoriteToWishlistItem(dto: BackendFavoriteDto): WishlistItem {
  const rawProduct = dto.product || {
    id: dto.productId,
    name: dto.name || dto.title,
    slug: dto.slug,
    sku: dto.sku,
    brand: dto.brand,
    category: dto.category,
    price: dto.price ?? dto.basePrice,
    originalPrice: dto.originalPrice,
    discountPercent: dto.discountPercent,
    rating: dto.rating ?? dto.ratingAvg ?? 5,
    inStock: dto.inStock,
    images: dto.images && dto.images.length > 0 ? dto.images : (dto.imageUrl ? [dto.imageUrl] : []),
  };

  return {
    id: dto.id || dto.productId,
    productId: dto.productId,
    addedAt: dto.addedAt || new Date().toISOString(),
    notifyOnRestock: Boolean(dto.notifyOnRestock),
    notifyOnPriceDrop: Boolean(dto.notifyOnPriceDrop),
    notes: dto.notes,
    product: normalizeProduct(rawProduct),
  };
}

export const wishlistApi = {
  /**
   * Get all favorites for the authenticated user
   */
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.get<BackendFavoriteDto[]>("/favorites");
      if (Array.isArray(response)) {
        return response.map(mapBackendFavoriteToWishlistItem);
      }
      return [];
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        return [];
      }
      // Fallback try /users/me/favorites
      try {
        const fallback = await apiClient.get<BackendFavoriteDto[]>("/users/me/favorites");
        if (Array.isArray(fallback)) {
          return fallback.map(mapBackendFavoriteToWishlistItem);
        }
      } catch {
        // ignore
      }
      console.warn("[Wishlist API] Failed to fetch wishlist:", err);
      return [];
    }
  },

  /**
   * Add a product to favorites
   */
  async addToWishlist(productId: string): Promise<WishlistItem | null> {
    try {
      const response = await apiClient.post<BackendFavoriteDto>(`/favorites/${productId}`);
      if (response && response.productId) {
        return mapBackendFavoriteToWishlistItem(response);
      }
      return null;
    } catch (err: unknown) {
      console.warn("[Wishlist API] Failed to add to wishlist:", err);
      throw err;
    }
  },

  /**
   * Remove a product or favorite record from favorites
   */
  async removeFromWishlist(productIdOrId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/favorites/${productIdOrId}`);
      return true;
    } catch (err: unknown) {
      console.warn("[Wishlist API] Failed to remove from wishlist:", err);
      throw err;
    }
  },

  /**
   * Toggle a product favorite status (add if missing, remove if present)
   */
  async toggleWishlist(productId: string): Promise<{ isFavorited: boolean; item?: WishlistItem; message: string }> {
    try {
      const response = await apiClient.post<{
        isFavorited: boolean;
        message: string;
        item?: BackendFavoriteDto;
      }>(`/favorites/toggle/${productId}`);

      return {
        isFavorited: response.isFavorited,
        message: response.message,
        item: response.item ? mapBackendFavoriteToWishlistItem(response.item) : undefined,
      };
    } catch (err: unknown) {
      console.warn("[Wishlist API] Failed to toggle wishlist:", err);
      throw err;
    }
  },

  /**
   * Check if a product is favorited by the current user
   */
  async checkWishlistStatus(productId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ isFavorited: boolean }>(`/favorites/check/${productId}`);
      return Boolean(response?.isFavorited);
    } catch {
      return false;
    }
  },
};
