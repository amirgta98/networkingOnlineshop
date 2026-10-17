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
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetShippingMethodsUseCase } from '../../application/use-cases/shipping/get-shipping-methods.use-case.js';
import { GetDeliveryScheduleUseCase } from '../../application/use-cases/shipping/get-delivery-schedule.use-case.js';
import { CalculateShippingUseCase } from '../../application/use-cases/shipping/calculate-shipping.use-case.js';
import { ManageShippingMethodsUseCase } from '../../application/use-cases/shipping/manage-shipping-methods.use-case.js';
import { ManageShippingConfigUseCase } from '../../application/use-cases/shipping/manage-shipping-config.use-case.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from '../../shared/constants/tokens.js';
import type { IImageProcessingService } from '../../application/services/image-processing.service.interface.js';
import {
  CreateShippingMethodRequestDto,
  UpdateShippingMethodRequestDto,
  CreateTimeSlotRequestDto,
  UpdateTimeSlotRequestDto,
  UpdateShippingConfigRequestDto,
  CalculateShippingRequestDto,
} from '../dto/request/shipping/shipping.request.dto.js';
import {
  ShippingMethodResponseDto,
  DeliveryTimeSlotResponseDto,
  DeliveryScheduleDayResponseDto,
  ShippingConfigResponseDto,
} from '../dto/response/shipping/shipping.response.dto.js';

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Shipping & Delivery')
@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly getShippingMethodsUseCase: GetShippingMethodsUseCase,
    private readonly getDeliveryScheduleUseCase: GetDeliveryScheduleUseCase,
    private readonly calculateShippingUseCase: CalculateShippingUseCase,
    private readonly manageShippingMethodsUseCase: ManageShippingMethodsUseCase,
    private readonly manageShippingConfigUseCase: ManageShippingConfigUseCase,
    @Inject(IMAGE_PROCESSING_SERVICE_TOKEN)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  // ==========================================
  // 1. PUBLIC CHECKOUT ENDPOINTS
  // ==========================================

  @Get('methods')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت شیوه‌های ارسال فعال بر اساس استان مقصد' })
  @ApiQuery({ name: 'province', required: false, description: 'استان مقصد خریدار' })
  @ApiQuery({ name: 'subtotal', required: false, description: 'جمع کل اقلام سبد خرید' })
  @ApiQuery({ name: 'includeRestricted', required: false, description: 'آیا روش‌های غیرمجاز استان بازگردانده شوند؟' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست شیوه‌های ارسال فعال',
    type: [ShippingMethodResponseDto],
  })
  async getAvailableMethods(
    @Query('province') province?: string,
    @Query('subtotal') subtotalStr?: string,
    @Query('includeRestricted') includeRestrictedStr?: string,
  ): Promise<ShippingMethodResponseDto[]> {
    const subtotal = subtotalStr ? parseFloat(subtotalStr) : undefined;
    const includeRestricted = includeRestrictedStr === 'true' || includeRestrictedStr === '1';
    const methods = await this.getShippingMethodsUseCase.execute({
      province,
      subtotal,
      includeInactive: false,
      includeRestricted,
    });
    return methods.map((m) => ShippingMethodResponseDto.fromDomain(m, province));
  }

  @Get('schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تقویم روزها و بازه‌های زمانی مجاز تحویل مرسوله' })
  @ApiQuery({ name: 'province', required: false, description: 'استان مقصد' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تقویم روزهای آینده با بازه‌های زمانی تحویل',
    type: [DeliveryScheduleDayResponseDto],
  })
  async getDeliverySchedule(
    @Query('province') province?: string,
  ): Promise<DeliveryScheduleDayResponseDto[]> {
    const days = await this.getDeliveryScheduleUseCase.execute(province);
    return days.map(DeliveryScheduleDayResponseDto.fromDomain);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'محاسبه هزینه و سقف ارسال رایگان برای یک روش' })
  @ApiResponse({ status: HttpStatus.OK, description: 'نتیجه محاسبه هزینه ارسال' })
  async calculateShipping(@Body() dto: CalculateShippingRequestDto) {
    return this.calculateShippingUseCase.execute({
      methodId: dto.methodId,
      subtotal: dto.subtotal,
      province: dto.province,
    });
  }

  // ==========================================
  // 2. ADMIN MANAGEMENT ENDPOINTS
  // ==========================================

  @Get('admin/methods')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تمامی شیوه‌های ارسال (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست کامل شیوه‌های ارسال (فعال و غیرفعال)',
    type: [ShippingMethodResponseDto],
  })
  async getAllMethodsAdmin(): Promise<ShippingMethodResponseDto[]> {
    const methods = await this.getShippingMethodsUseCase.execute({ includeInactive: true });
    return methods.map((m) => ShippingMethodResponseDto.fromDomain(m));
  }

  @Post('admin/methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد شیوه ارسال جدید (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'شیوه ارسال جدید با موفقیت ایجاد شد',
    type: ShippingMethodResponseDto,
  })
  async createMethod(
    @Body() dto: CreateShippingMethodRequestDto,
  ): Promise<ShippingMethodResponseDto> {
    const created = await this.manageShippingMethodsUseCase.create(dto);
    return ShippingMethodResponseDto.fromDomain(created);
  }

  @Put('admin/methods/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش شیوه ارسال (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه روش ارسال' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'شیوه ارسال ویرایش گردید',
    type: ShippingMethodResponseDto,
  })
  async updateMethod(
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodRequestDto,
  ): Promise<ShippingMethodResponseDto> {
    const updated = await this.manageShippingMethodsUseCase.update(id, dto);
    return ShippingMethodResponseDto.fromDomain(updated);
  }

  @Post('admin/upload-icon')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود آیکون یا لوگوی اختصاصی شیوه ارسال (بدون واترمارک)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadCarrierIcon(
    @UploadedFile() file: UploadedMulterFile,
  ): Promise<{ filename: string; originalName: string; url: string; size: number }> {
    if (!file) {
      throw new BadRequestException('فایل آیکون یا لوگوی حامل ارسال نشده است.');
    }

    return await this.imageProcessingService.processAndSaveCarrierIcon(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete('admin/upload-icon/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف آیکون یا تصویر آپلودشده حامل' })
  async deleteCarrierIcon(@Param('filename') filename: string): Promise<{ success: boolean }> {
    const success = await this.imageProcessingService.deleteCarrierIcon(filename);
    return { success };
  }

  @Delete('admin/methods/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف شیوه ارسال (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه روش ارسال' })
  @ApiResponse({ status: HttpStatus.OK, description: 'شیوه ارسال حذف شد' })
  async deleteMethod(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.manageShippingMethodsUseCase.delete(id);
    return { success };
  }

  @Patch('admin/methods/:id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر وضعیت فعال/غیرفعال شیوه ارسال (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه روش ارسال' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'وضعیت روش ارسال بروزرسانی گردید',
    type: ShippingMethodResponseDto,
  })
  async toggleMethod(@Param('id') id: string): Promise<ShippingMethodResponseDto> {
    const toggled = await this.manageShippingMethodsUseCase.toggle(id);
    return ShippingMethodResponseDto.fromDomain(toggled);
  }

  @Get('admin/config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تنظیمات زمان‌بندی و تقویم ارسال (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تنظیمات زمان‌بندی ناوگان',
    type: ShippingConfigResponseDto,
  })
  async getConfig(): Promise<ShippingConfigResponseDto> {
    const config = await this.manageShippingConfigUseCase.getConfig();
    return ShippingConfigResponseDto.fromDomain(config);
  }

  @Put('admin/config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بروزرسانی تنظیمات زمان‌بندی ارسال (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تنظیمات با موفقیت بروزرسانی شد',
    type: ShippingConfigResponseDto,
  })
  async updateConfig(
    @Body() dto: UpdateShippingConfigRequestDto,
  ): Promise<ShippingConfigResponseDto> {
    const updated = await this.manageShippingConfigUseCase.updateConfig(dto);
    return ShippingConfigResponseDto.fromDomain(updated);
  }

  @Get('admin/slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تمامی بازه‌های زمانی تحویل (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست بازه‌های زمانی تحویل',
    type: [DeliveryTimeSlotResponseDto],
  })
  async getAllTimeSlots(): Promise<DeliveryTimeSlotResponseDto[]> {
    const slots = await this.manageShippingConfigUseCase.getAllTimeSlots(true);
    return slots.map(DeliveryTimeSlotResponseDto.fromDomain);
  }

  @Post('admin/slots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد بازه زمانی جدید برای تحویل (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'بازه زمانی با موفقیت تعریف شد',
    type: DeliveryTimeSlotResponseDto,
  })
  async createTimeSlot(
    @Body() dto: CreateTimeSlotRequestDto,
  ): Promise<DeliveryTimeSlotResponseDto> {
    const created = await this.manageShippingConfigUseCase.createTimeSlot(dto);
    return DeliveryTimeSlotResponseDto.fromDomain(created);
  }

  @Put('admin/slots/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش بازه زمانی تحویل (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه بازه زمانی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'بازه زمانی تحویل بروزرسانی شد',
    type: DeliveryTimeSlotResponseDto,
  })
  async updateTimeSlot(
    @Param('id') id: string,
    @Body() dto: UpdateTimeSlotRequestDto,
  ): Promise<DeliveryTimeSlotResponseDto> {
    const updated = await this.manageShippingConfigUseCase.updateTimeSlot(id, dto);
    return DeliveryTimeSlotResponseDto.fromDomain(updated);
  }

  @Delete('admin/slots/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف بازه زمانی تحویل (پنل مدیریت)' })
  @ApiParam({ name: 'id', description: 'شناسه بازه زمانی' })
  @ApiResponse({ status: HttpStatus.OK, description: 'بازه زمانی حذف گردید' })
  async deleteTimeSlot(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.manageShippingConfigUseCase.deleteTimeSlot(id);
    return { success };
  }

  @Get('admin/dispatch-overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'نمای اجمالی ناوگان، تقویم و ظرفیت توزیع (پنل مدیریت)' })
  async getDispatchOverview() {
    const schedule = await this.getDeliveryScheduleUseCase.execute();
    const methods = await this.getShippingMethodsUseCase.execute({ includeInactive: true });
    const config = await this.manageShippingConfigUseCase.getConfig();

    const activeMethodsCount = methods.filter((m) => m.isActive).length;
    const expressMethodsCount = methods.filter((m) => m.isExpress).length;

    return {
      activeMethodsCount,
      totalMethodsCount: methods.length,
      expressMethodsCount,
      sameDayCutoffHour: config.sameDayCutoffHour,
      daysInAdvance: config.daysInAdvance,
      scheduleOverview: schedule.slice(0, 5),
    };
  }
}
