"use client";

import * as React from "react";
import { DashboardInvoice, InvoiceStatus, InvoiceType } from "../types/invoices.types";
import { VELOX_SELLER_INFO } from "../data/mock-invoices";
import { apiClient } from "@/shared/lib/api-client";

export function useDashboardInvoices() {
  const [invoices, setInvoices] = React.useState<DashboardInvoice[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchInvoices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await apiClient.get<any[]>("/invoices/my", { timeout: 8000 });
      if (Array.isArray(raw)) {
        const mapped: DashboardInvoice[] = raw.map((inv) => {
          const rawStatus = (inv.status || "").toUpperCase();
          const status: InvoiceStatus =
            rawStatus === "APPROVED" || rawStatus === "ISSUED"
              ? "paid"
              : rawStatus === "CANCELLED" || rawStatus === "REJECTED"
              ? "cancelled"
              : "unpaid";

          const invType: InvoiceType =
            inv.type === "OFFICIAL" ? "official_legal" : "personal_standard";

          return {
            id: inv.id,
            invoiceNumber: inv.invoiceNumber || `INV-${inv.id.slice(0, 6)}`,
            moaddianTaxId: inv.legalDetails?.economicCode || `TAX-${inv.id.slice(0, 8).toUpperCase()}`,
            orderId: inv.orderId || inv.id,
            orderNumber: inv.orderNumber || inv.invoiceNumber,
            createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
            status,
            statusLabel: inv.statusLabel || (status === "paid" ? "تسویه شده" : "در انتظار تسویه"),
            type: invType,
            typeLabel: invType === "official_legal" ? "فاکتور رسمی حقوقی" : "صورتحساب استاندارد",
            sellerInfo: {
              name: VELOX_SELLER_INFO.name,
              nationalIdOrEconomicCode: VELOX_SELLER_INFO.nationalIdOrEconomicCode,
              registrationNumber: VELOX_SELLER_INFO.registrationNumber,
              phone: VELOX_SELLER_INFO.phone,
              address: VELOX_SELLER_INFO.address,
              postalCode: VELOX_SELLER_INFO.postalCode,
            },
            buyerInfo: {
              name: inv.customerName || "کاربر سامانه ققنوس",
              nationalIdOrEconomicCode: inv.legalDetails?.economicCode || inv.legalDetails?.nationalId || "ثبت نشده",
              phone: inv.customerPhone || "ثبت نشده",
              address: inv.customerAddress || "ثبت نشده",
              postalCode: inv.customerPostalCode || "ثبت نشده",
            },
            items: (inv.items || []).map((it: any, idx: number) => ({
              id: it.id || `item-${idx}`,
              rowNumber: idx + 1,
              productCode: it.productId || `SKU-${idx + 1}`,
              description: it.title || "تجهیزات شبکه",
              quantity: it.quantity || 1,
              unit: "عدد",
              unitPrice: Number(it.unitPrice || 0),
              discount: Number(it.discountAmount || 0),
              netPrice: Number(it.totalPrice || it.unitPrice || 0),
              taxRate: 0.1,
              taxAmount: Math.round(Number(it.totalPrice || 0) * 0.1),
              totalWithTax: Math.round(Number(it.totalPrice || 0) * 1.1),
            })),
            subtotal: Number(inv.subtotal || inv.totalPayable || 0),
            totalDiscount: Number(inv.discountAmount || 0),
            totalTax: Number(inv.vatTaxAmount || 0),
            payableTotal: Number(inv.totalPayable || inv.subtotal || 0),
            paymentMethodTitle: inv.paymentMethod === "online_gateway" ? "درگاه پرداخت آنلاین شاپرک" : "حواله پایا / کیف پول",
          };
        });
        setInvoices(mapped);
        return;
      }
    } catch (err) {
      console.warn("[useDashboardInvoices] Backend fetch failed:", err);
      setInvoices([]);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const markAsPaid = async (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: "paid" as const,
              statusLabel: "تسویه شده",
            }
          : inv
      )
    );
  };

  return {
    invoices,
    isLoaded,
    isLoading,
    refreshInvoices: fetchInvoices,
    markAsPaid,
  };
}
