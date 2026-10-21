import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Ticket, TicketMessage, TicketMessageData } from '../../../../domain/entities/ticket.entity.js';

const DEPT_LABELS: Record<string, string> = {
  CISCO_SWITCHING: 'سوئیچینگ و روترهای سیسکو (CCIE)',
  FIBER_CABLING: 'فیبر نوری و کابل‌کشی ساختاریافته',
  BILLING_LEGAL: 'امور مالی و فاکتور رسمی',
  WARRANTY_RMA: 'گارانتی طلایی و خدمات پس از فروش',
  GENERAL: 'پشتیبانی عمومی',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'کم',
  NORMAL: 'عادی',
  HIGH: 'بالا',
  CRITICAL: 'بحرانی (قطع سرویس)',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'در انتظار بررسی',
  ANSWERED: 'پاسخ داده شد',
  WAITING_USER: 'در انتظار پاسخ کاربر',
  RESOLVED: 'حل شده',
  CLOSED: 'بسته شده',
};

export class TicketAttachmentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() messageId!: string;
  @ApiProperty() fileName!: string;
  @ApiProperty() storageKey!: string;
  @ApiProperty() mimeType!: string;
  @ApiProperty() fileSize!: number;
  @ApiProperty() url!: string;
  @ApiProperty() createdAt!: string;
}

export class TicketMessageResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() ticketId!: string;
  @ApiProperty() senderId!: string;
  @ApiProperty() senderRole!: string;
  @ApiPropertyOptional() senderName?: string;
  @ApiPropertyOptional() content?: string;
  @ApiProperty() messageType!: string;
  @ApiProperty() isSystemMessage!: boolean;
  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional({ type: [TicketAttachmentResponseDto] }) attachments?: TicketAttachmentResponseDto[];

  static fromDomain(msg: TicketMessage | TicketMessageData): TicketMessageResponseDto {
    const dto = new TicketMessageResponseDto();
    dto.id = msg.id;
    dto.ticketId = msg.ticketId;
    dto.senderId = msg.senderId;
    dto.senderRole = msg.senderRole;
    dto.senderName = msg.senderName;
    dto.content = msg.content ?? '';
    dto.messageType = msg.messageType;
    dto.isSystemMessage = msg.isSystemMessage;
    dto.createdAt = (msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt)).toISOString();
    dto.attachments = msg.attachments?.map((a) => ({
      id: a.id,
      messageId: a.messageId,
      fileName: a.fileName,
      storageKey: a.storageKey,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
      url: a.url,
      createdAt: (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)).toISOString(),
    })) ?? [];
    return dto;
  }
}

export class TicketResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() ticketNumber!: string;
  @ApiProperty() userId!: string;
  @ApiPropertyOptional() userName?: string;
  @ApiPropertyOptional() userPhone?: string;
  @ApiPropertyOptional() userEmail?: string;
  @ApiProperty() subject!: string;
  @ApiProperty() department!: string;
  @ApiProperty() departmentLabel!: string;
  @ApiProperty() priority!: string;
  @ApiProperty() priorityLabel!: string;
  @ApiProperty() status!: string;
  @ApiProperty() statusLabel!: string;
  @ApiPropertyOptional() closedAt?: string;
  @ApiProperty() lastMessageAt!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
  @ApiPropertyOptional({ type: [TicketMessageResponseDto] }) messages?: TicketMessageResponseDto[];

  static fromDomain(ticket: Ticket): TicketResponseDto {
    const dto = new TicketResponseDto();
    dto.id = ticket.id;
    dto.ticketNumber = ticket.ticketNumber;
    dto.userId = ticket.userId;
    dto.userName = ticket.userName;
    dto.userPhone = ticket.userPhone;
    dto.userEmail = ticket.userEmail;
    dto.subject = ticket.subject;
    dto.department = ticket.department;
    dto.departmentLabel = DEPT_LABELS[ticket.department] || ticket.department;
    dto.priority = ticket.priority;
    dto.priorityLabel = PRIORITY_LABELS[ticket.priority] || ticket.priority;
    dto.status = ticket.status;
    dto.statusLabel = STATUS_LABELS[ticket.status] || ticket.status;
    dto.closedAt = ticket.closedAt?.toISOString();
    dto.lastMessageAt = ticket.lastMessageAt.toISOString();
    dto.createdAt = ticket.createdAt.toISOString();
    dto.updatedAt = ticket.updatedAt.toISOString();
    dto.messages = ticket.messages?.map(TicketMessageResponseDto.fromDomain) ?? [];
    return dto;
  }
}

export class TicketListResponseDto {
  @ApiProperty({ type: [TicketResponseDto] }) tickets!: TicketResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}
