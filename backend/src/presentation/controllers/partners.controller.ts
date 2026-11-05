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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { AuthGuard } from '../guards/auth.guard.js';
import {
  PartnersService,
  SubmitPartnerApplicationDto,
  UpgradeRequestDto,
  UpdatePartnerStatusDto,
  AdminPartnersFilterDto,
} from '../../application/services/partners.service.js';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Partnership & B2B Upgrade')
@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveUserId(req: AuthenticatedRequest): Promise<string> {
    if (req.user?.sub) {
      return req.user.sub;
    }
    throw new UnauthorizedException('لطفا ابتدا وارد حساب کاربری خود شوید.');
  }

  @Get('my-application')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت وضعیت پرونده ارتقا به همکار کاربر جاری' })
  async getMyApplication(@Req() req: AuthenticatedRequest) {
    const userId = await this.resolveUserId(req);
    return this.partnersService.getMyApplication(userId);
  }

  @Post('apply')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت یا ویرایش پرونده درخواست ارتقا به همکار (حقیقی یا حقوقی)' })
  async submitApplication(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitPartnerApplicationDto,
  ) {
    const userId = await this.resolveUserId(req);
    return this.partnersService.submitApplication(userId, dto);
  }

  @Post('upgrade-request')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت یا به‌روزرسانی پرونده ارتقای همکار سازمانی و مشخصات حقوقی شرکت (B2B)' })
  async upgradeRequest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpgradeRequestDto,
  ) {
    const userId = await this.resolveUserId(req);
    return this.partnersService.upgradeRequest(userId, dto);
  }

  @Post('upload')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'بارگذاری مدارک و اسناد هویتی/ثبتی همکار (حداکثر ۱۵ مگابایت)' })
  async uploadDocument(@UploadedFile() file: UploadedMulterFile) {
    return this.partnersService.uploadDocument(file);
  }
}

@ApiTags('Admin B2B Partners')
@Controller('admin/partners')
@UseGuards(AuthGuard)
export class AdminPartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لیست کلیه پرونده‌های ارتقا به همکار با فیلتر وضعیت و نوع متقاضی' })
  async getAdminPartners(@Query() query: AdminPartnersFilterDto) {
    return this.partnersService.getAdminPartners(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت مستقیم پرونده همکار B2B توسط ادمین' })
  async createPartner(
    @Body() dto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminUserId = req.user?.sub;
    return this.partnersService.createPartnerAdmin(dto, adminUserId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'مشاهده کامل جزئیات پرونده یک همکار' })
  async getAdminPartnerById(@Param('id') id: string) {
    return this.partnersService.getAdminPartnerById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات کامل پرونده همکار توسط ادمین' })
  async updatePartner(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminUserId = req.user?.sub;
    return this.partnersService.updatePartnerAdmin(id, dto, adminUserId);
  }

  @Put(':id/status')
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تعیین وضعیت پرونده (تایید، رد یا درخواست مدارک) و تنظیم رتبه و سقف اعتبار' })
  async updatePartnerStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminUserId = req.user?.sub;
    return this.partnersService.updatePartnerStatus(id, dto, adminUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف پرونده همکار توسط ادمین' })
  async deletePartner(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminUserId = req.user?.sub;
    return this.partnersService.deletePartner(id, adminUserId);
  }
}
