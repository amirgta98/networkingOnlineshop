"use client";

import * as React from "react";
import { DashboardRfq } from "../types/rfq.types";
import { apiClient } from "@/shared/lib/api-client";

export function useDashboardRfq() {
  const [rfqs, setRfqs] = React.useState<DashboardRfq[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchRfqs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await apiClient.get<any[]>("/rfq/my", { timeout: 8000 });
      if (Array.isArray(raw)) {
        const mapped: DashboardRfq[] = raw.map((r) => {
          const rawStatus = (r.status || "").toLowerCase();
          const status =
            rawStatus === "quoted"
              ? "quote_ready"
              : rawStatus === "expired"
              ? "rejected"
              : "under_review";

          return {
            id: r.id,
            rfqNumber: r.rfqNumber || `RFQ-${r.id.slice(0, 6)}`,
            projectTitle: r.projectTitle || "استعلام قیمت اقلام",
            clientName: r.companyName || "کارفرما",
            projectLocation: r.projectLocation || "تهران",
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            status,
            statusLabel: r.statusLabel || "در حال بررسی اولیه توسط مهندسان فروش",
            urgency: r.urgent ? "urgent" : "normal",
            items: (r.items || []).map((it: any, idx: number) => ({
              id: it.id || `it-${idx}`,
              productName: it.title || "تجهیزات شبکه",
              brand: it.brand || "Cisco",
              quantity: it.requestedQty || 1,
              unit: "عدد",
              notes: it.specsSummary,
            })),
            notes: r.notes,
          };
        });
        setRfqs(mapped);
      }
    } catch (err) {
      console.warn("[useDashboardRfq] Backend fetch failed:", err);
      setRfqs([]);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void fetchRfqs();
  }, [fetchRfqs]);

  const submitRfq = async (data: {
    projectTitle: string;
    clientName: string;
    projectLocation: string;
    urgency: "normal" | "urgent" | "critical";
    items: { productName: string; brand: string; quantity: number; unit: string; notes?: string }[];
    attachedFileName?: string;
    notes?: string;
  }) => {
    try {
      const res = await apiClient.post<any>("/rfq", {
        projectTitle: data.projectTitle,
        clientName: data.clientName,
        projectLocation: data.projectLocation,
        urgency: data.urgency,
        items: data.items.map((it) => ({
          title: it.productName,
          brand: it.brand,
          quantity: it.quantity,
          notes: it.notes,
        })),
        notes: data.notes,
        attachedFileName: data.attachedFileName,
      });

      await fetchRfqs();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dashboard-stats-updated"));
      }
      return res;
    } catch (err) {
      console.error("[useDashboardRfq] submitRfq failed:", err);
      throw err;
    }
  };

  return {
    rfqs,
    isLoaded,
    isLoading,
    refreshRfqs: fetchRfqs,
    submitRfq,
  };
}
