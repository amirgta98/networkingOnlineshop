export type TicketStatus = 'OPEN' | 'ANSWERED' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type TicketDepartment = 'CISCO_SWITCHING' | 'FIBER_CABLING' | 'BILLING_LEGAL' | 'WARRANTY_RMA' | 'GENERAL';
export type TicketMessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
export type SenderRole = 'user' | 'admin' | 'system';

export interface TicketAttachmentData {
  id: string;
  messageId: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: Date;
}

export interface TicketMessageData {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string | null;
  messageType: TicketMessageType;
  clientMessageId: string | null;
  isSystemMessage: boolean;
  createdAt: Date;
  attachments?: TicketAttachmentData[];
  senderName?: string;
}

export interface TicketData {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  closedAt: Date | null;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  messages?: TicketMessageData[];
  userName?: string;
  userPhone?: string;
  userEmail?: string;
}

export class Ticket {
  constructor(public readonly data: TicketData) {}

  get id() { return this.data.id; }
  get ticketNumber() { return this.data.ticketNumber; }
  get userId() { return this.data.userId; }
  get subject() { return this.data.subject; }
  get department() { return this.data.department; }
  get priority() { return this.data.priority; }
  get status() { return this.data.status; }
  get closedAt() { return this.data.closedAt; }
  get lastMessageAt() { return this.data.lastMessageAt; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }
  get messages() { return this.data.messages; }
  get userName() { return this.data.userName; }
  get userPhone() { return this.data.userPhone; }
  get userEmail() { return this.data.userEmail; }
}

export class TicketMessage {
  constructor(public readonly data: TicketMessageData) {}

  get id() { return this.data.id; }
  get ticketId() { return this.data.ticketId; }
  get senderId() { return this.data.senderId; }
  get senderRole() { return this.data.senderRole; }
  get content() { return this.data.content; }
  get messageType() { return this.data.messageType; }
  get clientMessageId() { return this.data.clientMessageId; }
  get isSystemMessage() { return this.data.isSystemMessage; }
  get createdAt() { return this.data.createdAt; }
  get attachments() { return this.data.attachments; }
  get senderName() { return this.data.senderName; }
}
