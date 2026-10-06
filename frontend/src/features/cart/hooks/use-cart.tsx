"use client";

import * as React from "react";
import { Product } from "@/features/catalog/types";
import { CartItem, CartState, CartSummary, FlyingPacketInfo } from "../types";
import { syncCartWithBackend } from "../api/cart-api";
import { FlyingPacketOverlay } from "../components/flying-packet-overlay";

const CartContext = React.createContext<CartState | null>(null);

const STORAGE_KEY = "ecommerce_cart_items";

const EMPTY_ITEMS: CartItem[] = [];

let memoryItems: CartItem[] = EMPTY_ITEMS;
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function loadInitialItems(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY_ITEMS;
  } catch {
    return EMPTY_ITEMS;
  }
}

// Initial hydration in browser environment
if (typeof window !== "undefined") {
  memoryItems = loadInitialItems();
}

const cartStore = {
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(): CartItem[] {
    return memoryItems;
  },
  getServerSnapshot(): CartItem[] {
    return EMPTY_ITEMS;
  },
  setItems(newItems: CartItem[]) {
    memoryItems = newItems;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        syncCartWithBackend(newItems);
      } catch (err) {
        console.error("Failed to persist cart items", err);
      }
    }
    emitChange();
  },
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = React.useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isCartBumping, setIsCartBumping] = React.useState<boolean>(false);
  const [flyingPackets, setFlyingPackets] = React.useState<FlyingPacketInfo[]>([]);

  const triggerCartBump = React.useCallback(() => {
    setIsCartBumping(true);
    setTimeout(() => {
      setIsCartBumping(false);
    }, 600);
  }, []);

  const flyToCart = React.useCallback(
    (sourceElement: HTMLElement, product: Product): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined") {
          resolve();
          return;
        }

        const sourceRect = sourceElement.getBoundingClientRect();
        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;

        const isMobile = window.innerWidth < 768;
        const cartBadge = document.getElementById("header-cart-badge");
        let endX = window.innerWidth - 45;
        let endY = 35;

        if (isMobile) {
          // On mobile: Cart icon is hidden in top navbar per UX design.
          // Animation direction points downward to the bottom mobile bar/counter!
          const mobileTarget =
            document.getElementById("mobile-cart-action") ||
            document.getElementById("mobile-bottom-cart-tab") ||
            document.getElementById("mobile-app-bar");

          if (mobileTarget) {
            const targetRect = mobileTarget.getBoundingClientRect();
            endX = targetRect.left + targetRect.width / 2;
            endY = targetRect.top + targetRect.height / 2;
          } else {
            endX = window.innerWidth / 2;
            endY = window.innerHeight - 40;
          }
        } else if (cartBadge) {
          const targetRect = cartBadge.getBoundingClientRect();
          endX = targetRect.left + targetRect.width / 2;
          endY = targetRect.top + targetRect.height / 2;
        }

        const packetId = `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const packet: FlyingPacketInfo = {
          id: packetId,
          startX,
          startY,
          endX,
          endY,
          productImage: product.images[0],
          productName: product.name,
        };

        setFlyingPackets((prev) => [...prev, packet]);

        setTimeout(() => {
          setFlyingPackets((prev) => prev.filter((p) => p.id !== packetId));
          triggerCartBump();
          resolve();
        }, 720);
      });
    },
    [triggerCartBump]
  );

  const addItem = React.useCallback(
    (
      product: Product,
      quantity = 1,
      selectedOptions?: Record<string, import("../types").SelectedOptionDetail>,
      customUnitPrice?: number
    ) => {
      const current = cartStore.getSnapshot();
      const unitPrice = customUnitPrice ?? product.price;

      // Unique variant key based on selected options
      const optionsKey = selectedOptions
        ? Object.entries(selectedOptions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v.value}`)
            .join("|")
        : "";

      const existing = current.find((item) => {
        if (item.product.id !== product.id) return false;
        const itemOptionsKey = item.selectedOptions
          ? Object.entries(item.selectedOptions)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => `${k}:${v.value}`)
              .join("|")
          : "";
        return itemOptionsKey === optionsKey;
      });

      if (existing) {
        cartStore.setItems(
          current.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        const itemId = optionsKey
          ? `cart-${product.id}-${optionsKey.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}`
          : `cart-${product.id}-${Date.now()}`;

        cartStore.setItems([
          ...current,
          {
            id: itemId,
            product,
            quantity,
            selectedOptions,
            unitPrice,
          },
        ]);
      }
    },
    []
  );

  const removeItem = React.useCallback((itemId: string) => {
    const current = cartStore.getSnapshot();
    cartStore.setItems(current.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = React.useCallback(
    (itemId: string, quantity: number, customUnitPrice?: number) => {
      if (quantity <= 0) {
        removeItem(itemId);
        return;
      }
      const current = cartStore.getSnapshot();
      cartStore.setItems(
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity,
                ...(customUnitPrice !== undefined ? { unitPrice: customUnitPrice } : {}),
              }
            : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = React.useCallback(() => {
    cartStore.setItems(EMPTY_ITEMS);
  }, []);

  const toggleCart = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const summary = React.useMemo<CartSummary>(() => {
    const subtotal = items.reduce(
      (acc, item) => acc + (item.unitPrice ?? item.product.price) * item.quantity,
      0
    );
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const isToman = items.length === 0 || subtotal >= 1000;

    // Free shipping over 5 million Toman (matches top announcement bar), otherwise 50,000 Toman courier
    // In USD, free over $150, otherwise $15
    const shipping = isToman
      ? subtotal >= 5000000 || subtotal === 0
        ? 0
        : 50000
      : subtotal > 150 || subtotal === 0
      ? 0
      : 15;

    // In Iranian e-commerce retail, taxes are included in product shelf price
    const estimatedTax = isToman ? 0 : subtotal * 0.08;
    const total = subtotal + shipping + estimatedTax;

    return {
      subtotal,
      estimatedTax,
      shipping,
      total,
      itemCount,
    };
  }, [items]);

  const value: CartState = {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setOpen: setIsOpen,
    toggleCart,
    summary,
    isCartBumping,
    triggerCartBump,
    flyToCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <FlyingPacketOverlay packets={flyingPackets} />
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
