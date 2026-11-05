import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import {
  UnifiedPaymentService,
  CreateGatewayConfigDto,
  UpdateGatewayConfigDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  UpdatePaymentSettingsDto,
} from '../../application/services/unified-payment.service.js';

@ApiTags('Admin Payment Gateway & Bank Account Management')
@Controller('admin/payments')
@UseGuards(OptionalAuthGuard)
export class AdminPaymentsController {
  constructor(private readonly unifiedPaymentService: UnifiedPaymentService) {}

  // ─── Gateway Endpoints ─────────────────────────────────────────

  @Get('gateways')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فهرست کلیه درگاه‌های پرداخت آنلاین' })
  async getGateways() {
    return this.unifiedPaymentService.getAdminGateways();
  }

  @Post('gateways')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'تعریف درگاه پرداخت جدید' })
  async createGateway(@Body() dto: CreateGatewayConfigDto) {
    return this.unifiedPaymentService.createGateway(dto);
  }

  @Put('gateways/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات یا وضعیت درگاه پرداخت' })
  @ApiParam({ name: 'id', description: 'شناسه درگاه پرداخت' })
  async updateGateway(
    @Param('id') id: string,
    @Body() dto: UpdateGatewayConfigDto,
  ) {
    return this.unifiedPaymentService.updateGateway(id, dto);
  }

  @Delete('gateways/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف درگاه پرداخت' })
  @ApiParam({ name: 'id', description: 'شناسه درگاه پرداخت' })
  async deleteGateway(@Param('id') id: string) {
    return this.unifiedPaymentService.deleteGateway(id);
  }

  // ─── Bank Account Endpoints ────────────────────────────────────

  @Get('bank-accounts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فهرست حساب‌های بانکی و شماره شبا جهت واریز دستی' })
  async getBankAccounts() {
    return this.unifiedPaymentService.getAdminBankAccounts();
  }

  @Post('bank-accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'تعریف حساب بانکی یا شماره کارت / شبا جدید' })
  async createBankAccount(@Body() dto: CreateBankAccountDto) {
    return this.unifiedPaymentService.createBankAccount(dto);
  }

  @Put('bank-accounts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات حساب بانکی یا شماره کارت / شبا' })
  @ApiParam({ name: 'id', description: 'شناسه حساب بانکی' })
  async updateBankAccount(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.unifiedPaymentService.updateBankAccount(id, dto);
  }

  @Delete('bank-accounts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف حساب بانکی' })
  @ApiParam({ name: 'id', description: 'شناسه حساب بانکی' })
  async deleteBankAccount(@Param('id') id: string) {
    return this.unifiedPaymentService.deleteBankAccount(id);
  }

  // ─── General Payment Settings Endpoints ────────────────────────

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تنظیمات عمومی پرداخت (سوئیچ سندباکس و روش‌های پرداخت)' })
  async getSettings() {
    return this.unifiedPaymentService.getAdminPaymentSettings();
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش تنظیمات عمومی پرداخت' })
  async updateSettings(@Body() dto: UpdatePaymentSettingsDto) {
    return this.unifiedPaymentService.updateAdminPaymentSettings(dto);
  }

  // ─── Bank Transfer & Card-to-Card Receipts ─────────────────────

  @Get('receipts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فهرست کلیه فیش‌های واریزی و تراکنش‌های کارت به کارت' })
  async getReceipts() {
    return this.unifiedPaymentService.getAdminReceipts();
  }

  @Post('receipts/:orderId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تایید فیش واریزی کارت به کارت و تایید نهایی سفارش' })
  @ApiParam({ name: 'orderId', description: 'شناسه یا شماره سفارش' })
  async approveReceipt(
    @Param('orderId') orderId: string,
    @Body() body?: { adminNotes?: string },
  ) {
    return this.unifiedPaymentService.approveOrderReceipt(orderId, body?.adminNotes);
  }

  @Post('receipts/:orderId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'رد فیش واریزی با ثبت علت جهت اطلاع مشتری' })
  @ApiParam({ name: 'orderId', description: 'شناسه یا شماره سفارش' })
  async rejectReceipt(
    @Param('orderId') orderId: string,
    @Body() body?: { reason?: string },
  ) {
    return this.unifiedPaymentService.rejectOrderReceipt(orderId, body?.reason);
  }
}
