import { apiClient } from "@/shared/lib/api-client";
import type {
  SupportTicket,
  TicketMessage,
  TicketFilterParams,
  SendMessagePayload,
  TicketAttachment,
} from "../../dashboard/types/support.types";

export interface AdminTicketsListResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  pageSize: number;
}

export const adminSupportApi = {
  /**
   * دریافت همه تیکت‌ها برای ادمین همراه با فیلترها و صفحه‌بندی
   */
  async getAllTickets(params?: TicketFilterParams): Promise<AdminTicketsListResponse> {
    return apiClient.get<AdminTicketsListResponse>("/tickets", { params: params as any });
  },

  /**
   * دریافت جزئیات تیکت
   */
  async getTicket(id: string): Promise<SupportTicket> {
    return apiClient.get<SupportTicket>(`/tickets/${id}`);
  },

  /**
   * دریافت پیام‌های تیکت
   */
  async getMessages(ticketId: string, page = 1, pageSize = 50): Promise<TicketMessage[]> {
    return apiClient.get<TicketMessage[]>(`/tickets/${ticketId}/messages`, {
      params: { page, pageSize },
    });
  },

  /**
   * ارسال پیام از سمت ادمین
   */
  async sendMessage(ticketId: string, payload: SendMessagePayload): Promise<TicketMessage> {
    return apiClient.post<TicketMessage>(`/tickets/${ticketId}/messages`, {
      content: payload.content,
      clientMessageId: payload.clientMessageId || `admin-msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      attachments: payload.attachments,
    });
  },

  /**
   * تغییر وضعیت تیکت
   */
  async updateStatus(ticketId: string, status: string, note?: string): Promise<SupportTicket> {
    return apiClient.patch<SupportTicket>(`/tickets/${ticketId}/status`, {
      status,
      note,
    });
  },

  /**
   * تغییر درجه فوریت تیکت
   */
  async updatePriority(ticketId: string, priority: string): Promise<SupportTicket> {
    return apiClient.patch<SupportTicket>(`/tickets/${ticketId}/priority`, {
      priority,
    });
  },

  /**
   * تغییر دپارتمان تیکت
   */
  async updateDepartment(ticketId: string, department: string): Promise<SupportTicket> {
    return apiClient.patch<SupportTicket>(`/tickets/${ticketId}/department`, {
      department,
    });
  },

  /**
   * آپلود فایل‌های پیوست توسط ادمین
   */
  async uploadAttachments(ticketId: string, files: File[]): Promise<TicketAttachment[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiClient.post<TicketAttachment[]>(`/tickets/${ticketId}/attachments`, formData);
  },
};
