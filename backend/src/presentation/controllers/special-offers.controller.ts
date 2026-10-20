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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';

import { CreateSpecialOfferUseCase } from '../../application/use-cases/special-offer/create-special-offer.use-case.js';
import { GetSpecialOffersUseCase } from '../../application/use-cases/special-offer/get-special-offers.use-case.js';
import { GetActiveSpecialOfferUseCase } from '../../application/use-cases/special-offer/get-active-special-offer.use-case.js';
import { GetSpecialOfferByIdUseCase } from '../../application/use-cases/special-offer/get-special-offer-by-id.use-case.js';
import { UpdateSpecialOfferUseCase } from '../../application/use-cases/special-offer/update-special-offer.use-case.js';
import { UpdateSpecialOfferStatusUseCase } from '../../application/use-cases/special-offer/update-special-offer-status.use-case.js';
import { DeleteSpecialOfferUseCase } from '../../application/use-cases/special-offer/delete-special-offer.use-case.js';
import { GetDiscountedProductsUseCase } from '../../application/use-cases/special-offer/get-discounted-products.use-case.js';
import { StopActiveSpecialOfferUseCase } from '../../application/use-cases/special-offer/stop-active-special-offer.use-case.js';

import {
  CreateSpecialOfferRequestDto,
  UpdateSpecialOfferRequestDto,
  UpdateSpecialOfferStatusRequestDto,
  SpecialOfferQueryDto,
} from '../dto/request/special-offer/special-offer.request.dto.js';
import {
  SpecialOfferCampaignResponseDto,
  ActiveSpecialOfferResponseDto,
} from '../dto/response/special-offer/special-offer.response.dto.js';

@ApiTags('SpecialOffers')
@Controller('special-offers')
export class SpecialOffersController {
  constructor(
    private readonly createSpecialOfferUseCase: CreateSpecialOfferUseCase,
    private readonly getSpecialOffersUseCase: GetSpecialOffersUseCase,
    private readonly getActiveSpecialOfferUseCase: GetActiveSpecialOfferUseCase,
    private readonly getSpecialOfferByIdUseCase: GetSpecialOfferByIdUseCase,
    private readonly updateSpecialOfferUseCase: UpdateSpecialOfferUseCase,
    private readonly updateSpecialOfferStatusUseCase: UpdateSpecialOfferStatusUseCase,
    private readonly deleteSpecialOfferUseCase: DeleteSpecialOfferUseCase,
    private readonly getDiscountedProductsUseCase: GetDiscountedProductsUseCase,
    private readonly stopActiveSpecialOfferUseCase: StopActiveSpecialOfferUseCase,
  ) {}

  @Get('discounted-products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست محصولات دارای تخفیف از کاتالوگ فروشگاه جهت انتخاب در فروش ویژه' })
  async getDiscountedProducts() {
    return await this.getDiscountedProductsUseCase.execute();
  }

  @Post('stop-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'توقف و غیرفعال‌سازی فوری فروش ویژه جاری' })
  async stopActiveOffer(): Promise<{ success: boolean; message: string }> {
    return await this.stopActiveSpecialOfferUseCase.execute();
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'فعال‌سازی فوری یک کمپین و غیرفعال‌سازی سایرین با تنظیم زمان شروع به اکنون' })
  async activateOffer(
    @Param('id') id: string,
  ): Promise<SpecialOfferCampaignResponseDto> {
    const campaign = await this.updateSpecialOfferStatusUseCase.execute(id, 'ACTIVE');
    return SpecialOfferCampaignResponseDto.fromEntity(campaign);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت کمپین فروش ویژه فعال جاری برای نمایش در فرانت‌اند' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'کمپین فعال بازگردانده شد.',
    type: ActiveSpecialOfferResponseDto,
  })
  async getActiveOffer(): Promise<ActiveSpecialOfferResponseDto> {
    const campaign = await this.getActiveSpecialOfferUseCase.execute();
    if (!campaign) {
      return {
        campaign: null,
        products: [],
      };
    }

    // Filter only items that have NOT reached capacity (stockRemaining > 0 & inStock)
    const campaignDto = SpecialOfferCampaignResponseDto.fromEntity(campaign, { onlyAvailable: true });

    // If all items reached capacity, don't show the offer on frontend
    if (!campaignDto.products || campaignDto.products.length === 0) {
      return {
        campaign: null,
        products: [],
      };
    }

    return {
      campaign: campaignDto,
      products: campaignDto.products,
      title: campaign.title,
      subtitle: campaign.tagline || campaign.description || 'تخفیف‌های استثنایی و محدود با ضمانت اصالت کالا',
      targetDate: campaign.endDate.toISOString(),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت کلیه کمپین‌های فروش ویژه (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست کمپین‌ها بازگردانده شد.',
    type: [SpecialOfferCampaignResponseDto],
  })
  async getAllOffers(
    @Query() query: SpecialOfferQueryDto,
  ): Promise<SpecialOfferCampaignResponseDto[]> {
    const campaigns = await this.getSpecialOffersUseCase.execute(query);
    return campaigns.map((c) => SpecialOfferCampaignResponseDto.fromEntity(c));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات یک کمپین فروش ویژه بر اساس شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه کمپین' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'مشخصات کمپین بازگردانده شد.',
    type: SpecialOfferCampaignResponseDto,
  })
  async getOfferById(
    @Param('id') id: string,
  ): Promise<SpecialOfferCampaignResponseDto> {
    const campaign = await this.getSpecialOfferByIdUseCase.execute(id);
    return SpecialOfferCampaignResponseDto.fromEntity(campaign);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد کمپین جدید فروش ویژه (پنل مدیریت)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'کمپین با موفقیت ایجاد شد.',
    type: SpecialOfferCampaignResponseDto,
  })
  async createOffer(
    @Body() dto: CreateSpecialOfferRequestDto,
  ): Promise<SpecialOfferCampaignResponseDto> {
    const campaign = await this.createSpecialOfferUseCase.execute(dto);
    return SpecialOfferCampaignResponseDto.fromEntity(campaign);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش اطلاعات و کالاهای کمپین فروش ویژه' })
  @ApiParam({ name: 'id', description: 'شناسه کمپین' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'کمپین با موفقیت به‌روزرسانی شد.',
    type: SpecialOfferCampaignResponseDto,
  })
  async updateOffer(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialOfferRequestDto,
  ): Promise<SpecialOfferCampaignResponseDto> {
    const campaign = await this.updateSpecialOfferUseCase.execute(id, dto);
    return SpecialOfferCampaignResponseDto.fromEntity(campaign);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر وضعیت فعال/غیرفعال بودن کمپین فروش ویژه' })
  @ApiParam({ name: 'id', description: 'شناسه کمپین' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'وضعیت کمپین تغییر یافت.',
    type: SpecialOfferCampaignResponseDto,
  })
  async updateOfferStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialOfferStatusRequestDto,
  ): Promise<SpecialOfferCampaignResponseDto> {
    const campaign = await this.updateSpecialOfferStatusUseCase.execute(
      id,
      dto.status,
      dto.isPublished,
    );
    return SpecialOfferCampaignResponseDto.fromEntity(campaign);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف کمپین فروش ویژه' })
  @ApiParam({ name: 'id', description: 'شناسه کمپین' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'کمپین با موفقیت حذف شد.',
  })
  async deleteOffer(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.deleteSpecialOfferUseCase.execute(id);
  }
}
