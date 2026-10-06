export type TicketPriority = "low" | "normal" | "high" | "critical_datacenter";
export type TicketDepartment = "cisco_switching" | "fiber_cabling" | "billing_legal" | "warranty_rma";
export type TicketStatus = "open" | "answered" | "waiting_user" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: "user" | "engineer_ccie" | "support_agent";
  content: string;
  createdAt: string;
  attachments?: {
    name: string;
    size: string;
    type: "config" | "log" | "image" | "doc";
  }[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  department: TicketDepartment;
  departmentLabel: string;
  priority: TicketPriority;
  priorityLabel: string;
  status: TicketStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  assignedEngineer?: {
    name: string;
    title: string;
    avatarUrl?: string;
  };
  messages: TicketMessage[];
}
