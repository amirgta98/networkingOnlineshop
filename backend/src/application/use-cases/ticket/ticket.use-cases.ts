import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ITicketRepository } from '../../../domain/repositories/ticket.repository.interface.js';

@Injectable()
export class CreateTicketUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(params: {
    userId: string;
    subject: string;
    department: string;
    priority: string;
    initialMessage: string;
    clientMessageId?: string;
  }) {
    return this.ticketRepo.createTicket({
      userId: params.userId,
      subject: params.subject,
      department: params.department as any,
      priority: params.priority as any,
      initialMessage: params.initialMessage,
      clientMessageId: params.clientMessageId,
    });
  }
}

@Injectable()
export class GetUserTicketsUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(userId: string) {
    return this.ticketRepo.findTicketsByUser(userId);
  }
}

@Injectable()
export class GetTicketByIdUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(id: string, requestingUserId: string, isAdmin: boolean) {
    const ticket = await this.ticketRepo.findTicketById(id, true);
    if (!ticket) throw new NotFoundException('تیکت مورد نظر یافت نشد.');
    if (!isAdmin && ticket.userId !== requestingUserId) {
      throw new ForbiddenException('شما مجاز به مشاهده این تیکت نیستید.');
    }
    return ticket;
  }
}

@Injectable()
export class GetAllTicketsUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(filter?: {
    status?: string;
    department?: string;
    priority?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const [{ tickets, total }, stats] = await Promise.all([
      this.ticketRepo.findAllTickets({
        status: filter?.status as any,
        department: filter?.department as any,
        priority: filter?.priority as any,
        search: filter?.search,
        page: filter?.page,
        pageSize: filter?.pageSize,
      }),
      this.ticketRepo.getTicketStats(),
    ]);

    return { tickets, total, stats };
  }
}

@Injectable()
export class GetTicketStatsUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute() {
    return this.ticketRepo.getTicketStats();
  }
}

@Injectable()
export class SendMessageUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(params: {
    ticketId: string;
    senderId: string;
    senderRole: 'user' | 'admin';
    content: string;
    clientMessageId?: string;
    attachments?: Array<{
      fileName: string;
      storageKey: string;
      mimeType: string;
      fileSize: number;
      url: string;
    }>;
  }) {
    // Idempotency check
    if (params.clientMessageId) {
      const existing = await this.ticketRepo.findByClientMessageId(params.clientMessageId);
      if (existing) return existing;
    }

    const ticket = await this.ticketRepo.findTicketById(params.ticketId, false);
    if (!ticket) throw new NotFoundException('تیکت مورد نظر یافت نشد.');
    if (ticket.status === 'CLOSED') throw new ForbiddenException('این تیکت بسته شده است.');
    if (params.senderRole === 'user' && ticket.userId !== params.senderId) {
      throw new ForbiddenException('شما مجاز به ارسال پیام در این تیکت نیستید.');
    }

    const messageType = params.attachments?.length
      ? (params.attachments[0].mimeType.startsWith('image/') ? 'IMAGE' : 'FILE')
      : 'TEXT';

    return this.ticketRepo.createMessage({
      ticketId: params.ticketId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      content: params.content,
      messageType: messageType as any,
      clientMessageId: params.clientMessageId,
      attachments: params.attachments,
    });
  }
}

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(ticketId: string, status: string, changedBy: string, note?: string) {
    const ticket = await this.ticketRepo.findTicketById(ticketId, false);
    if (!ticket) throw new NotFoundException('تیکت مورد نظر یافت نشد.');
    return this.ticketRepo.updateTicketStatus(ticketId, status as any, changedBy, note);
  }
}

@Injectable()
export class UpdateTicketPriorityUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(ticketId: string, priority: string) {
    const ticket = await this.ticketRepo.findTicketById(ticketId, false);
    if (!ticket) throw new NotFoundException('تیکت مورد نظر یافت نشد.');
    return this.ticketRepo.updateTicketPriority(ticketId, priority as any);
  }
}

@Injectable()
export class UpdateTicketDepartmentUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(ticketId: string, department: string) {
    const ticket = await this.ticketRepo.findTicketById(ticketId, false);
    if (!ticket) throw new NotFoundException('تیکت مورد نظر یافت نشد.');
    return this.ticketRepo.updateTicketDepartment(ticketId, department as any);
  }
}

@Injectable()
export class GetTicketMessagesUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(ticketId: string, requestingUserId: string, isAdmin: boolean, page = 1, pageSize = 30) {
    const ticket = await this.ticketRepo.findTicketById(ticketId, false);
    if (!ticket) throw new NotFoundException('تیکت مورد نظر یافت نشد.');
    if (!isAdmin && ticket.userId !== requestingUserId) {
      throw new ForbiddenException('شما مجاز به مشاهده این تیکت نیستید.');
    }
    return this.ticketRepo.findMessagesByTicket(ticketId, page, pageSize);
  }
}
