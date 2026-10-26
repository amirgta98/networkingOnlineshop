"use client";

import * as React from "react";
import { WishlistItem } from "../types/wishlist.types";
import { INITIAL_WISHLIST } from "../data/mock-wishlist";
import { wishlistApi } from "../api/wishlist-api";
import { useAuth } from "@/features/auth";
import { useCart } from "@/features/cart";
import { Product } from "@/features/catalog/types";

const STORAGE_KEY = "velox_dashboard_wishlist_v1";
const WISHLIST_EVENT = "velox:wishlist:updated";

export function useDashboardWishlist() {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { isAuthenticated, status } = useAuth();
  const { addItem, triggerCartBump } = useCart();

  // Helper to persist to localStorage & dispatch cross-component event
  const persistItems = React.useCallback((newItems: WishlistItem[], broadcast = true) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      if (broadcast && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: newItems }));
      }
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, []);

  // Fetch wishlist from backend or local cache
  const fetchWishlist = React.useCallback(async () => {
    // 1. Initial quick load from local storage for zero flash
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // 2. If authenticated, fetch source of truth from backend
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const remoteItems = await wishlistApi.getWishlist();
        if (Array.isArray(remoteItems)) {
          persistItems(remoteItems, false);
        }
      } catch (err) {
        console.warn("[Wishlist] Could not load from backend:", err);
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(true);
    }
  }, [isAuthenticated, persistItems]);

  // Initial load
  React.useEffect(() => {
    if (status !== "loading") {
      fetchWishlist();
    }
  }, [fetchWishlist, status]);

  // Listen to cross-component wishlist events
  React.useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<WishlistItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setItems(customEvent.detail);
      }
    };

    window.addEventListener(WISHLIST_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, handleUpdate);
    };
  }, []);

  const isFavorited = React.useCallback(
    (productIdOrSlug: string): boolean => {
      if (!productIdOrSlug) return false;
      return items.some(
        (it) =>
          it.productId === productIdOrSlug ||
          it.id === productIdOrSlug ||
          it.product?.id === productIdOrSlug ||
          it.product?.slug === productIdOrSlug
      );
    },
    [items]
  );

  const addToWishlist = React.useCallback(
    async (product: Product): Promise<WishlistItem> => {
      const existing = items.find(
        (it) => it.productId === product.id || it.product?.id === product.id || it.product?.slug === product.slug
      );
      if (existing) {
        return existing;
      }

      const tempId = `fav-${Date.now()}`;
      const newItem: WishlistItem = {
        id: tempId,
        productId: product.id,
        addedAt: new Date().toISOString(),
        notifyOnRestock: false,
        notifyOnPriceDrop: false,
        product,
      };

      const updated = [newItem, ...items];
      persistItems(updated);

      if (isAuthenticated) {
        try {
          const saved = await wishlistApi.addToWishlist(product.id || product.slug);
          if (saved) {
            const synced = updated.map((it) => (it.id === tempId ? saved : it));
            persistItems(synced);
            return saved;
          }
        } catch (err) {
          console.warn("[Wishlist] Backend add failed, retained local fallback:", err);
        }
      }

      return newItem;
    },
    [items, isAuthenticated, persistItems]
  );

  const removeItem = React.useCallback(
    async (idOrProductId: string) => {
      const target = items.find(
        (it) =>
          it.id === idOrProductId ||
          it.productId === idOrProductId ||
          it.product?.id === idOrProductId ||
          it.product?.slug === idOrProductId
      );

      const updated = items.filter(
        (it) =>
          it.id !== idOrProductId &&
          it.productId !== idOrProductId &&
          it.product?.id !== idOrProductId &&
          it.product?.slug !== idOrProductId
      );
      persistItems(updated);

      if (isAuthenticated && target) {
        try {
          await wishlistApi.removeFromWishlist(target.productId || target.id);
        } catch (err) {
          console.warn("[Wishlist] Backend delete failed:", err);
        }
      }
    },
    [items, isAuthenticated, persistItems]
  );

  const toggleWishlist = React.useCallback(
    async (product: Product): Promise<{ isFavorited: boolean; message: string }> => {
      const favorited = isFavorited(product.id) || isFavorited(product.slug);
      if (favorited) {
        await removeItem(product.id || product.slug);
        return { isFavorited: false, message: "از لیست علاقه‌مندی‌ها حذف شد." };
      } else {
        await addToWishlist(product);
        return { isFavorited: true, message: "به لیست علاقه‌مندی‌ها اضافه شد." };
      }
    },
    [isFavorited, removeItem, addToWishlist]
  );

  const toggleNotification = (
    id: string,
    type: "notifyOnRestock" | "notifyOnPriceDrop"
  ) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, [type]: !it[type] } : it
    );
    persistItems(updated);
  };

  const moveToCart = (item: WishlistItem) => {
    addItem(item.product, 1);
    triggerCartBump();
  };

  const moveAllAvailableToCart = () => {
    let count = 0;
    items.forEach((item) => {
      if (item.product.inStock) {
        addItem(item.product, 1);
        count++;
      }
    });
    if (count > 0) {
      triggerCartBump();
    }
    return count;
  };

  const clearAll = () => {
    persistItems([]);
  };

  return {
    items,
    isLoaded,
    isLoading,
    isFavorited,
    addToWishlist,
    removeItem,
    toggleWishlist,
    toggleNotification,
    moveToCart,
    moveAllAvailableToCart,
    clearAll,
    refetch: fetchWishlist,
  };
}
