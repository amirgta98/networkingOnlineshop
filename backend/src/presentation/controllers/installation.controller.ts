import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import {
  InstallationService,
  CreateInstallationDto,
  UpdateInstallationDto,
  InstallationQueryDto,
} from '../../application/services/installation.service.js';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Installation & Engineering Services')
@Controller('installation')
export class InstallationController {
  constructor(private readonly installationService: InstallationService) {}

  // ─── Public Endpoints ─────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'ثبت درخواست جدید نصب، کابل‌کشی و راه‌اندازی شبکه' })
  async createRequest(@Body() dto: CreateInstallationDto, @Request() req: any) {
    const userId = req?.user?.sub || null;
    return this.installationService.createRequest(dto, userId);
  }

  @Get('user-requests')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت لیست درخواست‌های نصب متعلق به کاربر جاری' })
  async getUserRequests(@Request() req: any, @Query('phone') phone?: string) {
    const userId = req?.user?.sub || null;
    const userPhone = req?.user?.phone || phone || null;
    return this.installationService.getUserRequests(userId, userPhone);
  }

  @Get('track/:trackingCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'رهگیری عمومی وضعیت درخواست با کد رهگیری یکتا' })
  @ApiParam({ name: 'trackingCode', description: 'کد رهگیری مثال: NET-INST-4921' })
  async trackByCode(@Param('trackingCode') trackingCode: string) {
    return this.installationService.trackByCode(trackingCode);
  }

  @Get('services')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت کاتالوگ خدمات و استانداردهای نصب پسیو شبکه' })
  async getServices() {
    return [
      {
        id: 'cabling',
        title: 'کابل‌کشی ساختاریافته و پسیو شبکه',
        badge: 'استاندارد TIA-568-D',
        standard: 'TIA/EIA 568-D & ISO/IEC 11801',
        warrantyMonths: 18,
        basePriceEstimate: 145000,
        unit: 'به ازای هر نود یا متر ترانک',
      },
      {
        id: 'datacenter',
        title: 'آرایش رک و راه‌اندازی اتاق سرور و دیتاسنتر',
        badge: 'تضمین TIA-942',
        standard: 'TIA-942 Datacenter Infrastructure Standard',
        warrantyMonths: 24,
        basePriceEstimate: 3800000,
        unit: 'به ازای هر یونیت / رک کامل',
      },
      {
        id: 'cctv',
        title: 'نصب و راه‌اندازی دوربین‌های مداربسته تحت شبکه (CCTV)',
        badge: 'نظارت هوشمند 4K',
        standard: 'ONVIF Profile S/G/T & H.265+ Smart Codec',
        warrantyMonths: 18,
        basePriceEstimate: 290000,
        unit: 'به ازای هر دوربین + تنظیم NVR',
      },
      {
        id: 'wireless',
        title: 'شبکه بی‌سیم سازمانی و اکسس‌پوینت‌های Wi-Fi 6',
        badge: 'پوشش سراسری رادیویی',
        standard: 'IEEE 802.11ax (Wi-Fi 6) & 802.11k/v/r',
        warrantyMonths: 18,
        basePriceEstimate: 420000,
        unit: 'به ازای هر اکسس‌پوینت یا لینک دکل',
      },
      {
        id: 'switching',
        title: 'پیکربندی سوئیچینگ، روتینگ و امنیت شبکه سیسکو و میکروتیک',
        badge: 'سطح مهندسی CCNP',
        standard: 'Cisco Enterprise Best Practices & NIST SP 800-41',
        warrantyMonths: 12,
        basePriceEstimate: 1650000,
        unit: 'به ازای هر دستگاه سوئیچ یا روتر',
      },
      {
        id: 'fiber',
        title: 'فیوژن، مفصل‌بندی و تست OTDR فیبر نوری',
        badge: 'تلفات زیر ۰.۰۲dB',
        standard: 'ITU-T G.652.D / G.657 & IEC 60793',
        warrantyMonths: 24,
        basePriceEstimate: 180000,
        unit: 'به ازای هر کور فیوژن یا تست رفلکتومتری',
      },
      {
        id: 'ups-power',
        title: 'سیستم‌های برق اضطراری، یو‌پی‌اس (UPS) و کابل‌کشی تابلو برق',
        badge: 'برق دائم و ایزوله',
        standard: 'IEC 62040 & IEEE 1100 (Emerald Book)',
        warrantyMonths: 12,
        basePriceEstimate: 2400000,
        unit: 'به ازای هر باتری‌بانک یا دستگاه UPS رکمونت',
      },
      {
        id: 'other',
        title: 'مشاوره، نظارت و خدمات اختصاصی زیرساخت شبکه',
        badge: 'پشتیبانی سازمانی',
        standard: 'BICSI RCDD Telecommunications Standards',
        warrantyMonths: 12,
        basePriceEstimate: 2500000,
        unit: 'جلسه مشاوره / روز نظارت کارگاهی',
      },
    ];
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود نقشه یا فایل ضمیمه پروژه (حداکثر ۱۵ مگابایت)' })
  async uploadAttachment(@UploadedFile() file: UploadedMulterFile) {
    if (!file) {
      throw new BadRequestException('هیچ فایلی برای آپلود انتخاب نشده است.');
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new BadRequestException('حجم فایل ارسالی بیش از ۱۵ مگابایت است.');
    }

    const uploadsBase = fs.existsSync(path.resolve(process.cwd(), 'backend'))
      ? path.resolve(process.cwd(), 'backend', 'uploads')
      : path.resolve(process.cwd(), 'uploads');

    const installDir = path.join(uploadsBase, 'installation');
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    const safeExt = path.extname(file.originalname).toLowerCase() || '.bin';
    const uniqueFilename = `inst-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`;
    const destinationPath = path.join(installDir, uniqueFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);

    return {
      url: `/uploads/installation/${uniqueFilename}`,
      filename: uniqueFilename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // ─── Admin Endpoints ──────────────────────────────────────────

  @Get('admin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'مدیریت و مشاهده تمام درخواست‌های نصب (پنل ادمین)' })
  async getAdminRequests(@Query() query: InstallationQueryDto) {
    return this.installationService.findAll(query);
  }

  @Get('admin/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'آمار، درآمد برآوردی و شاخص‌های پروژه‌های پسیو (پنل ادمین)' })
  async getAdminStats() {
    return this.installationService.getAdminStats();
  }

  @Get('admin/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت جزئیات کامل درخواست نصب با شناسه یکتا' })
  @ApiParam({ name: 'id', description: 'شناسه UUID درخواست' })
  async getAdminRequestById(@Param('id') id: string) {
    return this.installationService.findById(id);
  }

  @Patch('admin/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'بروزرسانی مشخصات، وضعیت یا تخصیص کارشناس درخواست نصب' })
  @ApiParam({ name: 'id', description: 'شناسه UUID درخواست' })
  async updateAdminRequest(
    @Param('id') id: string,
    @Body() dto: UpdateInstallationDto,
  ) {
    return this.installationService.updateRequest(id, dto);
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'حذف درخواست نصب از سیستم' })
  @ApiParam({ name: 'id', description: 'شناسه UUID درخواست' })
  async deleteAdminRequest(@Param('id') id: string) {
    return this.installationService.deleteRequest(id);
  }
}
