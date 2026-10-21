import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { ITicketRepository, CreateTicketParams, CreateMessageParams, GetTicketsFilter } from '../../../../domain/repositories/ticket.repository.interface.js';
import { Ticket, TicketMessage } from '../../../../domain/entities/ticket.entity.js';
import type { TicketStatus, TicketPriority, TicketDepartment } from '../../../../domain/entities/ticket.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async generateTicketNumber(): Promise<string> {
    const count = await this.prisma.ticket.count();
    const year = new Date().getFullYear();
    const num = String(count + 1).padStart(4, '0');
    return `TCK-${year}-${num}`;
  }

  async createTicket(params: CreateTicketParams): Promise<Ticket> {
    const ticketNumber = await this.generateTicketNumber();
    const ticketId = randomUUID();
    const messageId = randomUUID();

    const ticket = await this.prisma.ticket.create({
      data: {
        id: ticketId,
        ticketNumber,
        userId: params.userId,
        subject: params.subject,
        department: params.department as any,
        priority: params.priority as any,
        status: 'OPEN',
        lastMessageAt: new Date(),
        messages: {
          create: {
            id: messageId,
            senderId: params.userId,
            senderRole: 'user',
            content: params.initialMessage,
            messageType: 'TEXT',
            clientMessageId: params.clientMessageId || null,
            isSystemMessage: false,
          },
        },
        statusHistory: {
          create: {
            toStatus: 'OPEN',
            changedBy: params.userId,
            note: 'تیکت ایجاد شد',
          },
        },
      },
      include: {
        messages: {
          include: {
            attachments: true,
          },
        },
        user: {
          select: { name: true, phone: true, email: true },
        },
      },
    });

    return this.mapTicket(ticket);
  }

  async findTicketById(id: string, withMessages = true): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: withMessages ? {
          include: { attachments: true, sender: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        } : false,
        user: {
          select: { name: true, phone: true, email: true },
        },
      },
    });

    if (!ticket) return null;
    return this.mapTicket(ticket);
  }

  async findTicketsByUser(userId: string, filter?: GetTicketsFilter): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        userId,
        ...(filter?.status ? { status: filter.status as any } : {}),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
        user: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return tickets.map((t) => this.mapTicket(t));
  }

  async findAllTickets(filter?: GetTicketsFilter): Promise<{ tickets: Ticket[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filter?.status) where['status'] = filter.status;
    if (filter?.department) where['department'] = filter.department;
    if (filter?.priority) where['priority'] = filter.priority;
    if (filter?.search) {
      where['OR'] = [
        { subject: { contains: filter.search, mode: 'insensitive' } },
        { ticketNumber: { contains: filter.search, mode: 'insensitive' } },
        { user: { name: { contains: filter.search, mode: 'insensitive' } } },
        { user: { phone: { contains: filter.search } } },
      ];
    }

    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: where as any,
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { attachments: true },
            take: 1,
          },
          user: { select: { name: true, phone: true, email: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ticket.count({ where: where as any }),
    ]);

    return { tickets: tickets.map((t) => this.mapTicket(t)), total };
  }

  async updateTicketStatus(id: string, status: TicketStatus, changedBy: string, note?: string): Promise<Ticket> {
    const current = await this.prisma.ticket.findUnique({ where: { id }, select: { status: true } });

    const [ticket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id },
        data: {
          status: status as any,
          closedAt: status === 'CLOSED' || status === 'RESOLVED' ? new Date() : undefined,
          updatedAt: new Date(),
        },
        include: {
          messages: { include: { attachments: true }, orderBy: { createdAt: 'asc' } },
          user: { select: { name: true, phone: true, email: true } },
        },
      }),
      this.prisma.ticketStatusHistory.create({
        data: {
          ticketId: id,
          fromStatus: current?.status as any ?? null,
          toStatus: status as any,
          changedBy,
          note: note || null,
        },
      }),
    ]);

    return this.mapTicket(ticket);
  }

  async updateTicketPriority(id: string, priority: TicketPriority): Promise<Ticket> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { priority: priority as any, updatedAt: new Date() },
      include: {
        messages: { include: { attachments: true }, orderBy: { createdAt: 'asc' } },
        user: { select: { name: true, phone: true, email: true } },
      },
    });
    return this.mapTicket(ticket);
  }

  async updateTicketDepartment(id: string, department: TicketDepartment): Promise<Ticket> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { department: department as any, updatedAt: new Date() },
      include: {
        messages: { include: { attachments: true }, orderBy: { createdAt: 'asc' } },
        user: { select: { name: true, phone: true, email: true } },
      },
    });
    return this.mapTicket(ticket);
  }

  async updateLastMessageAt(id: string, timestamp: Date): Promise<void> {
    await this.prisma.ticket.update({
      where: { id },
      data: { lastMessageAt: timestamp },
    });
  }

  async createMessage(params: CreateMessageParams): Promise<TicketMessage> {
    const msgId = randomUUID();
    const msg = await this.prisma.ticketMessage.create({
      data: {
        id: msgId,
        ticketId: params.ticketId,
        senderId: params.senderId,
        senderRole: params.senderRole,
        content: params.content,
        messageType: (params.messageType || 'TEXT') as any,
        clientMessageId: params.clientMessageId || null,
        isSystemMessage: params.senderRole === 'system',
        attachments: params.attachments
          ? {
              create: params.attachments.map((att) => ({
                id: randomUUID(),
                fileName: att.fileName,
                storageKey: att.storageKey,
                mimeType: att.mimeType,
                fileSize: att.fileSize,
                url: att.url,
              })),
            }
          : undefined,
      },
      include: {
        attachments: true,
        sender: { select: { name: true } },
      },
    });

    await this.updateLastMessageAt(params.ticketId, msg.createdAt);

    // Update ticket status to ANSWERED if admin replied, or WAITING_USER if user replied
    if (params.senderRole === 'admin') {
      await this.prisma.ticket.update({
        where: { id: params.ticketId },
        data: { status: 'ANSWERED' as any },
      });
    } else if (params.senderRole === 'user') {
      const ticket = await this.prisma.ticket.findUnique({ where: { id: params.ticketId }, select: { status: true } });
      if (ticket?.status === 'ANSWERED') {
        await this.prisma.ticket.update({
          where: { id: params.ticketId },
          data: { status: 'WAITING_USER' as any },
        });
      }
    }

    return this.mapMessage(msg);
  }

  async findMessageById(id: string): Promise<TicketMessage | null> {
    const msg = await this.prisma.ticketMessage.findUnique({
      where: { id },
      include: { attachments: true, sender: { select: { name: true } } },
    });
    if (!msg) return null;
    return this.mapMessage(msg);
  }

  async findMessagesByTicket(ticketId: string, page = 1, pageSize = 30): Promise<TicketMessage[]> {
    const msgs = await this.prisma.ticketMessage.findMany({
      where: { ticketId },
      include: { attachments: true, sender: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return msgs.map((m) => this.mapMessage(m));
  }

  async findByClientMessageId(clientMessageId: string): Promise<TicketMessage | null> {
    const msg = await this.prisma.ticketMessage.findUnique({
      where: { clientMessageId },
      include: { attachments: true, sender: { select: { name: true } } },
    });
    if (!msg) return null;
    return this.mapMessage(msg);
  }

  private mapTicket(raw: any): Ticket {
    return new Ticket({
      id: raw.id,
      ticketNumber: raw.ticketNumber,
      userId: raw.userId,
      subject: raw.subject,
      department: raw.department,
      priority: raw.priority,
      status: raw.status,
      closedAt: raw.closedAt,
      lastMessageAt: raw.lastMessageAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      messages: raw.messages?.map((m: any) => this.mapMessage(m)),
      userName: raw.user?.name,
      userPhone: raw.user?.phone,
      userEmail: raw.user?.email,
    });
  }

  private mapMessage(raw: any): TicketMessage {
    return new TicketMessage({
      id: raw.id,
      ticketId: raw.ticketId,
      senderId: raw.senderId,
      senderRole: raw.senderRole as any,
      content: raw.content,
      messageType: raw.messageType,
      clientMessageId: raw.clientMessageId,
      isSystemMessage: raw.isSystemMessage,
      createdAt: raw.createdAt,
      attachments: raw.attachments?.map((a: any) => ({
        id: a.id,
        messageId: a.messageId,
        fileName: a.fileName,
        storageKey: a.storageKey,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        url: a.url,
        createdAt: a.createdAt,
      })),
      senderName: raw.sender?.name,
    });
  }
}
