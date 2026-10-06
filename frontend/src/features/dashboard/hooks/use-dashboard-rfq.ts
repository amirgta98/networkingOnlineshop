"use client";

import * as React from "react";
import { DashboardRfq } from "../types/rfq.types";
import { INITIAL_RFQS } from "../data/mock-rfq";

const STORAGE_KEY = "velox_dashboard_rfqs_v1";

export function useDashboardRfq() {
  const [rfqs, setRfqs] = React.useState<DashboardRfq[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRfqs(JSON.parse(stored));
      else {
        setRfqs(INITIAL_RFQS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RFQS));
      }
    } catch {
      setRfqs(INITIAL_RFQS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveRfqs = (updated: DashboardRfq[]) => {
    setRfqs(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save RFQs", e);
    }
  };

  const submitRfq = (data: {
    projectTitle: string;
    clientName: string;
    projectLocation: string;
    urgency: "normal" | "urgent" | "critical";
    items: { productName: string; brand: string; quantity: number; unit: string; notes?: string }[];
    attachedFileName?: string;
    notes?: string;
  }) => {
    const newRfq: DashboardRfq = {
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-1403-${Math.floor(100 + Math.random() * 900)}`,
      projectTitle: data.projectTitle,
      clientName: data.clientName,
      projectLocation: data.projectLocation,
      createdAt: "هم‌اکنون",
      status: "under_review",
      statusLabel: "در حال بررسی اولیه توسط مهندسان فروش",
      urgency: data.urgency,
      items: data.items.map((it, idx) => ({ ...it, id: `it-${Date.now()}-${idx}` })),
      attachedFileName: data.attachedFileName,
      notes: data.notes,
    };

    const updated = [newRfq, ...rfqs];
    saveRfqs(updated);
    return newRfq;
  };

  return {
    rfqs,
    isLoaded,
    submitRfq,
  };
}
