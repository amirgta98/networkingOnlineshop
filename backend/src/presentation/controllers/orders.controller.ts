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
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { JwtSessionService } from '../../infrastructure/auth/jwt-session.service.js';
import {
  USER_REPOSITORY_TOKEN,
  ORDER_REPOSITORY_TOKEN,
  ORDER_NOTIFICATION_SERVICE_TOKEN,
} from '../../shared/constants/tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface.js';
import type { IOrderNotificationService } from '../../application/services/order-notification.service.interface.js';
import { User } from '../../domain/entities/user.entity.js';
import { Order, OrderItemEntity, OrderStatus } from '../../domain/entities/order.entity.js';
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
    @Inject(ORDER_REPOSITORY_TOKEN)
    private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_NOTIFICATION_SERVICE_TOKEN)
    private readonly orderNotificationService: IOrderNotificationService,
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
      affiliateCode: dto.affiliateCode,
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

  @Post('convert-rfq/:id')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'تبدیل استعلام قیمت (RFQ) به سفارش قطعی و ثبت پیش‌پرداخت' })
  @ApiParam({ name: 'id', description: 'شناسه یا شماره RFQ' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'سفارش با موفقیت ثبت گردید و به بخش سفارش‌ها افزوده شد.',
    type: AdminOrderResponseDto,
  })
  async convertRfqToOrder(
    @Param('id') id: string,
    @Body()
    body?: {
      prepaymentPercent?: number;
      paymentMethod?: string;
      notes?: string;
      shippingAddress?: any;
    },
  ): Promise<AdminOrderResponseDto> {
    const rfq = await this.userRepository.getRfqById(id);
    if (!rfq) {
      throw new BadRequestException(`استعلام با شناسه ${id} یافت نشد.`);
    }

    // 1. Update RFQ status to converted
    await this.userRepository.updateRfqStatus(id, 'converted');

    // 2. Prepare items for Order
    const mappedItems: OrderItemEntity[] = (rfq.items || []).map((it, idx) => {
      const unitPrice = it.unitPrice || 0;
      const quantity = it.requestedQty || 1;
      return new OrderItemEntity({
        id: randomUUID(),
        sku: it.sku || `SKU-RFQ-${idx + 1}`,
        title: it.title,
        brand: it.brand || 'Cisco',
        model: it.sku,
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
        warranty: 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
        serialNumbers: [],
      });
    });

    const finalAmount = rfq.finalQuotedAmount || rfq.estimatedValue || 0;
    const discountAmount = rfq.discountPercent
      ? Math.round((finalAmount * rfq.discountPercent) / 100)
      : 0;

    const orderNumber = `VX-RFQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder = new Order({
      id: randomUUID(),
      orderNumber,
      trackingCode,
      userId: rfq.userId,
      status: OrderStatus.PENDING_FINANCIAL,
      customerType: 'b2b',
      customerName: rfq.companyName || rfq.projectTitle || 'همکار سازمانی ققنوس',
      companyName: rfq.companyName || rfq.projectTitle,
      phoneNumber: rfq.clientPhone,
      totalAmount: finalAmount + discountAmount,
      discountAmount,
      vatTaxAmount: 0,
      payableAmount: finalAmount,
      paymentMethod: body?.paymentMethod || 'credit_line_b2b',
      shippingCost: 0,
      deliveryNotes: `سفارش استعلامی پروژه‌ای (کد: ${rfq.rfqNumber}) ${body?.notes ? `| ${body.notes}` : ''}`,
      shippingAddress: body?.shippingAddress || {
        city: 'تهران',
        province: 'تهران',
        fullAddress: rfq.projectLocation || 'سایت پروژه کارفرما',
        postalCode: '1111111111',
        recipientName: rfq.companyName || rfq.projectTitle,
        recipientPhone: rfq.clientPhone,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      items: mappedItems,
    });

    // 3. Save into OrderRepository
    const createdOrder = await this.orderRepository.create(newOrder, { decrementStock: false });

    // 4. Dispatch SMS & notification to Admin & Customer
    try {
      if (this.orderNotificationService) {
        await this.orderNotificationService.notifyAdminsOfNewOrder(createdOrder);
        await this.orderNotificationService.notifyCustomerOfNewOrder(createdOrder);
      }
    } catch (err) {
      console.warn('[OrdersController] Notification warning on RFQ order conversion:', err);
    }

    return AdminOrderResponseDto.fromDomain(createdOrder);
  }

  @Get('my')
  @UseGuards(OptionalAuthGuard)
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
      return [];
    }

    let orders = await this.getUserOrdersUseCase.execute(userId);
    if ((!orders || orders.length === 0) && req.user?.phone) {
      const phoneOrders = await this.getAllOrdersUseCase.execute({ search: req.user.phone });
      if (phoneOrders && phoneOrders.length > 0) {
        orders = phoneOrders;
      }
    }
    return orders.map((o) => AdminOrderResponseDto.fromDomain(o));
  }

  @Get('partner')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت تاریخچه سفارشات شرکتی و سازمانی همکار (B2B)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست سفارشات سازمانی همکار جاری',
    type: [AdminOrderResponseDto],
  })
  async getPartnerOrders(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<AdminOrderResponseDto[]> {
    const userRole = (req.user?.role || '').toLowerCase();
    const userId = req.user?.sub;
    const phone = req.user?.phone;

    let orders: Order[] = [];

    if (userRole === 'admin' || userRole === 'super_admin') {
      orders = await this.getAllOrdersUseCase.execute({
        customerType: 'b2b',
        status,
        search,
      });
      if (orders.length === 0 && userId) {
        const myOrders = await this.getUserOrdersUseCase.execute(userId);
        if (myOrders && myOrders.length > 0) {
          orders = myOrders;
        }
      }
    } else if (userId) {
      orders = await this.getUserOrdersUseCase.execute(userId);
      if ((!orders || orders.length === 0) && phone) {
        orders = await this.getAllOrdersUseCase.execute({ search: phone });
      }
      if (!orders || orders.length === 0) {
        orders = await this.getAllOrdersUseCase.execute({ customerType: 'b2b' });
      }
    } else {
      orders = await this.getAllOrdersUseCase.execute({ customerType: 'b2b' });
    }

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status.toUpperCase() === status.toUpperCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      orders = orders.filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.trackingCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.companyName && o.companyName.toLowerCase().includes(q)) ||
        o.phoneNumber.includes(q)
      );
    }

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
