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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Inject,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from '../../shared/constants/tokens.js';
import type { IImageProcessingService } from '../../application/services/image-processing.service.interface.js';
import {
  PortfolioService,
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioQueryDto,
} from '../../application/services/portfolio.service.js';
import { ContentStatus } from '@prisma/client';
import type { UploadedMulterFile } from './product.controller.js';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    @Inject(IMAGE_PROCESSING_SERVICE_TOKEN)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  // ─── Public Endpoints ─────────────────────────────────────────

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست دسته‌بندی‌های فعال نمونه‌کارها' })
  async getCategories() {
    return this.portfolioService.getCategories();
  }

  @Get('tags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت برچسب‌های نمونه‌کارها' })
  async getTags() {
    return this.portfolioService.getTags();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت لیست نمونه‌کارها با فیلتر، صفحه‌بندی و جستجو' })
  async findAll(@Query() query: PortfolioQueryDto, @Request() req: any) {
    const role = req?.user?.role?.toLowerCase();
    const isAdmin = ['admin', 'super_admin', 'staff_manager', 'sales_manager'].includes(role);
    return this.portfolioService.findAll(query, isAdmin);
  }

  @Get(':slugOrId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت جزئیات کامل نمونه‌کار با اسلاگ یا شناسه' })
  @ApiParam({ name: 'slugOrId', description: 'اسلاگ یا شناسه یکتای نمونه‌کار' })
  async findBySlugOrId(@Param('slugOrId') slugOrId: string, @Request() req: any) {
    const role = req?.user?.role?.toLowerCase();
    const isAdmin = ['admin', 'super_admin', 'staff_manager', 'sales_manager'].includes(role);
    return this.portfolioService.findBySlugOrId(slugOrId, isAdmin);
  }

  // ─── Admin Endpoints ──────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ایجاد نمونه‌کار جدید با تمام ویژگی‌ها و چالش‌ها' })
  async create(@Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ویرایش مشخصات کامل نمونه‌کار' })
  async update(@Param('id') id: string, @Body() dto: UpdatePortfolioDto) {
    return this.portfolioService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف نمونه‌کار' })
  async delete(@Param('id') id: string) {
    return this.portfolioService.delete(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'تغییر وضعیت انتشار نمونه‌کار' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContentStatus,
  ) {
    if (!status || !Object.values(ContentStatus).includes(status)) {
      throw new BadRequestException('وضعیت ارسالی نامعتبر است.');
    }
    return this.portfolioService.updateStatus(id, status);
  }

  // ─── Media Management (STRICT: NO WATERMARK) ──────────────────

  @Post('upload-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود تصویر شاخص یا پروژه (بدون واترمارک و تبدیل به WebP)' })
  async uploadImage(@UploadedFile() file: UploadedMulterFile) {
    if (!file) {
      throw new BadRequestException('هیچ فایلی برای آپلود ارسال نشده است.');
    }

    return this.imageProcessingService.processAndSavePortfolioImage(
      file.buffer,
      file.originalname,
    );
  }

  @Post('upload-images')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود چند تصویر گالری نمونه‌کار (بدون واترمارک)' })
  async uploadImages(@UploadedFiles() files: UploadedMulterFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('هیچ فایلی برای آپلود ارسال نشده است.');
    }

    const processed = [];
    for (const file of files) {
      const res = await this.imageProcessingService.processAndSavePortfolioImage(
        file.buffer,
        file.originalname,
      );
      processed.push(res);
    }
    return { images: processed };
  }

  @Post('upload-video')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود ویدیوی پروژه (بدون واترمارک)' })
  async uploadVideo(@UploadedFile() file: UploadedMulterFile) {
    if (!file) {
      throw new BadRequestException('فایل ویدیو ارسال نشده است.');
    }

    return this.imageProcessingService.saveUploadedVideo(
      file.buffer,
      file.originalname,
      file.mimetype,
      'portfolio',
    );
  }

  @Delete('media/:filename')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف فایل رسانه نمونه‌کار' })
  async deleteMedia(@Param('filename') filename: string) {
    const success = await this.imageProcessingService.deleteMediaFile(filename, 'portfolio');
    return { success };
  }

  // ─── Categories Management ────────────────────────────────────

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ایجاد دسته‌بندی جدید نمونه‌کارها' })
  async createCategory(@Body() body: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    return this.portfolioService.createCategory(body);
  }

  @Put('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ویرایش دسته‌بندی نمونه‌کارها' })
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.portfolioService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف دسته‌بندی نمونه‌کارها' })
  async deleteCategory(@Param('id') id: string) {
    return this.portfolioService.deleteCategory(id);
  }
}
