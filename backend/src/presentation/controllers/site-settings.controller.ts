import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SiteSettingsService } from '../../application/services/site-settings/site-settings.service.js';
import { SiteContactSettingsDto } from '../../application/dto/site-settings/site-contact-settings.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';

@ApiTags('Site Contact & Social Media Settings (Public)')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'دریافت عمومی اطلاعات تماس، خطوط تلفن و شبکه‌های اجتماعی سایت',
    description: 'بدون نیاز به توکن احراز هویت؛ برای نمایش داینامیک در هدر، فوتر، صفحات درباره ما و استخدام.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تنظیمات تماس سایت با موفقیت دریافت شد.',
  })
  async getPublicContactSettings() {
    return this.siteSettingsService.getContactSettings();
  }
}

@ApiTags('Admin Site Contact Settings')
@Controller('admin/site-settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminSiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'دریافت کامل تنظیمات تماس و شبکه‌های اجتماعی برای پنل ادمین',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تنظیمات تماس سایت جهت ویرایش در پنل مدیریت دریافت شد.',
  })
  async getAdminContactSettings() {
    return this.siteSettingsService.getContactSettings();
  }

  @Put('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'بروزرسانی اطلاعات تماس، شبکه‌های اجتماعی و آدرس سایت توسط مدیر',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تنظیمات تماس و شبکه‌های اجتماعی با موفقیت ذخیره گردید.',
  })
  async updateContactSettings(@Body() dto: SiteContactSettingsDto) {
    return this.siteSettingsService.updateContactSettings(dto);
  }
}
