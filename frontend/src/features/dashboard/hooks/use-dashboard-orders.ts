"use client";

import * as React from "react";
import { DashboardOrder, OrderCounts, OrderStatus, TrackingStep } from "../types/orders.types";
import { apiClient } from "@/shared/lib/api-client";

export function calculateOrderCounts(ordersList: DashboardOrder[]): OrderCounts {
  return {
    all: ordersList.length,
    processing: ordersList.filter(
      (o) => o.status === "processing" || o.status === "pending_payment" || o.status === "shipped"
    ).length,
    delivered: ordersList.filter((o) => o.status === "delivered").length,
    cancelled: ordersList.filter((o) => o.status === "cancelled" || o.status === "returned").length,
  };
}

export function useDashboardOrders() {
  const [orders, setOrders] = React.useState<DashboardOrder[]>([]);
  const [counts, setCounts] = React.useState<OrderCounts>({
    all: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [rawOrders, backendCounts] = await Promise.allSettled([
        apiClient.get<any[]>("/orders/my"),
        apiClient.get<OrderCounts>("/orders/my/counts"),
      ]);

      let mapped: DashboardOrder[] = [];
      if (rawOrders.status === "fulfilled" && Array.isArray(rawOrders.value)) {
        mapped = rawOrders.value.map((o) => {
          const statusMap: Record<string, OrderStatus> = {
            pending_financial: "pending_payment",
            processing_warehouse: "processing",
            shipping: "shipped",
            delivered: "delivered",
            cancelled: "cancelled",
          };

          const trackingSteps: TrackingStep[] = [
            {
              title: "ثبت سفارش",
              description: "سفارش شما در سامانه ققنوس با موفقیت ثبت شد.",
              timestamp: o.createdAt,
              isCompleted: true,
              isCurrent: o.status === "pending_financial",
            },
            {
              title: "تایید مالی و حسابداری",
              description: o.isPaymentVerified
                ? "واریز فیش / پرداخت تایید گردید."
                : "در انتظار بررسی واریزی توسط واحد مالی",
              isCompleted: o.status !== "pending_financial" && o.status !== "cancelled",
              isCurrent: o.status === "pending_financial",
            },
            {
              title: "انبار و بسته‌بندی",
              description: "اقلام از انبار خارج و در کارتن ضدضربه بسته‌بندی شدند.",
              isCompleted: ["processing_warehouse", "shipping", "delivered"].includes(o.status),
              isCurrent: o.status === "processing_warehouse",
            },
            {
              title: "تحویل به ناوگان حمل",
              description: o.carrierName ? `تحویل به ${o.carrierName} جهت ارسال` : "در صف تخصیص باربری",
              isCompleted: ["shipping", "delivered"].includes(o.status),
              isCurrent: o.status === "shipping",
            },
            {
              title: "تحویل موفق",
              description: "مرسوله تحویل گیرنده گردید.",
              isCompleted: o.status === "delivered",
              isCurrent: o.status === "delivered",
            },
          ];

          return {
            id: o.id,
            orderNumber: o.orderNumber,
            trackingCode: o.trackingCode,
            courierName: o.carrierName || o.carrier || "پیک اختصاصی ققنوس",
            createdAt: o.createdAt,
            status: statusMap[o.status] || "processing",
            statusLabel: o.statusLabel,
            items: (o.items || []).map((it: any) => {
              let img = it.imageUrl || it.image || "";
              if (img === "/assets/cisco-switch.webp" || img.startsWith("/assets/")) {
                img = "";
              }
              return {
                id: it.id,
                productId: it.productId || it.sku,
                title: it.title,
                model: it.model || it.sku,
                brand: it.brand || "Cisco",
                imageUrl: img,
                unitPrice: it.unitPrice,
                quantity: it.quantity,
                warranty: it.warranty || "گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس",
              };
            }),
            totalAmount: o.totalAmount,
            shippingCost: o.shippingCost || 0,
            discountAmount: o.discountAmount || 0,
            payableAmount: o.payableAmount,
            paymentMethodTitle:
              o.paymentMethod === "online_gateway"
                ? "درگاه پرداخت اینترنتی شاپرک"
                : o.paymentMethod === "bank_transfer"
                ? "حواله پایا / ساتنا"
                : "اعتبار سازمانی",
            shippingAddress: {
              title: "نشانی تحویل",
              recipientName: o.shippingAddress?.recipientName || o.customerName,
              phoneNumber: o.shippingAddress?.recipientPhone || o.phoneNumber,
              fullAddress: o.shippingAddress?.fullAddress || "",
              postalCode: o.shippingAddress?.postalCode || "",
            },
            trackingSteps,
          };
        });

        setOrders(mapped);
      } else {
        setOrders([]);
      }

      if (
        backendCounts.status === "fulfilled" &&
        backendCounts.value &&
        typeof backendCounts.value.all === "number"
      ) {
        setCounts(backendCounts.value);
      } else {
        setCounts(calculateOrderCounts(mapped));
      }
    } catch (err) {
      console.warn("[Orders Hook] Backend orders fetch failed:", err);
      setOrders([]);
      setCounts({ all: 0, processing: 0, delivered: 0, cancelled: 0 });
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    // Purge any stale localStorage caches with dead legacy assets
    try {
      localStorage.removeItem("velox_dashboard_orders_v1");
      localStorage.removeItem("velox_dashboard_orders_v2");
    } catch {
      // ignore
    }
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (orderId: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, {
        status: "CANCELLED",
      });
      await fetchOrders();
    } catch (e) {
      console.error("Failed to cancel order on backend", e);
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "cancelled" as OrderStatus,
                statusLabel: "لغو شده توسط کاربر",
              }
            : o
        );
        setCounts(calculateOrderCounts(next));
        return next;
      });
    }
  };

  return {
    orders,
    counts,
    isLoaded,
    isLoading,
    refreshOrders: fetchOrders,
    cancelOrder,
  };
}
