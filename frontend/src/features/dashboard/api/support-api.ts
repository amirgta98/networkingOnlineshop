import { apiClient } from "@/shared/lib/api-client";
import type {
  SupportTicket,
  TicketMessage,
  CreateTicketPayload,
  SendMessagePayload,
  TicketAttachment,
} from "../types/support.types";

export const supportApi = {
  /**
   * دریافت تیکت‌های کاربر جاری
   */
  async getMyTickets(): Promise<SupportTicket[]> {
    return apiClient.get<SupportTicket[]>("/tickets/my");
  },

  /**
   * دریافت جزئیات یک تیکت
   */
  async getTicket(id: string): Promise<SupportTicket> {
    return apiClient.get<SupportTicket>(`/tickets/${id}`);
  },

  /**
   * دریافت پیام‌های یک تیکت
   */
  async getMessages(ticketId: string, page = 1, pageSize = 50): Promise<TicketMessage[]> {
    return apiClient.get<TicketMessage[]>(`/tickets/${ticketId}/messages`, {
      params: { page, pageSize },
    });
  },

  /**
   * ایجاد تیکت جدید
   */
  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    const departmentMap: Record<string, string> = {
      cisco_switching: "CISCO_SWITCHING",
      fiber_cabling: "FIBER_CABLING",
      billing_legal: "BILLING_LEGAL",
      warranty_rma: "WARRANTY_RMA",
      general: "GENERAL",
      infrastructure: "CISCO_SWITCHING",
      INFRASTRUCTURE: "CISCO_SWITCHING",
    };

    const priorityMap: Record<string, string> = {
      low: "LOW",
      normal: "NORMAL",
      medium: "NORMAL",
      MEDIUM: "NORMAL",
      high: "HIGH",
      critical_datacenter: "CRITICAL",
      critical: "CRITICAL",
    };

    const validDepartments = ["CISCO_SWITCHING", "FIBER_CABLING", "BILLING_LEGAL", "WARRANTY_RMA", "GENERAL"];
    const validPriorities = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

    const rawDept = departmentMap[payload.department] || (payload.department ? payload.department.toUpperCase() : "");
    const dept = validDepartments.includes(rawDept) ? rawDept : "GENERAL";

    const rawPrio = priorityMap[payload.priority] || (payload.priority ? payload.priority.toUpperCase() : "");
    const prio = validPriorities.includes(rawPrio) ? rawPrio : "NORMAL";

    return apiClient.post<SupportTicket>("/tickets", {
      subject: payload.subject,
      department: dept,
      priority: prio,
      initialMessage: payload.initialMessage,
      clientMessageId: payload.clientMessageId || `client-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    });
  },

  /**
   * ارسال پیام در یک تیکت
   */
  async sendMessage(ticketId: string, payload: SendMessagePayload): Promise<TicketMessage> {
    return apiClient.post<TicketMessage>(`/tickets/${ticketId}/messages`, {
      content: payload.content,
      clientMessageId: payload.clientMessageId || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      attachments: payload.attachments,
    });
  },

  /**
   * آپلود فایل‌های پیوست
   */
  async uploadAttachments(ticketId: string, files: File[]): Promise<TicketAttachment[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiClient.post<TicketAttachment[]>(`/tickets/${ticketId}/attachments`, formData);
  },
};
