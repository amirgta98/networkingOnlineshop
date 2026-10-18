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
  Inject,
  BadRequestException,
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
import { randomUUID } from 'node:crypto';
import { AuthGuard } from '../guards/auth.guard.js';
import { JwtSessionService } from '../../infrastructure/auth/jwt-session.service.js';
import { USER_REPOSITORY_TOKEN } from '../../shared/constants/tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo.js';
import { CreateOrderUseCase } from '../../application/use-cases/order/create-order.use-case.js';
import { GetAllOrdersUseCase } from '../../application/use-cases/order/get-all-orders.use-case.js';
import { GetOrderByIdUseCase } from '../../application/use-cases/order/get-order-by-id.use-case.js';
import { GetUserOrdersUseCase } from '../../application/use-cases/order/get-user-orders.use-case.js';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/order/update-order-status.use-case.js';
import { AssignOrderCarrierUseCase } from '../../application/use-cases/order/assign-order-carrier.use-case.js';
import { CreateOrderRequestDto } from '../dto/request/order/create-order.request.dto.js';
import { UpdateOrderStatusRequestDto } from '../dto/request/order/update-order-status.request.dto.js';
import { AssignCarrierRequestDto } from '../dto/request/order/assign-carrier.request.dto.js';
import {
  AdminOrderResponseDto,
  PlacedOrderResponseDto,
} from '../dto/response/order/order.response.dto.js';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getAllOrdersUseCase: GetAllOrdersUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly getUserOrdersUseCase: GetUserOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly assignOrderCarrierUseCase: AssignOrderCarrierUseCase,
    private readonly jwtSessionService: JwtSessionService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت و نهایی‌سازی سفارش جدید' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'سفارش با موفقیت ثبت گردید.',
    type: PlacedOrderResponseDto,
  })
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderRequestDto,
  ): Promise<PlacedOrderResponseDto> {
    const userId = await this.resolveUserId(req, dto.shippingAddress?.phoneNumber);

    const result = await this.createOrderUseCase.execute({
      userId,
      items: dto.items.map((it) => ({
        productId: it.productId,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
      shippingAddress: dto.shippingAddress,
      invoiceType: dto.invoiceType,
      legalInvoice: dto.legalInvoice,
      deliveryMethodId: dto.deliveryMethodId,
      deliveryDate: dto.deliveryDate,
      deliveryDateJalali: dto.deliveryDateJalali,
      deliveryTimeSlot: dto.deliveryTimeSlot,
      specialDeliveryNotes: dto.specialDeliveryNotes,
      liftRequired: dto.liftRequired,
      paymentMethodId: dto.paymentMethodId,
      selectedGatewayId: dto.selectedGatewayId,
      couponCode: dto.couponCode,
    });

    return result as unknown as PlacedOrderResponseDto;
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت و نهایی‌سازی سفارش جدید (مسیر جانبی)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'سفارش با موفقیت ثبت گردید.',
    type: PlacedOrderResponseDto,
  })
  async createOrderAlias(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderRequestDto,
  ): Promise<PlacedOrderResponseDto> {
    return this.createOrder(req, dto);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت تاریخچه سفارشات کاربر جاری' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست سفارشات کاربر جاری',
    type: [AdminOrderResponseDto],
  })
  async getMyOrders(@Req() req: AuthenticatedRequest): Promise<AdminOrderResponseDto[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('کاربر احراز هویت نشده است.');
    }

    const orders = await this.getUserOrdersUseCase.execute(userId);
    return orders.map((o) => AdminOrderResponseDto.fromDomain(o));
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست کلیه سفارشات (مدیریت انبار و مالی)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerType', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست سفارشات فیلتر شده',
    type: [AdminOrderResponseDto],
  })
  async getAllOrders(
    @Query('status') status?: string,
    @Query('customerType') customerType?: string,
    @Query('search') search?: string,
  ): Promise<AdminOrderResponseDto[]> {
    const orders = await this.getAllOrdersUseCase.execute({
      status,
      customerType,
      search,
    });
    return orders.map((o) => AdminOrderResponseDto.fromDomain(o));
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت جزئیات یک سفارش با شناسه، شماره سفارش یا کد رهگیری' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش، شماره سفارش (VX-...) یا کد رهگیری' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'جزئیات کامل سفارش',
    type: AdminOrderResponseDto,
  })
  async getOrderById(@Param('id') id: string): Promise<AdminOrderResponseDto> {
    const order = await this.getOrderByIdUseCase.execute(id);
    return AdminOrderResponseDto.fromDomain(order);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تغییر وضعیت چرخه عمر سفارش (تأیید مالی، آماده‌سازی، تحویل، لغو)' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'وضعیت سفارش با موفقیت تغییر یافت.',
    type: AdminOrderResponseDto,
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusRequestDto,
  ): Promise<AdminOrderResponseDto> {
    const updated = await this.updateOrderStatusUseCase.execute(
      id,
      dto.status,
      dto.trackingCode,
      dto.carrier,
    );
    return AdminOrderResponseDto.fromDomain(updated);
  }

  @Patch(':id/shipping')
  @ApiOperation({ summary: 'تخصیص ناوگان حمل و نقل و کد رهگیری مرسوله' })
  @ApiParam({ name: 'id', description: 'شناسه سفارش' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'اطلاعات ناوگان مرسوله ثبت شد.',
    type: AdminOrderResponseDto,
  })
  async assignCarrier(
    @Param('id') id: string,
    @Body() dto: AssignCarrierRequestDto,
  ): Promise<AdminOrderResponseDto> {
    const updated = await this.assignOrderCarrierUseCase.execute(
      id,
      dto.carrier,
      dto.trackingCode,
    );
    return AdminOrderResponseDto.fromDomain(updated);
  }

  private async resolveUserId(
    req: AuthenticatedRequest,
    phoneNumber?: string,
  ): Promise<string> {
    // 1. Check logged in user token
    const tokenUserId = this.extractUserIdOptional(req);
    if (tokenUserId) {
      const existing = await this.userRepository.findById(tokenUserId);
      if (existing) return existing.id;
    }

    // 2. Check user by phone number
    if (phoneNumber) {
      const existingByPhone = await this.userRepository.findByPhone(phoneNumber);
      if (existingByPhone) return existingByPhone.id;
    }

    // 3. Fallback to existing admin user or create a user for this phone
    const defaultUserPhone = phoneNumber || '09121234567';
    let user = await this.userRepository.findByPhone(defaultUserPhone);
    if (!user) {
      user = new User({
        id: randomUUID(),
        name: 'کاربر سیستم',
        email: Email.create(`user_${Date.now()}@velox.local`),
        phone: PhoneNumber.create(defaultUserPhone),
        role: 'customer',
        status: 'active',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.save(user);
    }

    return user.id;
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
