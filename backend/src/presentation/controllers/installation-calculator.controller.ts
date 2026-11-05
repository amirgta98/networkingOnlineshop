import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import {
  InstallationCalculatorService,
  CalculatorItem,
  CalculatorSettings,
} from '../../application/services/installation-calculator.service.js';

@ApiTags('Installation Calculator & Requirements Customization')
@Controller('installation')
export class InstallationCalculatorController {
  constructor(private readonly calculatorService: InstallationCalculatorService) {}

  // ─── Public Endpoints ─────────────────────────────────────────

  @Get('calculator/config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت نیازمندی‌ها، شمارنده‌ها و فرمول محاسبه‌گر آنلاین' })
  async getPublicConfig() {
    return this.calculatorService.getPublicConfig();
  }

  // ─── Admin Endpoints ──────────────────────────────────────────

  @Get('admin/calculator/items')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت تمام نیازمندی‌های محاسبه‌گر همراه با جزئیات اتصال به فروشگاه' })
  async getAdminConfig() {
    return this.calculatorService.getAdminConfig();
  }

  @Get('admin/calculator/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت تنظیمات سراسری محاسبه‌گر (ضرایب، حداقل هزینه، زمان‌بندی)' })
  async getSettings() {
    const config = await this.calculatorService.getAdminConfig();
    return config.settings;
  }

  @Put('admin/calculator/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش تنظیمات سراسری محاسبه‌گر' })
  async updateSettings(@Body() dto: Partial<CalculatorSettings>) {
    return this.calculatorService.updateSettings(dto);
  }

  @Post('admin/calculator/items')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن نیازمندی جدید به محاسبه‌گر (اسلایدر، نامبریک، گزینه‌ای، چک‌باکس)' })
  async createItem(@Body() dto: Partial<CalculatorItem>) {
    return this.calculatorService.createItem(dto);
  }

  @Put('admin/calculator/items/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش مشخصات، نوع شمارنده یا اتصال محصول یک نیازمندی' })
  @ApiParam({ name: 'id', description: 'شناسه آیتم محاسبه‌گر' })
  async updateItem(@Param('id') id: string, @Body() dto: Partial<CalculatorItem>) {
    return this.calculatorService.updateItem(id, dto);
  }

  @Delete('admin/calculator/items/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف یک نیازمندی از محاسبه‌گر' })
  @ApiParam({ name: 'id', description: 'شناسه آیتم محاسبه‌گر' })
  async deleteItem(@Param('id') id: string) {
    return this.calculatorService.deleteItem(id);
  }

  @Patch('admin/calculator/items/reorder')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مرتب‌سازی ترتیب نمایش نیازمندی‌های محاسبه‌گر' })
  async reorderItems(@Body() body: { orderedIds: string[] }) {
    return this.calculatorService.reorderItems(body?.orderedIds || []);
  }

  @Post('admin/calculator/reset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'بازنشانی محاسبه‌گر به تنظیمات و نیازمندی‌های پیش‌فرض کارخانه' })
  async resetToDefaults() {
    return this.calculatorService.resetToDefaults();
  }

  @Get('admin/calculator/search-products')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جستجوی کالاهای فروشگاه جهت اتصال به قیمت واحد نیازمندی' })
  @ApiQuery({ name: 'q', required: false, description: 'کلمه کلیدی نام یا SKU' })
  async searchProducts(@Query('q') query?: string) {
    return this.calculatorService.searchStoreProducts(query);
  }
}
