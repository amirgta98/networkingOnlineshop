import { apiClient } from "@/shared/lib/api-client";
import { CartItem } from "../types";

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  orderId: string;
}

export async function syncCartWithBackend(items: CartItem[]): Promise<void> {
  try {
    await apiClient.post("/cart/sync", {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.warn("[Cart API] Failed to sync cart with backend:", error);
  }
}

export async function createCheckoutSession(items: CartItem[]): Promise<CheckoutSessionResponse> {
  try {
    return await apiClient.post<CheckoutSessionResponse>("/checkout/session", {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });
  } catch {
    // Fallback demo mock response
    return {
      checkoutUrl: "#demo-checkout",
      orderId: `ord-${Date.now()}`,
    };
  }
}
