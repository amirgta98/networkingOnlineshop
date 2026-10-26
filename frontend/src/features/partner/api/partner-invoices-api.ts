import { apiClient } from "@/shared/lib/api-client";
import type { PartnerInvoice, PartnerInvoiceItem } from "../types/partner.types";

export interface BackendInvoiceItemDto {
  id: string;
  productId?: string | null;
  title: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
}

export interface BackendInvoiceDto {
  id: string;
  invoiceNumber: string;
  trackingCode?: string;
  userId?: string;
  type: string;
  typeLabel?: string;
  status: string;
  statusLabel?: string;
  paymentStatus: string;
  paymentMethod?: string;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerPostalCode?: string;
  legalDetails?: {
    companyName?: string;
    registrationNumber?: string;
    nationalId?: string;
    economicCode?: string;
    postalCode?: string;
    phoneNumber?: string;
    address?: string;
  };
  taxSystemId?: string | null;
  officialApprovedAt?: string | null;
  officialApprovedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  items?: BackendInvoiceItemDto[];
  createdAt: string;
  updatedAt?: string;
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

function mapInvoiceStatus(
  status: string,
  paymentStatus?: string,
): PartnerInvoice["status"] {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return "APPROVED";
  if (s === "PENDING_APPROVAL") return "PENDING_APPROVAL";
  if (s === "REJECTED") return "REJECTED";
  if (s === "CANCELLED") return "CANCELLED";

  const p = (paymentStatus || "").toUpperCase();
  if (p === "PAID") return "settled_cash";
  return "pending_settlement";
}

function mapInvoiceStatusLabel(
  status: string,
  paymentStatus?: string,
  backendLabel?: string,
): string {
  if (backendLabel && backendLabel.trim()) return backendLabel;
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return "ثبت شده رسمی (مودیان)";
  if (s === "PENDING_APPROVAL") return "در انتظار ثبت سامانه مودیان";
  if (s === "REJECTED") return "رد شده حسابداری";
  if (s === "CANCELLED") return "لغو شده";

  const p = (paymentStatus || "").toUpperCase();
  if (p === "PAID") return "تسویه شده";
  return "در انتظار تسویه";
}

function mapDtoToPartnerInvoice(dto: BackendInvoiceDto): PartnerInvoice {
  const items: PartnerInvoiceItem[] = Array.isArray(dto.items)
    ? dto.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        title: it.title,
        sku: it.sku,
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || 0,
        totalPrice: it.totalPrice || 0,
        taxAmount: it.taxAmount || 0,
      }))
    : [];

  const projectTitle =
    items.length > 0
      ? items[0].title
      : dto.customerName
      ? `فاکتور رسمی ${dto.customerName}`
      : "فاکتور رسمی پروژه سازمانی";

  return {
    id: dto.id,
    invoiceNumber: dto.invoiceNumber,
    trackingCode: dto.trackingCode,
    taxUniqueId: dto.taxSystemId || "",
    taxSystemId: dto.taxSystemId,
    date: formatPersianDate(dto.createdAt),
    projectTitle,
    subtotal: dto.subtotal || 0,
    vatAmount: dto.taxAmount || 0,
    taxAmount: dto.taxAmount || 0,
    taxRatePercent: dto.taxRatePercent || 10,
    discountAmount: dto.discountAmount || 0,
    shippingCost: dto.shippingCost || 0,
    totalAmount: dto.totalAmount || 0,
    customerName: dto.customerName,
    customerPhone: dto.customerPhone,
    customerAddress: dto.customerAddress,
    customerPostalCode: dto.customerPostalCode,
    legalDetails: dto.legalDetails,
    items,
    status: mapInvoiceStatus(dto.status, dto.paymentStatus),
    statusLabel: mapInvoiceStatusLabel(dto.status, dto.paymentStatus, dto.statusLabel),
    paymentStatus: dto.paymentStatus,
    paymentMethod: dto.paymentMethod,
    adminNotes: dto.adminNotes || undefined,
    rejectionReason: dto.rejectionReason,
    officialApprovedAt: dto.officialApprovedAt,
    officialApprovedBy: dto.officialApprovedBy,
  };
}

export const partnerInvoicesApi = {
  /**
   * دریافت لیست فاکتورهای رسمی همکار جاری
   */
  async getMyInvoices(): Promise<PartnerInvoice[]> {
    try {
      const data = await apiClient.get<BackendInvoiceDto[]>("/invoices/my");
      return Array.isArray(data) ? data.map(mapDtoToPartnerInvoice) : [];
    } catch (err) {
      console.error("[partnerInvoicesApi.getMyInvoices] Error fetching invoices:", err);
      return [];
    }
  },

  /**
   * دریافت جزییات یک فاکتور با شناسه
   */
  async getInvoiceById(id: string): Promise<PartnerInvoice | null> {
    try {
      const data = await apiClient.get<BackendInvoiceDto>(`/invoices/${id}`);
      return data ? mapDtoToPartnerInvoice(data) : null;
    } catch (err) {
      console.error(`[partnerInvoicesApi.getInvoiceById] Error fetching invoice ${id}:`, err);
      return null;
    }
  },

  /**
   * دریافت کلیه فاکتورها (پنل ادمین) با امکان فیلتر
   */
  async getAllInvoices(params?: {
    type?: string;
    status?: string;
    search?: string;
  }): Promise<PartnerInvoice[]> {
    try {
      const query = new URLSearchParams();
      if (params?.type) query.set("type", params.type);
      if (params?.status) query.set("status", params.status);
      if (params?.search) query.set("search", params.search);

      const qs = query.toString() ? `?${query.toString()}` : "";
      const data = await apiClient.get<BackendInvoiceDto[]>(`/invoices${qs}`);
      return Array.isArray(data) ? data.map(mapDtoToPartnerInvoice) : [];
    } catch (err) {
      console.error("[partnerInvoicesApi.getAllInvoices] Error fetching invoices:", err);
      return [];
    }
  },

  /**
   * تایید رسمی فاکتور و صدور شناسه مالیاتی سامانه مودیان (پنل ادمین)
   */
  async approveOfficialInvoice(
    id: string,
    payload?: { taxSystemId?: string; approvedBy?: string },
  ): Promise<PartnerInvoice> {
    const data = await apiClient.patch<BackendInvoiceDto>(
      `/invoices/${id}/approve-official`,
      payload || {},
    );
    return mapDtoToPartnerInvoice(data);
  },

  /**
   * رد درخواست صدور فاکتور رسمی (پنل ادمین)
   */
  async rejectOfficialInvoice(
    id: string,
    payload: { reason: string; rejectedBy?: string },
  ): Promise<PartnerInvoice> {
    const data = await apiClient.patch<BackendInvoiceDto>(
      `/invoices/${id}/reject-official`,
      payload,
    );
    return mapDtoToPartnerInvoice(data);
  },
};
