"use client";

import * as React from "react";
import { SerialVerificationResult, RmaRequest } from "../types/warranty.types";
import { apiClient } from "@/shared/lib/api-client";

export function useDashboardWarranty() {
  const [rmaRequests, setRmaRequests] = React.useState<RmaRequest[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchRmaRequests = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await apiClient.get<any[]>("/warranty/my", { timeout: 8000 });
      if (Array.isArray(raw)) {
        const mapped: RmaRequest[] = raw.map((r) => {
          const createdDate = r.createdAt
            ? new Date(r.createdAt).toLocaleDateString("fa-IR")
            : "هم‌اکنون";

          return {
            id: r.id,
            rmaNumber: `RMA-${r.id.slice(0, 6).toUpperCase()}`,
            serialNumber: r.serialNumber,
            productName: r.productName,
            faultDescription: r.notes || "درخواست بررسی و تعویض درجا گارانتی طلایی",
            deliveryMethod: "courier",
            createdAt: createdDate,
            currentStage: "received",
            currentStageLabel: r.statusLabel || "دریافت در آزمایشگاه گارانتی ققنوس",
            timeline: [
              {
                stage: "received",
                title: "ثبت درخواست RMA",
                description: "درخواست عودت جهت بررسی در لابراتوار ثبت شد.",
                timestamp: createdDate,
                isCompleted: true,
                isCurrent: true,
              },
              {
                stage: "lab_testing",
                title: "تست سخت‌افزاری در لابراتوار",
                description: "بررسی پورت‌ها، منبع تغذیه و لاجیک بورد.",
                isCompleted: false,
              },
              {
                stage: "replacement_approved",
                title: "تصمیم‌گیری خدمات (تعمیر یا تعویض نو)",
                description: "اعمال گارانتی طلایی تعویض درجا.",
                isCompleted: false,
              },
              {
                stage: "dispatched",
                title: "تحویل به مشتری",
                description: "ارسال قطعه نو با گواهی جدید.",
                isCompleted: false,
              },
            ],
          };
        });
        setRmaRequests(mapped);
      }
    } catch (err) {
      console.warn("[useDashboardWarranty] Backend fetch failed:", err);
      setRmaRequests([]);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void fetchRmaRequests();
  }, [fetchRmaRequests]);

  const verifySerialNumber = async (serial: string): Promise<SerialVerificationResult | null> => {
    const cleaned = serial.trim().toUpperCase();
    if (!cleaned) return null;

    try {
      const res = await apiClient.get<any>(`/warranty/verify/${encodeURIComponent(cleaned)}`);
      if (res && res.isAuthentic) {
        return {
          serialNumber: res.serialNumber,
          productName: res.productName,
          model: res.model || res.serialNumber,
          brand: res.brand || "Cisco",
          warrantyType: res.warrantyType || "گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس",
          status: res.status === "active" ? "active" : res.status === "expiring_soon" ? "expiring_soon" : "expired",
          statusLabel: res.statusLabel,
          startDate: res.startDate || "۱۴۰۲/۰۱/۰۱",
          endDate: res.endDate || "۱۴۰۵/۰۱/۰۱",
          daysRemaining: res.daysRemaining ?? 365,
          isAuthentic: true,
          hologramCode: res.hologramCode || "HLG-GOLD-9988",
        };
      }
      return null;
    } catch (err) {
      console.warn("[useDashboardWarranty] verifySerialNumber error:", err);
      return null;
    }
  };

  const submitRma = async (data: {
    serialNumber: string;
    productName: string;
    faultDescription: string;
    deliveryMethod: "courier" | "tipax" | "in_person";
  }) => {
    try {
      await apiClient.post("/warranty/rma", {
        serialNumber: data.serialNumber,
        productName: data.productName,
        faultDescription: data.faultDescription,
        deliveryMethod: data.deliveryMethod,
      });
      await fetchRmaRequests();
    } catch (err) {
      console.error("[useDashboardWarranty] submitRma failed:", err);
      throw err;
    }
  };

  return {
    rmaRequests,
    isLoaded,
    isLoading,
    refreshRmaRequests: fetchRmaRequests,
    verifySerialNumber,
    submitRma,
  };
}
