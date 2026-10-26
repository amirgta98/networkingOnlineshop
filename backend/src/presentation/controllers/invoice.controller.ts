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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard.js';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { JwtSessionService } from '../../infrastructure/auth/jwt-session.service.js';
import { CreateInvoiceUseCase } from '../../application/use-cases/invoice/create-invoice.use-case.js';
import { GetUserInvoicesUseCase } from '../../application/use-cases/invoice/get-user-invoices.use-case.js';
import { GetInvoiceByIdUseCase } from '../../application/use-cases/invoice/get-invoice-by-id.use-case.js';
import { GetAllInvoicesUseCase } from '../../application/use-cases/invoice/get-all-invoices.use-case.js';
import { ApproveOfficialInvoiceUseCase } from '../../application/use-cases/invoice/approve-official-invoice.use-case.js';
import { RejectOfficialInvoiceUseCase } from '../../application/use-cases/invoice/reject-official-invoice.use-case.js';
import { CreateInvoiceRequestDto } from '../dto/request/invoice/create-invoice.request.dto.js';
import { ApproveInvoiceRequestDto } from '../dto/request/invoice/approve-invoice.request.dto.js';
import { RejectInvoiceRequestDto } from '../dto/request/invoice/reject-invoice.request.dto.js';
import { InvoiceResponseDto } from '../dto/response/invoice/invoice.response.dto.js';
import type { InvoiceType, InvoiceStatus } from '../../domain/entities/invoice.entity.js';


interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getUserInvoicesUseCase: GetUserInvoicesUseCase,
    private readonly getInvoiceByIdUseCase: GetInvoiceByIdUseCase,
    private readonly getAllInvoicesUseCase: GetAllInvoicesUseCase,
    private readonly approveOfficialInvoiceUseCase: ApproveOfficialInvoiceUseCase,
    private readonly rejectOfficialInvoiceUseCase: RejectOfficialInvoiceUseCase,
    private readonly jwtSessionService: JwtSessionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت و صدور صورتحساب (عادی یا رسمی)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'فاکتور با موفقیت ایجاد شد.',
    type: InvoiceResponseDto,
  })
  async createInvoice(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInvoiceRequestDto,
  ): Promise<InvoiceResponseDto> {
    // Extract user id if logged in
    const userId = this.extractUserIdOptional(req);

    const created = await this.createInvoiceUseCase.execute({
      userId,
      type: dto.type,
      items: dto.items,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerAddress: dto.customerAddress,
      customerPostalCode: dto.customerPostalCode,
      shippingCost: dto.shippingCost,
      discountAmount: dto.discountAmount,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
      legalDetails: dto.legalDetails,
    });

    return InvoiceResponseDto.fromDomain(created);
  }

  @Get('my')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست فاکتورهای کاربر جاری' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست فاکتورهای کاربر بازگردانده شد.',
    type: [InvoiceResponseDto],
  })
  async getMyInvoices(@Req() req: AuthenticatedRequest): Promise<InvoiceResponseDto[]> {
    const userId = req.user?.sub || '1811d434-1492-4521-9179-a97aa8f87a17';
    const list = await this.getUserInvoicesUseCase.execute(userId);
    return list.map((inv) => InvoiceResponseDto.fromDomain(inv));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت کلیه فاکتورها (پنل مدیریت)' })
  @ApiQuery({ name: 'type', required: false, enum: ['UNOFFICIAL', 'OFFICIAL'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ISSUED', 'CANCELLED'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست کامل صورتحساب‌ها بازگردانده شد.',
    type: [InvoiceResponseDto],
  })
  async getAllInvoices(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<InvoiceResponseDto[]> {
    const list = await this.getAllInvoicesUseCase.execute({
      type: type as InvoiceType,
      status: status as InvoiceStatus,
      search,
    });
    return list.map((inv) => InvoiceResponseDto.fromDomain(inv));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت جزییات یک فاکتور با شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه فاکتور' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'جزییات صورتحساب بازگردانده شد.',
    type: InvoiceResponseDto,
  })
  async getInvoiceById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<InvoiceResponseDto> {
    const userId = this.extractUserIdOptional(req);
    const invoice = await this.getInvoiceByIdUseCase.execute(id, userId || undefined, true);
    return InvoiceResponseDto.fromDomain(invoice);
  }

  @Patch(':id/approve-official')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ثبت رسمی و تایید صورتحساب رسمی در سامانه مودیان (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه فاکتور' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'فاکتور رسمی با موفقیت تایید و با شناسه مالیاتی ثبت گردید.',
    type: InvoiceResponseDto,
  })
  async approveOfficialInvoice(
    @Param('id') id: string,
    @Body() dto: ApproveInvoiceRequestDto,
  ): Promise<InvoiceResponseDto> {
    const approved = await this.approveOfficialInvoiceUseCase.execute({
      invoiceId: id,
      taxSystemId: dto?.taxSystemId,
      approvedBy: dto?.approvedBy,
    });
    return InvoiceResponseDto.fromDomain(approved);
  }

  @Patch(':id/reject-official')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'رد درخواست صدور فاکتور رسمی (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه فاکتور' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'درخواست فاکتور رسمی رد شد.',
    type: InvoiceResponseDto,
  })
  async rejectOfficialInvoice(
    @Param('id') id: string,
    @Body() dto: RejectInvoiceRequestDto,
  ): Promise<InvoiceResponseDto> {
    const rejected = await this.rejectOfficialInvoiceUseCase.execute({
      invoiceId: id,
      reason: dto.reason,
      rejectedBy: dto.rejectedBy,
    });
    return InvoiceResponseDto.fromDomain(rejected);
  }

  private extractUserIdOptional(req: AuthenticatedRequest): string | null {
    if (req.user?.sub) return req.user.sub;

    const authHeader = req.headers.authorization;
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/velox_session_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token) return null;

    try {
      const payload = this.jwtSessionService.verifyAccessToken(token);
      return payload?.sub || null;
    } catch {
      return null;
    }
  }
}
