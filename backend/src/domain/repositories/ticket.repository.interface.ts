import type { Ticket, TicketMessage, TicketAttachmentData } from '../entities/ticket.entity.js';
import type { TicketStatus, TicketPriority, TicketDepartment } from '../entities/ticket.entity.js';

export interface CreateTicketParams {
  userId: string;
  subject: string;
  department: TicketDepartment;
  priority: TicketPriority;
  initialMessage: string;
  clientMessageId?: string;
}

export interface CreateMessageParams {
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'system';
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  clientMessageId?: string;
  attachments?: Omit<TicketAttachmentData, 'id' | 'messageId' | 'createdAt'>[];
}

export interface GetTicketsFilter {
  userId?: string;
  status?: TicketStatus;
  department?: TicketDepartment;
  priority?: TicketPriority;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'lastMessageAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TicketStats {
  total: number;
  open: number;
  answered: number;
  waitingUser: number;
  resolved: number;
  closed: number;
  critical: number;
}

export interface ITicketRepository {
  createTicket(params: CreateTicketParams): Promise<Ticket>;
  findTicketById(id: string, withMessages?: boolean): Promise<Ticket | null>;
  findTicketsByUser(userId: string, filter?: GetTicketsFilter): Promise<Ticket[]>;
  findAllTickets(filter?: GetTicketsFilter): Promise<{ tickets: Ticket[]; total: number }>;
  getTicketStats(): Promise<TicketStats>;
  updateTicketStatus(id: string, status: TicketStatus, changedBy: string, note?: string): Promise<Ticket>;
  updateTicketPriority(id: string, priority: TicketPriority): Promise<Ticket>;
  updateTicketDepartment(id: string, department: TicketDepartment): Promise<Ticket>;
  updateLastMessageAt(id: string, timestamp: Date): Promise<void>;

  createMessage(params: CreateMessageParams): Promise<TicketMessage>;
  findMessageById(id: string): Promise<TicketMessage | null>;
  findMessagesByTicket(ticketId: string, page?: number, pageSize?: number, cursor?: string): Promise<TicketMessage[]>;
  findByClientMessageId(clientMessageId: string): Promise<TicketMessage | null>;

  generateTicketNumber(): Promise<string>;
}
