import { apiClient } from "@/shared/lib/api-client";
import type { PartnerRfq, PartnerRfqItem } from "../types/partner.types";

export interface CreateRfqItemPayload {
  title: string;
  sku?: string;
  brand?: string;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

export interface CreateRfqPayload {
  projectTitle: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  urgency?: "normal" | "urgent" | "critical" | boolean;
  deadlineHours?: number;
  notes?: string;
  projectLocation?: string;
  attachedFileName?: string;
  items?: CreateRfqItemPayload[];
}

export interface QuoteRfqPayload {
  finalQuotedAmount: number;
  discountPercent?: number;
  validityDays?: number;
  notes?: string;
  status?: string;
}

interface BackendRfqItem {
  id: string;
  sku?: string;
  title: string;
  brand?: string;
  category?: string;
  requestedQty?: number;
  unitPrice?: number;
  totalPrice?: number;
  stockStatus?: string;
  specsSummary?: string;
}

interface BackendRfqDto {
  id: string;
  rfqNumber: string;
  userId?: string;
  projectTitle: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  status: string;
  statusLabel?: string;
  urgent?: boolean;
  deadlineHours?: number;
  discountPercent?: number;
  validityDays?: number;
  estimatedValue?: number;
  finalQuotedAmount?: number;
  notes?: string;
  projectLocation?: string;
  attachedFileName?: string;
  createdAt: string;
  updatedAt?: string;
  items?: BackendRfqItem[];
}

function formatPersianDate(dateVal?: string | Date): string {
  if (!dateVal) return "نامشخص";
  if (typeof dateVal === "string") {
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

function mapStatus(status: string): PartnerRfq["status"] {
  const s = (status || "").toLowerCase();
  if (s.includes("quote") || s === "quoted" || s === "quote_issued") return "quote_issued";
  if (s.includes("appr") || s === "approved") return "approved";
  if (s.includes("exp") || s === "expired") return "expired";
  if (s.includes("rej") || s === "rejected") return "rejected";
  return "pending_review";
}

function mapStatusLabel(status: string, backendLabel?: string): string {
  if (backendLabel && backendLabel.trim()) return backendLabel;
  const s = (status || "").toLowerCase();
  if (s.includes("quote") || s === "quoted") return "پیش‌فاکتور صادر شده";
  if (s.includes("appr") || s === "approved") return "تایید نهایی و فاکتور شده";
  if (s.includes("exp") || s === "expired") return "منقضی شده";
  if (s.includes("rej") || s === "rejected") return "رد شده";
  return "در انتظار بررسی و قیمت‌گذاری";
}

function mapDtoToPartnerRfq(dto: BackendRfqDto): PartnerRfq {
  const items: PartnerRfqItem[] = Array.isArray(dto.items)
    ? dto.items.map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand,
        category: it.category,
        requestedQty: it.requestedQty || 1,
        unitPrice: it.unitPrice || 0,
        totalPrice: it.totalPrice || (it.unitPrice || 0) * (it.requestedQty || 1),
        stockStatus: it.stockStatus,
        specsSummary: it.specsSummary,
      }))
    : [];

  // Only set totalEstimated if admin has explicitly quoted a final amount
  const totalEstimated = dto.finalQuotedAmount ? Number(dto.finalQuotedAmount) : 0;

  return {
    id: dto.id,
    rfqNumber: dto.rfqNumber,
    projectTitle: dto.projectTitle,
    clientName: dto.clientName,
    clientPhone: dto.clientPhone,
    clientEmail: dto.clientEmail,
    date: formatPersianDate(dto.createdAt),
    totalEstimated,
    finalQuotedAmount: dto.finalQuotedAmount ? Number(dto.finalQuotedAmount) : undefined,
    discountPercent: dto.discountPercent || 0,
    itemsCount: items.length,
    items,
    status: mapStatus(dto.status),
    statusLabel: mapStatusLabel(dto.status, dto.statusLabel),
    urgent: dto.urgent,
    deadlineHours: dto.deadlineHours || 24,
    validityDaysRemaining: dto.validityDays || 7,
    validityDays: dto.validityDays || 7,
    notes: dto.notes,
    projectLocation: dto.projectLocation,
    attachedFileName: dto.attachedFileName,
    assignedEngineer: "مهندس ارشد زیرساخت و شبکه",
  };
}

export const partnerRfqApi = {
  /**
   * دریافت لیست استعلام‌های قیمت همکار جاری
   */
  async getMyRfqs(): Promise<PartnerRfq[]> {
    try {
      const data = await apiClient.get<BackendRfqDto[]>("/rfq/my");
      return Array.isArray(data) ? data.map(mapDtoToPartnerRfq) : [];
    } catch (err) {
      console.error("[partnerRfqApi.getMyRfqs] Error fetching partner RFQs:", err);
      return [];
    }
  },

  /**
   * دریافت جزییات کامل یک استعلام قیمت با شناسه
   */
  async getRfqById(id: string): Promise<PartnerRfq | null> {
    try {
      const data = await apiClient.get<BackendRfqDto>(`/rfq/${id}`);
      return data ? mapDtoToPartnerRfq(data) : null;
    } catch (err) {
      console.error(`[partnerRfqApi.getRfqById] Error fetching RFQ ${id}:`, err);
      return null;
    }
  },

  /**
   * ثبت یک استعلام قیمت جدید (BOM / اقلام پروژه)
   */
  async createRfq(payload: CreateRfqPayload): Promise<PartnerRfq> {
    const data = await apiClient.post<BackendRfqDto>("/rfq", payload);
    return mapDtoToPartnerRfq(data);
  },

  /**
   * لغو یا حذف یک استعلام قیمت توسط همکار
   */
  async cancelRfq(id: string): Promise<boolean> {
    try {
      await apiClient.delete<{ success: boolean }>(`/rfq/${id}`);
      return true;
    } catch {
      // Fallback to status update
      try {
        await apiClient.patch(`/rfq/${id}/status`, { status: "cancelled" });
        return true;
      } catch (err) {
        console.error(`[partnerRfqApi.cancelRfq] Error cancelling RFQ ${id}:`, err);
        throw err;
      }
    }
  },

  /**
   * دریافت کلیه استعلام‌های سیستم (برای پنل ادمین)
   */
  async getAllRfqs(): Promise<PartnerRfq[]> {
    try {
      const data = await apiClient.get<BackendRfqDto[]>("/rfq");
      return Array.isArray(data) ? data.map(mapDtoToPartnerRfq) : [];
    } catch (err) {
      console.error("[partnerRfqApi.getAllRfqs] Error fetching all RFQs:", err);
      return [];
    }
  },

  /**
   * صدور پیش‌فاکتور و ثبت قیمت برای استعلام (پنل ادمین)
   */
  async quoteRfq(id: string, payload: QuoteRfqPayload): Promise<PartnerRfq> {
    const data = await apiClient.patch<BackendRfqDto>(`/rfq/${id}/quote`, payload);
    return mapDtoToPartnerRfq(data);
  },

  /**
   * تغییر وضعیت استعلام (پنل ادمین)
   */
  async updateStatus(id: string, status: string): Promise<PartnerRfq> {
    const data = await apiClient.patch<BackendRfqDto>(`/rfq/${id}/status`, { status });
    return mapDtoToPartnerRfq(data);
  },

  /**
   * تایید پیش‌فاکتور، ثبت پیش‌پرداخت و تبدیل به سفارش قطعی
   */
  async convertToOrder(
    id: string,
    payload?: {
      prepaymentPercent?: number;
      paymentMethod?: string;
      notes?: string;
    }
  ): Promise<any> {
    return apiClient.post(`/orders/convert-rfq/${id}`, payload || {});
  },
};
