import { apiClient } from "@/shared/lib/api-client";
import type { PartnerOrder, PartnerOrderItem } from "../types/partner.types";

function formatPersianDate(dateVal?: string | Date): string {
  if (!dateVal) return "نامشخص";
  if (typeof dateVal === "string") {
    // If already in Persian digits or slash format from backend AdminOrderResponseDto
    if (dateVal.includes("/") || dateVal.includes("،") || dateVal.includes("-")) {
      return dateVal;
    }
  }
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  } catch {
    // ignore
  }
  return String(dateVal);
}

function mapStatusLabel(rawStatus?: string): string {
  const s = (rawStatus || "").toLowerCase();
  switch (s) {
    case "pending_financial":
      return "در انتظار تایید مالی";
    case "processing_warehouse":
    case "warehouse_allocated":
      return "بسته‌بندی و تخصیص انبار";
    case "shipping":
    case "shipped":
      return "تحویل به ناوگان حمل";
    case "delivered":
      return "تحویل موفق در مقصد";
    case "cancelled":
      return "لغو شده";
    default:
      return "در حال پردازش";
  }
}

function mapPaymentLabel(method?: string): string {
  switch (method) {
    case "credit":
    case "credit_cheque":
      return "خط اعتباری سازمانی (چک صیادی)";
    case "bank_transfer":
      return "حواله پایا / ساتنا سازمانی";
    case "wallet":
      return "کیف پول تجاری ققنوس";
    case "online_gateway":
      return "درگاه پرداخت الکترونیک شاپرک";
    default:
      return "تسویه فاکتور رسمی";
  }
}

function mapRawToPartnerOrder(o: any): PartnerOrder {
  const rawStatus = (o.status || "").toLowerCase();
  const normalizedStatus =
    rawStatus === "pending_financial"
      ? "pending_financial"
      : rawStatus === "processing_warehouse" || rawStatus === "warehouse_allocated"
      ? "processing_warehouse"
      : rawStatus === "shipping" || rawStatus === "shipped"
      ? "shipping"
      : rawStatus === "delivered"
      ? "delivered"
      : rawStatus === "cancelled"
      ? "cancelled"
      : "processing";

  const items: PartnerOrderItem[] = Array.isArray(o.items)
    ? o.items.map((it: any) => {
        let img = it.imageUrl || it.image || "";
        if (img === "/assets/cisco-switch.webp" || img.startsWith("/assets/")) {
          img = "";
        }
        return {
          id: it.id || it.sku || `item-${Math.random()}`,
          productId: it.productId,
          sku: it.sku || "PROD-SKU",
          title: it.title || "تجهیزات سخت‌افزاری شبکه",
          brand: it.brand || "ققنوس آکادمی",
          model: it.model || it.sku || "",
          imageUrl: img,
          unitPrice: Number(it.unitPrice || 0),
          quantity: Number(it.quantity || 1),
          totalPrice: Number(it.totalPrice || it.unitPrice * (it.quantity || 1) || 0),
          warranty: it.warranty || "گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس",
          serialNumbers: Array.isArray(it.serialNumbers) ? it.serialNumbers : [],
        };
      })
    : [];

  const addr = o.shippingAddress || {};
  const fullAddress =
    addr.fullAddress ||
    addr.address ||
    (addr.province && addr.city ? `${addr.province}، ${addr.city}` : "سایت مرکزی کارفرما");

  return {
    id: o.id,
    orderNumber: o.orderNumber || o.trackingCode || `ORD-${o.id?.slice(0, 6)}`,
    trackingCode: o.trackingCode,
    projectTitle: o.companyName || o.customerName || "پروژه تأمین تجهیزات سازمانی",
    companyName: o.companyName,
    customerName: o.customerName,
    phoneNumber: o.phoneNumber,
    date: formatPersianDate(o.createdAt),
    totalAmount: Number(o.totalAmount || o.payableAmount || 0),
    discountAmount: Number(o.discountAmount || 0),
    vatTaxAmount: Number(o.vatTaxAmount || 0),
    payableAmount: Number(o.payableAmount || o.totalAmount || 0),
    itemsCount: items.length || Number(o.itemsCount || 1),
    items,
    status: normalizedStatus as PartnerOrder["status"],
    statusLabel: o.statusLabel || mapStatusLabel(o.status),
    paymentMethod: o.paymentMethod || "bank_transfer",
    paymentLabel: mapPaymentLabel(o.paymentMethod),
    isPaymentVerified: Boolean(o.isPaymentVerified),
    siteName: fullAddress,
    shippingAddress: {
      city: addr.city || "تهران",
      province: addr.province || "تهران",
      fullAddress: fullAddress,
      postalCode: addr.postalCode || "نامشخص",
      recipientName: addr.recipientName || o.customerName || "مسئول دریافت پروژه",
      recipientPhone: addr.recipientPhone || o.phoneNumber || "۰۹۱۲۰۰۰۰۰۰۰",
    },
    waybillNumber: o.carrierTrackingCode || o.trackingCode,
    carrier: o.carrier,
    carrierName: o.carrierName || o.carrier || "پیک اختصاصی ققنوس",
    adminNotes: o.adminNotes,
  };
}

export const partnerOrdersApi = {
  /**
   * Fetch orders for partner portal with status/search filtering
   */
  async getPartnerOrders(params?: { status?: string; search?: string }): Promise<PartnerOrder[]> {
    try {
      // 1. Try dedicated partner orders endpoint
      const raw = await apiClient.get<any[]>("/orders/partner", {
        params: {
          status: params?.status && params.status !== "all" ? params.status : undefined,
          search: params?.search?.trim() || undefined,
        },
        timeout: 10000,
      });

      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(mapRawToPartnerOrder);
      }

      // 2. Fallback to /orders/my
      const myOrders = await apiClient.get<any[]>("/orders/my", { timeout: 8000 });
      if (Array.isArray(myOrders) && myOrders.length > 0) {
        return myOrders.map(mapRawToPartnerOrder);
      }

      return Array.isArray(raw) ? raw.map(mapRawToPartnerOrder) : [];
    } catch (err) {
      console.warn("[partnerOrdersApi.getPartnerOrders] Failed with primary endpoint, attempting fallback:", err);
      try {
        const fallback = await apiClient.get<any[]>("/orders/my", { timeout: 8000 });
        if (Array.isArray(fallback)) {
          return fallback.map(mapRawToPartnerOrder);
        }
      } catch (fbErr) {
        console.warn("[partnerOrdersApi.getPartnerOrders] Fallback also failed:", fbErr);
      }
      throw err;
    }
  },

  /**
   * Get single order details by id or order number
   */
  async getOrderDetail(idOrNumber: string): Promise<PartnerOrder> {
    const raw = await apiClient.get<any>(`/orders/${idOrNumber}`, { timeout: 8000 });
    return mapRawToPartnerOrder(raw);
  },
};
