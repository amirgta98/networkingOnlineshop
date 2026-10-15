import { apiClient } from "@/shared/lib/api-client";
import type { AdminInvoice, AdminInvoiceLineItem } from "../types/admin-invoices.types";

export interface BackendInvoiceDto {
  id: string;
  invoiceNumber: string;
  trackingCode: string;
  userId?: string | null;
  type: "UNOFFICIAL" | "OFFICIAL";
  typeLabel: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ISSUED" | "CANCELLED";
  statusLabel: string;
  paymentStatus: "UNPAID" | "PAID";
  paymentMethod?: string | null;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerPostalCode?: string | null;
  legalDetails?: {
    companyName: string;
    registrationNumber: string;
    nationalId: string;
    economicCode: string;
    postalCode: string;
    phoneNumber: string;
    address: string;
  } | null;
  taxSystemId?: string | null;
  officialApprovedAt?: string | null;
  officialApprovedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  items: {
    id: string;
    productId?: string | null;
    title: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxAmount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function mapBackendInvoiceToAdmin(dto: BackendInvoiceDto): AdminInvoice {
  const isOfficial = dto.type === "OFFICIAL";
  const legal = dto.legalDetails;

  let taxSyncStatus: AdminInvoice["taxSyncStatus"] = "pending";
  if (dto.status === "APPROVED" || dto.taxSystemId) {
    taxSyncStatus = "synced";
  } else if (dto.status === "REJECTED") {
    taxSyncStatus = "rejected";
  }

  const items: AdminInvoiceLineItem[] = (dto.items || []).map((it) => ({
    id: it.id,
    sku: it.sku || "PROD-GEN",
    title: it.title,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    totalPrice: it.totalPrice,
    taxRatePercent: dto.taxRatePercent || (isOfficial ? 10 : 0),
    taxAmount: it.taxAmount || 0,
  }));

  const createdDate = new Date(dto.createdAt);
  const formattedDate = createdDate.toLocaleDateString("fa-IR");

  return {
    id: dto.id,
    invoiceNumber: dto.invoiceNumber,
    taxSystemId: dto.taxSystemId || undefined,
    orderId: dto.id,
    orderTrackingCode: dto.trackingCode,
    invoiceType: isOfficial ? "type_1" : "type_2",
    rawType: dto.type,
    clientName: dto.customerName || (legal?.companyName ?? "خریدار فروشگاه"),
    companyName: legal?.companyName,
    registrationNumber: legal?.registrationNumber,
    nationalId: legal?.nationalId || "۱۰۱۰۳۵۶۷۸۹۰",
    economicCode: legal?.economicCode,
    postalCode: legal?.postalCode || dto.customerPostalCode || undefined,
    phone: legal?.phoneNumber || dto.customerPhone || undefined,
    address: legal?.address || dto.customerAddress || undefined,
    issueDate: formattedDate,
    dueDate: formattedDate,
    subtotal: dto.subtotal,
    vatAmount: dto.taxAmount,
    totalAmount: dto.totalAmount,
    paymentStatus: dto.paymentStatus === "PAID" ? "paid" : "unpaid",
    paymentMethod: dto.paymentMethod || "online_gateway",
    taxSyncStatus,
    taxSyncedAt: dto.officialApprovedAt ? new Date(dto.officialApprovedAt).toLocaleDateString("fa-IR") : undefined,
    rejectionReason: dto.rejectionReason || undefined,
    items,
    notes: dto.adminNotes || undefined,
  };
}

export const adminInvoicesApi = {
  async getInvoices(params?: { type?: string; status?: string; search?: string }): Promise<AdminInvoice[]> {
    const data = await apiClient.get<BackendInvoiceDto[]>("/invoices", {
      params: {
        ...(params?.type && { type: params.type }),
        ...(params?.status && { status: params.status }),
        ...(params?.search && { search: params.search }),
      },
    });
    return data.map(mapBackendInvoiceToAdmin);
  },

  async approveOfficialInvoice(id: string, taxSystemId?: string, approvedBy?: string): Promise<AdminInvoice> {
    const data = await apiClient.patch<BackendInvoiceDto>(`/invoices/${id}/approve-official`, {
      taxSystemId,
      approvedBy,
    });
    return mapBackendInvoiceToAdmin(data);
  },

  async rejectOfficialInvoice(id: string, reason: string, rejectedBy?: string): Promise<AdminInvoice> {
    const data = await apiClient.patch<BackendInvoiceDto>(`/invoices/${id}/reject-official`, {
      reason,
      rejectedBy,
    });
    return mapBackendInvoiceToAdmin(data);
  },
};
