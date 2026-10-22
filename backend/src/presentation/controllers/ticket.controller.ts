import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import {
  CreateTicketUseCase,
  GetUserTicketsUseCase,
  GetTicketByIdUseCase,
  GetAllTicketsUseCase,
  SendMessageUseCase,
  UpdateTicketStatusUseCase,
  UpdateTicketPriorityUseCase,
  UpdateTicketDepartmentUseCase,
  GetTicketMessagesUseCase,
} from '../../application/use-cases/ticket/ticket.use-cases.js';
import {
  CreateTicketRequestDto,
  SendMessageRequestDto,
  UpdateTicketStatusRequestDto,
  UpdateTicketPriorityRequestDto,
  UpdateTicketDepartmentRequestDto,
} from '../dto/request/ticket/ticket.request.dto.js';
import {
  TicketResponseDto,
  TicketMessageResponseDto,
  TicketListResponseDto,
} from '../dto/response/ticket/ticket.response.dto.js';
import { TicketGateway } from '../gateways/ticket.gateway.js';

interface AuthenticatedRequest extends Request {
  user?: { sub: string; role?: string; phone?: string };
}

const getUploadsDir = () => {
  const cwd = process.cwd();
  const dir = existsSync(join(cwd, 'backend'))
    ? join(cwd, 'backend', 'uploads', 'tickets')
    : join(cwd, 'uploads', 'tickets');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
};

@ApiTags('Support Tickets')
@Controller('tickets')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TicketController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getUserTicketsUseCase: GetUserTicketsUseCase,
    private readonly getTicketByIdUseCase: GetTicketByIdUseCase,
    private readonly getAllTicketsUseCase: GetAllTicketsUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private readonly updateTicketPriorityUseCase: UpdateTicketPriorityUseCase,
    private readonly updateTicketDepartmentUseCase: UpdateTicketDepartmentUseCase,
    private readonly getTicketMessagesUseCase: GetTicketMessagesUseCase,
    private readonly ticketGateway: TicketGateway,
  ) {}

  // ─────────── User Routes ───────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد تیکت جدید' })
  async createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTicketRequestDto,
  ): Promise<TicketResponseDto> {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('کاربر احراز هویت نشده.');

    const ticket = await this.createTicketUseCase.execute({
      userId,
      subject: dto.subject,
      department: dto.department,
      priority: dto.priority,
      initialMessage: dto.initialMessage,
      clientMessageId: dto.clientMessageId,
    });

    return TicketResponseDto.fromDomain(ticket);
  }

  @Get('my')
  @ApiOperation({ summary: 'تیکت‌های کاربر جاری' })
  async getMyTickets(@Req() req: AuthenticatedRequest): Promise<TicketResponseDto[]> {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('کاربر احراز هویت نشده.');
    const tickets = await this.getUserTicketsUseCase.execute(userId);
    return tickets.map(TicketResponseDto.fromDomain);
  }

  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'همه تیکت‌ها (ادمین)' })
  async getAllTickets(
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<TicketListResponseDto> {
    const p = parseInt(page || '1', 10);
    const ps = parseInt(pageSize || '20', 10);
    const { tickets, total } = await this.getAllTicketsUseCase.execute({
      status, department, priority, search,
      page: p, pageSize: ps,
    });

    return {
      tickets: tickets.map(TicketResponseDto.fromDomain),
      total,
      page: p,
      pageSize: ps,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات تیکت' })
  async getTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<TicketResponseDto> {
    const userId = req.user?.sub ?? '';
    const isAdmin = this.isAdmin(req.user?.role);
    const ticket = await this.getTicketByIdUseCase.execute(id, userId, isAdmin);
    return TicketResponseDto.fromDomain(ticket);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'تاریخچه پیام‌های تیکت' })
  async getMessages(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<TicketMessageResponseDto[]> {
    const userId = req.user?.sub ?? '';
    const isAdmin = this.isAdmin(req.user?.role);
    const msgs = await this.getTicketMessagesUseCase.execute(
      id, userId, isAdmin,
      parseInt(page || '1', 10),
      parseInt(pageSize || '30', 10),
    );
    return msgs.map(TicketMessageResponseDto.fromDomain);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ارسال پیام' })
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: SendMessageRequestDto,
  ): Promise<TicketMessageResponseDto> {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('کاربر احراز هویت نشده.');
    const isAdmin = this.isAdmin(req.user?.role);
    const senderRole: 'user' | 'admin' = isAdmin ? 'admin' : 'user';

    const message = await this.sendMessageUseCase.execute({
      ticketId: id,
      senderId: userId,
      senderRole,
      content: dto.content,
      clientMessageId: dto.clientMessageId,
      attachments: dto.attachments,
    });

    const dto2 = TicketMessageResponseDto.fromDomain(message);
    if (!dto2.senderName) {
      dto2.senderName = isAdmin ? 'پشتیبانی ققنوس' : 'کاربر';
    }

    // Emit via WebSocket
    try {
      this.ticketGateway.emitTicketUpdate(id, 'ticket:new_message', { message: dto2 });
    } catch (wsErr) {
      console.error('[TicketController] Failed to emit ticket:new_message via WebSocket:', wsErr);
    }

    return dto2;
  }

  // ─────────── File Upload ───────────

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'آپلود فایل پیوست' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'فایل‌های پیوست', schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, getUploadsDir()),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|log|xlsx|xls|zip|rar|csv)$/i;
        if (allowed.test(file.originalname)) cb(null, true);
        else cb(new BadRequestException('فرمت فایل مجاز نیست.'), false);
      },
    }),
  )
  async uploadAttachments(
    @Param('id') _id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new BadRequestException('هیچ فایلی آپلود نشد.');

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return files.map((file) => ({
      fileName: file.originalname,
      storageKey: `tickets/${file.filename}`,
      mimeType: file.mimetype,
      fileSize: file.size,
      url: `${baseUrl}/uploads/tickets/${file.filename}`,
    }));
  }

  // ─────────── Admin Routes ───────────

  @Patch(':id/status')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تغییر وضعیت تیکت (ادمین)' })
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusRequestDto,
  ): Promise<TicketResponseDto> {
    const userId = req.user?.sub ?? '';
    const ticket = await this.updateTicketStatusUseCase.execute(id, dto.status, userId, dto.note);
    const result = TicketResponseDto.fromDomain(ticket);

    try {
      this.ticketGateway.emitTicketUpdate(id, 'ticket:status_changed', {
        status: ticket.status,
        statusLabel: result.statusLabel,
      });
    } catch (wsErr) {
      console.error('[TicketController] Failed to emit ticket:status_changed:', wsErr);
    }

    return result;
  }

  @Patch(':id/priority')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تغییر درجه فوریت (ادمین)' })
  async updatePriority(
    @Param('id') id: string,
    @Body() dto: UpdateTicketPriorityRequestDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.updateTicketPriorityUseCase.execute(id, dto.priority);
    const result = TicketResponseDto.fromDomain(ticket);

    try {
      this.ticketGateway.emitTicketUpdate(id, 'ticket:priority_changed', {
        priority: ticket.priority,
        priorityLabel: result.priorityLabel,
      });
    } catch (wsErr) {
      console.error('[TicketController] Failed to emit ticket:priority_changed:', wsErr);
    }

    return result;
  }

  @Patch(':id/department')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تغییر دپارتمان (ادمین)' })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDepartmentRequestDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.updateTicketDepartmentUseCase.execute(id, dto.department);
    const result = TicketResponseDto.fromDomain(ticket);

    try {
      this.ticketGateway.emitTicketUpdate(id, 'ticket:department_changed', {
        department: ticket.department,
        departmentLabel: result.departmentLabel,
      });
    } catch (wsErr) {
      console.error('[TicketController] Failed to emit ticket:department_changed:', wsErr);
    }

    return result;
  }

  private isAdmin(role?: string): boolean {
    if (!role) return false;
    const r = role.toLowerCase();
    return (
      r === 'admin' ||
      r === 'super_admin' ||
      r === 'staff_manager' ||
      r === 'sales_manager' ||
      r === 'owner' ||
      r === 'support' ||
      r === 'support_agent' ||
      r === 'engineer_ccie'
    );
  }
}
