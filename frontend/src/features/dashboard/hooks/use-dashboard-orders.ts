"use client";

import * as React from "react";
import { DashboardOrder, OrderStatus } from "../types/orders.types";
import { INITIAL_ORDERS } from "../data/mock-orders";

const STORAGE_KEY = "velox_dashboard_orders_v1";

export function useDashboardOrders() {
  const [orders, setOrders] = React.useState<DashboardOrder[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders(INITIAL_ORDERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      }
    } catch {
      setOrders(INITIAL_ORDERS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveOrders = (newOrders: DashboardOrder[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
    } catch (e) {
      console.error("Failed to save orders to localStorage", e);
    }
  };

  const cancelOrder = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: "cancelled" as OrderStatus,
            statusLabel: "لغو شده توسط کاربر",
            trackingSteps: [
              ...o.trackingSteps,
              {
                title: "لغو سفارش",
                description: "سفارش توسط کاربر لغو گردید و وجه به کیف پول بازگشت داده شد.",
                timestamp: "اکنون",
                isCompleted: true,
                isCurrent: true,
              },
            ],
          }
        : o
    );
    saveOrders(updated);
  };

  return {
    orders,
    isLoaded,
    cancelOrder,
  };
}
