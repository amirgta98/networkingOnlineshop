import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import {
  InternetService,
  CreateInternetPlanDto,
  UpdateInternetPlanDto,
  CalculateInternetCostDto,
  CreateInternetOrderDto,
  UpdateInternetOrderStatusDto,
  InternetOrderQueryDto,
} from '../../application/services/internet.service.js';

@ApiTags('Internet & Static IP Subsystem')
@Controller('internet')
export class InternetController {
  constructor(private readonly internetService: InternetService) {}

  // ─── Public Endpoints ─────────────────────────────────────────

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت فهرست پلن‌های فعال اینترنت سازمانی' })
  async getActivePlans() {
    return this.internetService.getActivePlans();
  }

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تعرفه‌های پایه (IP استاتیک، مودم، نصب)' })
  async getSettings() {
    return this.internetService.getPublicSettings();
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'محاسبه دقیق هزینه پلن، تخفیف دوره و گزینه‌های جانبی' })
  async calculateCost(@Body() dto: CalculateInternetCostDto) {
    return this.internetService.calculateCost(dto);
  }

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'ثبت سفارش جدید اینترنت سازمانی' })
  async createOrder(@Body() dto: CreateInternetOrderDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.internetService.createOrder(dto, userId, req.user);
  }

  @Get('orders/my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'مشاهده سفارش‌های اینترنت کاربر جاری' })
  async getMyOrders(@Request() req: any) {
    const userId = req.user.sub;
    return this.internetService.getMyOrders(userId);
  }

  @Get('orders/track/:trackingCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'رهگیری عمومی سفارش اینترنت با کد پیگیری' })
  @ApiParam({ name: 'trackingCode', description: 'کد رهگیری سفارش' })
  async trackOrder(@Param('trackingCode') trackingCode: string) {
    return this.internetService.trackOrderByCode(trackingCode);
  }
}

@ApiTags('Internet Admin Management')
@Controller('admin/internet')
export class AdminInternetController {
  constructor(private readonly internetService: InternetService) {}

  // ─── Plans Management ─────────────────────────────────────────

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'دریافت کلیه پلن‌های اینترنت (فعال و غیرفعال)' })
  async getAllPlans() {
    return this.internetService.getAllPlans();
  }

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'ایجاد پلن جدید اینترنت' })
  async createPlan(@Body() dto: CreateInternetPlanDto) {
    return this.internetService.createPlan(dto);
  }

  @Get('plans/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'دریافت جزئیات یک پلن' })
  @ApiParam({ name: 'id', description: 'شناسه UUID پلن' })
  async getPlanById(@Param('id') id: string) {
    return this.internetService.getPlanById(id);
  }

  @Put('plans/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'ویرایش مشخصات پلن اینترنت' })
  @ApiParam({ name: 'id', description: 'شناسه UUID پلن' })
  async updatePlan(@Param('id') id: string, @Body() dto: UpdateInternetPlanDto) {
    return this.internetService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'حذف یا غیرفعال‌سازی پلن اینترنت' })
  @ApiParam({ name: 'id', description: 'شناسه UUID پلن' })
  async deletePlan(@Param('id') id: string) {
    return this.internetService.deletePlan(id);
  }

  @Patch('plans/:id/toggle')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'فعال/غیرفعال کردن سریع پلن' })
  @ApiParam({ name: 'id', description: 'شناسه UUID پلن' })
  async togglePlan(@Param('id') id: string) {
    return this.internetService.togglePlanActive(id);
  }

  @Patch('plans/:id/featured')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'تغییر وضعیت برگزیده (Featured) پلن' })
  @ApiParam({ name: 'id', description: 'شناسه UUID پلن' })
  async toggleFeatured(@Param('id') id: string) {
    return this.internetService.togglePlanFeatured(id);
  }

  // ─── Settings Management ──────────────────────────────────────

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'مشاهده تنظیمات و تعرفه‌های پایه سیستم اینترنت' })
  async getSettings() {
    return this.internetService.getAdminSettings();
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'بروزرسانی نرخ‌های پایه اینترنت و IP استاتیک' })
  async updateSettings(@Body() body: Record<string, string | number>) {
    return this.internetService.updateAdminSettings(body);
  }

  // ─── Orders Management ────────────────────────────────────────

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'لیست سفارش‌های اینترنت با فیلتر وضعیت و جستجو' })
  async getOrders(@Query() query: InternetOrderQueryDto) {
    return this.internetService.getAllOrders(query);
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'جزئیات سفارش اینترنت بر اساس شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه UUID سفارش' })
  async getOrderById(@Param('id') id: string) {
    return this.internetService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin')
  @ApiOperation({ summary: 'تغییر وضعیت سفارش اینترنت (تایید/فعال‌سازی یا لغو)' })
  @ApiParam({ name: 'id', description: 'شناسه UUID سفارش' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInternetOrderStatusDto,
  ) {
    return this.internetService.updateOrderStatus(id, dto.status);
  }
}
