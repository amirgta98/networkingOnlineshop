export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL" | "low" | "normal" | "high" | "critical_datacenter";
export type TicketDepartment =
  | "CISCO_SWITCHING"
  | "FIBER_CABLING"
  | "BILLING_LEGAL"
  | "WARRANTY_RMA"
  | "GENERAL"
  | "cisco_switching"
  | "fiber_cabling"
  | "billing_legal"
  | "warranty_rma";
export type TicketStatus =
  | "OPEN"
  | "ANSWERED"
  | "WAITING_USER"
  | "RESOLVED"
  | "CLOSED"
  | "open"
  | "answered"
  | "waiting_user"
  | "resolved"
  | "closed";
export type TicketMessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";

export interface TicketAttachment {
  id?: string;
  messageId?: string;
  fileName?: string;
  storageKey?: string;
  mimeType?: string;
  fileSize?: number;
  url?: string;
  createdAt?: string;
  // Backward compatibility
  name?: string;
  size?: string;
  type?: "config" | "log" | "image" | "doc";
}

export interface TicketMessage {
  id: string;
  ticketId?: string;
  senderId?: string;
  senderRole: "user" | "admin" | "system" | "engineer_ccie" | "support_agent";
  senderName?: string;
  content: string;
  messageType?: TicketMessageType;
  isSystemMessage?: boolean;
  createdAt: string;
  attachments?: TicketAttachment[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  subject: string;
  department: TicketDepartment;
  departmentLabel: string;
  priority: TicketPriority;
  priorityLabel: string;
  status: TicketStatus;
  statusLabel: string;
  closedAt?: string | null;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  assignedEngineer?: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
}

export interface CreateTicketPayload {
  subject: string;
  department: string;
  priority: string;
  initialMessage: string;
  clientMessageId?: string;
  attachmentFileName?: string;
}

export interface SendMessagePayload {
  content: string;
  clientMessageId?: string;
  attachments?: Array<
    | TicketAttachment
    | {
        fileName: string;
        storageKey: string;
        mimeType: string;
        fileSize: number;
        url: string;
      }
  >;
}

export interface TicketFilterParams {
  status?: string;
  department?: string;
  priority?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
