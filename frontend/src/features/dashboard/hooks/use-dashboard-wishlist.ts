"use client";

import * as React from "react";
import { WishlistItem } from "../types/wishlist.types";
import { INITIAL_WISHLIST } from "../data/mock-wishlist";
import { useCart } from "@/features/cart";

const STORAGE_KEY = "velox_dashboard_wishlist_v1";

export function useDashboardWishlist() {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { addItem, triggerCartBump } = useCart();

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(INITIAL_WISHLIST);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WISHLIST));
      }
    } catch {
      setItems(INITIAL_WISHLIST);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveItems = (newItems: WishlistItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  };

  const removeItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    saveItems(updated);
  };

  const toggleNotification = (
    id: string,
    type: "notifyOnRestock" | "notifyOnPriceDrop"
  ) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, [type]: !it[type] } : it
    );
    saveItems(updated);
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
    saveItems([]);
  };

  return {
    items,
    isLoaded,
    removeItem,
    toggleNotification,
    moveToCart,
    moveAllAvailableToCart,
    clearAll,
  };
}
