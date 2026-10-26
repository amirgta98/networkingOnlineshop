import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import {
  GetAffiliateSettingsUseCase,
  UpdateAffiliateSettingsUseCase,
} from '../../application/use-cases/affiliate/affiliate-settings.use-case.js';
import {
  GetAffiliatePartnersUseCase,
  GetAffiliatePartnerByIdUseCase,
  GetAffiliatePartnerByUserIdUseCase,
  UpdateAffiliatePartnerUseCase,
  ResetPartnerDefaultsUseCase,
  RegisterAffiliatePartnerUseCase,
} from '../../application/use-cases/affiliate/affiliate-partners.use-case.js';
import {
  GetAffiliateCommissionsUseCase,
  UpdateCommissionStatusUseCase,
  CreateAffiliatePayoutUseCase,
  GetAffiliatePayoutsUseCase,
} from '../../application/use-cases/affiliate/affiliate-commissions.use-case.js';
import {
  AffiliateCalculationService,
} from '../../application/use-cases/affiliate/affiliate-calculation.use-case.js';
import {
  UpdateAffiliateSettingsDto,
  UpdatePartnerDto,
  RegisterPartnerDto,
  CreatePayoutDto,
  UpdateCommissionStatusDto,
} from '../../application/dto/affiliate/affiliate.dto.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';

@ApiTags('Affiliates & Partners')
@Controller()
export class AffiliateController {
  constructor(
    private readonly getSettingsUseCase: GetAffiliateSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateAffiliateSettingsUseCase,
    private readonly getPartnersUseCase: GetAffiliatePartnersUseCase,
    private readonly getPartnerByIdUseCase: GetAffiliatePartnerByIdUseCase,
    private readonly getPartnerByUserIdUseCase: GetAffiliatePartnerByUserIdUseCase,
    private readonly updatePartnerUseCase: UpdateAffiliatePartnerUseCase,
    private readonly resetDefaultsUseCase: ResetPartnerDefaultsUseCase,
    private readonly registerPartnerUseCase: RegisterAffiliatePartnerUseCase,
    private readonly getCommissionsUseCase: GetAffiliateCommissionsUseCase,
    private readonly updateCommissionStatusUseCase: UpdateCommissionStatusUseCase,
    private readonly createPayoutUseCase: CreateAffiliatePayoutUseCase,
    private readonly getPayoutsUseCase: GetAffiliatePayoutsUseCase,
    private readonly calculationService: AffiliateCalculationService,
  ) {}

  // ─── Public & Shop Endpoints ──────────────────────────────────────────

  @Get('affiliates/public-settings')
  @ApiOperation({ summary: 'دریافت تنظیمات عمومی سیستم همکاری برای فرانت‌اند فروشگاه' })
  async getPublicSettings() {
    const settings = await this.getSettingsUseCase.execute();
    return {
      isAffiliateSystemEnabled: settings.isAffiliateSystemEnabled,
      isProductDiscountEnabled: settings.isProductDiscountEnabled,
      defaultDiscountPercent: settings.defaultDiscountPercent,
      defaultStaticIpCommission: settings.defaultStaticIpCommission,
      defaultInternetCommission: settings.defaultInternetCommission,
      eligibleProductIds: settings.eligibleProductIds,
      eligibleCategoryIds: settings.eligibleCategoryIds,
    };
  }

  @Get('affiliates/my-profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت مشخصات و نرخ‌های اختصاصی همکار جاری' })
  async getMyProfile(@Req() req: Request & { user: { sub: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('کاربر احراز هویت نشده است.');
    }
    const partner = await this.getPartnerByUserIdUseCase.execute(userId);
    const settings = await this.getSettingsUseCase.execute();

    if (!partner) {
      return {
        isPartner: false,
        settings: {
          defaultDiscountPercent: settings.defaultDiscountPercent,
        },
      };
    }

    return {
      isPartner: true,
      partner: partner.toJSON(),
      effectiveDiscountPercent: partner.getEffectiveDiscountPercent(settings.defaultDiscountPercent),
      effectiveStaticIpCommission: partner.getEffectiveStaticIpCommission(settings.defaultStaticIpCommission),
      effectiveInternetCommission: partner.getEffectiveInternetCommission(settings.defaultInternetCommission),
    };
  }

  @Post('affiliates/register')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ثبت درخواست فعال‌سازی حساب همکاری برای کاربر جاری' })
  async registerMyPartnerAccount(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: { notes?: string },
  ) {
    const userId = req.user?.sub;
    const partner = await this.registerPartnerUseCase.execute({
      userId,
      notes: body.notes,
    });
    return partner.toJSON();
  }

  @Post('affiliates/evaluate-discount')
  @ApiOperation({ summary: 'اعتبارسنجی و محاسبه تخفیف همکاری سمت سرور' })
  async evaluateDiscount(
    @Body()
    body: {
      userId?: string;
      partnerCode?: string;
      items: Array<{
        productId?: string;
        categoryId?: string;
        sku?: string;
        title?: string;
        price: number;
        originalPrice?: number;
        discountPercent?: number;
        hasTieredDiscount?: boolean;
        quantity: number;
      }>;
    },
  ) {
    let partner = null;
    if (body.partnerCode) {
      // Find partner by code
      const list = await this.getPartnersUseCase.execute({ search: body.partnerCode, take: 1 });
      partner = list.items.find((p) => p.partnerCode.toUpperCase() === body.partnerCode?.trim().toUpperCase()) || null;
    } else if (body.userId) {
      partner = await this.getPartnerByUserIdUseCase.execute(body.userId);
    }

    const settings = await this.getSettingsUseCase.execute();
    const results = [];
    let totalDiscount = 0;

    for (const item of body.items || []) {
      const evaluation = await this.calculationService.evaluateProductAffiliateDiscount(item, partner, settings);
      const itemTotalDiscount = evaluation.discountAmount * item.quantity;
      totalDiscount += itemTotalDiscount;
      results.push({
        ...evaluation,
        itemDiscountTotal: itemTotalDiscount,
        quantity: item.quantity,
      });
    }

    return {
      isPartner: Boolean(partner && partner.status === 'ACTIVE'),
      partnerCode: partner?.partnerCode,
      totalAffiliateDiscount: totalDiscount,
      items: results,
    };
  }

  // ─── Admin Management Endpoints ───────────────────────────────────────

  @Get('admin/affiliates/settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت تنظیمات عمومی همکاری (پنل ادمین)' })
  async getAdminSettings() {
    const settings = await this.getSettingsUseCase.execute();
    return settings.toJSON();
  }

  @Put('admin/affiliates/settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'بروزرسانی قوانین و مقادیر پیش‌فرض همکاری' })
  async updateAdminSettings(@Body() dto: UpdateAffiliateSettingsDto) {
    const settings = await this.updateSettingsUseCase.execute(dto);
    return settings.toJSON();
  }

  @Get('admin/affiliates/partners')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'فهرست همکاران ثبت‌شده' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getPartners(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const result = await this.getPartnersUseCase.execute({
      search,
      status: status as any,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
    return {
      items: result.items.map((p) => p.toJSON()),
      total: result.total,
    };
  }

  @Get('admin/affiliates/partners/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات کامل همکار' })
  @ApiParam({ name: 'id', description: 'شناسه همکار' })
  async getPartnerById(@Param('id') id: string) {
    const partner = await this.getPartnerByIdUseCase.execute(id);
    if (!partner) {
      throw new NotFoundException(`همکار با شناسه ${id} یافت نشد.`);
    }
    const settings = await this.getSettingsUseCase.execute();
    return {
      ...partner.toJSON(),
      effectiveDiscountPercent: partner.getEffectiveDiscountPercent(settings.defaultDiscountPercent),
      effectiveStaticIpCommission: partner.getEffectiveStaticIpCommission(settings.defaultStaticIpCommission),
      effectiveInternetCommission: partner.getEffectiveInternetCommission(settings.defaultInternetCommission),
      isUsingDefaultDiscount: partner.customDiscountPercent === null || partner.customDiscountPercent === undefined,
      isUsingDefaultStaticIpCommission:
        partner.customStaticIpCommission === null || partner.customStaticIpCommission === undefined,
      isUsingDefaultInternetCommission:
        partner.customInternetCommission === null || partner.customInternetCommission === undefined,
    };
  }

  @Put('admin/affiliates/partners/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش مقادیر اختصاصی و وضعیت همکار' })
  @ApiParam({ name: 'id', description: 'شناسه همکار' })
  async updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    const partner = await this.updatePartnerUseCase.execute(id, dto);
    return partner.toJSON();
  }

  @Post('admin/affiliates/partners/:id/reset-defaults')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'بازنشانی مقادیر اختصاصی همکار به حالت پیش‌فرض عمومی' })
  @ApiParam({ name: 'id', description: 'شناسه همکار' })
  async resetPartnerDefaults(@Param('id') id: string) {
    const partner = await this.resetDefaultsUseCase.execute(id);
    return partner.toJSON();
  }

  @Get('admin/affiliates/commissions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مشاهده تراکنش‌های پورسانت' })
  @ApiQuery({ name: 'partnerId', required: false })
  @ApiQuery({ name: 'orderId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'productType', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getCommissions(
    @Query('partnerId') partnerId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
    @Query('productType') productType?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const result = await this.getCommissionsUseCase.execute({
      partnerId,
      orderId,
      status: status as any,
      productType,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
    return {
      items: result.items.map((c) => c.toJSON()),
      total: result.total,
    };
  }

  @Patch('admin/affiliates/commissions/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'بروزرسانی وضعیت پورسانت' })
  @ApiParam({ name: 'id', description: 'شناسه پورسانت' })
  async updateCommissionStatus(@Param('id') id: string, @Body() dto: UpdateCommissionStatusDto) {
    const comm = await this.updateCommissionStatusUseCase.execute(id, dto.status, dto.notes);
    return comm.toJSON();
  }

  @Post('admin/affiliates/payouts')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت پرداخت پورسانت به همکار' })
  async createPayout(@Body() dto: CreatePayoutDto) {
    const payout = await this.createPayoutUseCase.execute(dto);
    return payout.toJSON();
  }

  @Get('admin/affiliates/payouts')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'staff_manager', 'sales_manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مشاهده سوابق پرداخت‌های پورسانت' })
  @ApiQuery({ name: 'partnerId', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getPayouts(
    @Query('partnerId') partnerId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const result = await this.getPayoutsUseCase.execute({
      partnerId,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
    return {
      items: result.items.map((p) => p.toJSON()),
      total: result.total,
    };
  }
}
