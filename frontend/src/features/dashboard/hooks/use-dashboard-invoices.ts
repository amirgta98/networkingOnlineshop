"use client";

import * as React from "react";
import { DashboardInvoice } from "../types/invoices.types";
import { INITIAL_INVOICES } from "../data/mock-invoices";

const STORAGE_KEY = "velox_dashboard_invoices_v1";

export function useDashboardInvoices() {
  const [invoices, setInvoices] = React.useState<DashboardInvoice[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setInvoices(JSON.parse(stored));
      } else {
        setInvoices(INITIAL_INVOICES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVOICES));
      }
    } catch {
      setInvoices(INITIAL_INVOICES);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveInvoices = (newInvoices: DashboardInvoice[]) => {
    setInvoices(newInvoices);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newInvoices));
    } catch (e) {
      console.error("Failed to save invoices to localStorage", e);
    }
  };

  const markAsPaid = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId
        ? {
            ...inv,
            status: "paid" as const,
            statusLabel: "تسویه شده",
            paymentTrackingCode: `TRK-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`,
          }
        : inv
    );
    saveInvoices(updated);
  };

  return {
    invoices,
    isLoaded,
    markAsPaid,
  };
}
