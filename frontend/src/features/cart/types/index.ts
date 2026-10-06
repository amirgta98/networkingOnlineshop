import { Product } from "@/features/catalog/types";

export interface SelectedOptionDetail {
  optionName: string;
  valueLabel: string;
  value: string;
  priceModifier?: number;
}

export interface CartItem {
  id: string; // unique item id in cart
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, SelectedOptionDetail>;
  unitPrice?: number;
}

export interface CartSummary {
  subtotal: number;
  estimatedTax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface FlyingPacketInfo {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  productImage?: string;
  productName?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, SelectedOptionDetail>,
    unitPrice?: number
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number, customUnitPrice?: number) => void;
  clearCart: () => void;
  setOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  summary: CartSummary;
  isCartBumping: boolean;
  triggerCartBump: () => void;
  flyToCart: (sourceElement: HTMLElement, product: Product) => Promise<void>;
}
