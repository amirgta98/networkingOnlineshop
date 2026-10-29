import { Injectable } from '@nestjs/common';
import type { ITicketRepository, CreateTicketParams, CreateMessageParams, GetTicketsFilter, TicketStats } from '../../../domain/repositories/ticket.repository.interface.js';
import { Ticket, TicketMessage } from '../../../domain/entities/ticket.entity.js';
import type { TicketStatus, TicketPriority, TicketDepartment, TicketAttachmentData } from '../../../domain/entities/ticket.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InMemoryTicketRepository implements ITicketRepository {
  private tickets: Map<string, Ticket> = new Map();
  private messages: Map<string, TicketMessage> = new Map();
  private ticketCounter = 0;

  async generateTicketNumber(): Promise<string> {
    this.ticketCounter++;
    const year = new Date().getFullYear();
    return `TCK-${year}-${String(this.ticketCounter).padStart(4, '0')}`;
  }

  async createTicket(params: CreateTicketParams): Promise<Ticket> {
    const ticketNumber = await this.generateTicketNumber();
    const ticketId = randomUUID();
    const messageId = randomUUID();
    const now = new Date();

    const message = new TicketMessage({
      id: messageId,
      ticketId,
      senderId: params.userId,
      senderRole: 'user',
      content: params.initialMessage,
      messageType: 'TEXT',
      clientMessageId: params.clientMessageId || null,
      isSystemMessage: false,
      createdAt: now,
      attachments: [],
    });

    const ticket = new Ticket({
      id: ticketId,
      ticketNumber,
      userId: params.userId,
      subject: params.subject,
      department: params.department,
      priority: params.priority,
      status: 'OPEN',
      closedAt: null,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
      messages: [message.data],
    });

    this.tickets.set(ticketId, ticket);
    this.messages.set(messageId, message);
    return ticket;
  }

  async findTicketById(id: string): Promise<Ticket | null> {
    const ticket = this.tickets.get(id);
    if (!ticket) return null;
    // Attach messages
    const msgs = Array.from(this.messages.values())
      .filter((m) => m.ticketId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return new Ticket({ ...ticket.data, messages: msgs.map((m) => m.data) });
  }

  async findTicketsByUser(userId: string): Promise<Ticket[]> {
    const result: Ticket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.userId === userId) {
        const msgs = Array.from(this.messages.values())
          .filter((m) => m.ticketId === ticket.id)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        result.push(new Ticket({ ...ticket.data, messages: msgs.map((m) => m.data) }));
      }
    }
    return result.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async findAllTickets(filter?: GetTicketsFilter): Promise<{ tickets: Ticket[]; total: number }> {
    let all = Array.from(this.tickets.values());

    if (filter?.status) all = all.filter((t) => t.status === filter.status);
    if (filter?.department) all = all.filter((t) => t.department === filter.department);
    if (filter?.priority) all = all.filter((t) => t.priority === filter.priority);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      all = all.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          (t.userName || '').toLowerCase().includes(q),
      );
    }

    all.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    const total = all.length;
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const paged = all.slice((page - 1) * pageSize, page * pageSize);

    return { tickets: paged, total };
  }

  async getTicketStats(): Promise<TicketStats> {
    const stats: TicketStats = {
      total: this.tickets.size,
      open: 0,
      answered: 0,
      waitingUser: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
    };

    for (const t of this.tickets.values()) {
      const s = String(t.status).toUpperCase();
      if (s === 'OPEN') stats.open++;
      else if (s === 'ANSWERED') stats.answered++;
      else if (s === 'WAITING_USER') stats.waitingUser++;
      else if (s === 'RESOLVED') stats.resolved++;
      else if (s === 'CLOSED') stats.closed++;

      const p = String(t.priority).toUpperCase();
      if (p === 'CRITICAL' || p === 'CRITICAL_DATACENTER') stats.critical++;
    }

    return stats;
  }

  async updateTicketStatus(id: string, status: TicketStatus, changedBy: string): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error('Ticket not found');
    const updated = new Ticket({
      ...ticket.data,
      status,
      closedAt: status === 'CLOSED' || status === 'RESOLVED' ? new Date() : ticket.closedAt,
      updatedAt: new Date(),
    });
    this.tickets.set(id, updated);
    return updated;
  }

  async updateTicketPriority(id: string, priority: TicketPriority): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error('Ticket not found');
    const updated = new Ticket({ ...ticket.data, priority, updatedAt: new Date() });
    this.tickets.set(id, updated);
    return updated;
  }

  async updateTicketDepartment(id: string, department: TicketDepartment): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error('Ticket not found');
    const updated = new Ticket({ ...ticket.data, department, updatedAt: new Date() });
    this.tickets.set(id, updated);
    return updated;
  }

  async updateLastMessageAt(id: string, timestamp: Date): Promise<void> {
    const ticket = this.tickets.get(id);
    if (ticket) {
      this.tickets.set(id, new Ticket({ ...ticket.data, lastMessageAt: timestamp }));
    }
  }

  async createMessage(params: CreateMessageParams): Promise<TicketMessage> {
    const msgId = randomUUID();
    const now = new Date();
    const message = new TicketMessage({
      id: msgId,
      ticketId: params.ticketId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      content: params.content,
      messageType: params.messageType || 'TEXT',
      clientMessageId: params.clientMessageId || null,
      isSystemMessage: params.senderRole === 'system',
      createdAt: now,
      attachments: (params.attachments || []).map((a: any) => ({
        id: randomUUID(),
        messageId: msgId,
        fileName: a.fileName,
        storageKey: a.storageKey,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        url: a.url,
        createdAt: now,
      })),
    });
    this.messages.set(msgId, message);
    await this.updateLastMessageAt(params.ticketId, now);

    // update ticket status
    const ticket = this.tickets.get(params.ticketId);
    if (ticket) {
      let newStatus = ticket.status;
      if (params.senderRole === 'admin') newStatus = 'ANSWERED';
      else if (params.senderRole === 'user' && ticket.status === 'ANSWERED') newStatus = 'WAITING_USER';
      if (newStatus !== ticket.status) {
        this.tickets.set(params.ticketId, new Ticket({ ...ticket.data, status: newStatus }));
      }
    }

    return message;
  }

  async findMessageById(id: string): Promise<TicketMessage | null> {
    return this.messages.get(id) || null;
  }

  async findMessagesByTicket(ticketId: string, page = 1, pageSize = 30): Promise<TicketMessage[]> {
    const msgs = Array.from(this.messages.values())
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return msgs.slice((page - 1) * pageSize, page * pageSize);
  }

  async findByClientMessageId(clientMessageId: string): Promise<TicketMessage | null> {
    for (const msg of this.messages.values()) {
      if (msg.clientMessageId === clientMessageId) return msg;
    }
    return null;
  }
}
