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
  ArticlesService,
  CreateArticleDto,
  UpdateArticleDto,
  ArticleQueryDto,
} from '../../application/services/articles.service.js';
import { ContentStatus } from '@prisma/client';
import type { UploadedMulterFile } from './product.controller.js';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    @Inject(IMAGE_PROCESSING_SERVICE_TOKEN)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  // ─── Public Endpoints ─────────────────────────────────────────

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست دسته‌بندی‌های فعال مقالات' })
  async getCategories() {
    return this.articlesService.getCategories();
  }

  @Get('tags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت برچسب‌های مقالات' })
  async getTags() {
    return this.articlesService.getTags();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت لیست مقالات با فیلتر، صفحه‌بندی و جستجو' })
  async findAll(@Query() query: ArticleQueryDto, @Request() req: any) {
    const role = req?.user?.role?.toLowerCase();
    const isAdmin = ['admin', 'super_admin', 'staff_manager', 'sales_manager'].includes(role);
    return this.articlesService.findAll(query, isAdmin);
  }

  @Get(':slugOrId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'دریافت مشخصات کامل مقاله بر اساس اسلاگ یا شناسه' })
  @ApiParam({ name: 'slugOrId', description: 'اسلاگ یا شناسه یکتای مقاله' })
  async findBySlugOrId(@Param('slugOrId') slugOrId: string, @Request() req: any) {
    const role = req?.user?.role?.toLowerCase();
    const isAdmin = ['admin', 'super_admin', 'staff_manager', 'sales_manager'].includes(role);
    return this.articlesService.findBySlugOrId(slugOrId, isAdmin);
  }

  // ─── Admin Endpoints ──────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ایجاد مقاله جدید توسط ادمین' })
  async create(@Body() dto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(dto, req.user?.sub);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ویرایش مشخصات کامل مقاله' })
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف مقاله' })
  async delete(@Param('id') id: string) {
    return this.articlesService.delete(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'تغییر وضعیت انتشار مقاله (پیش‌نویس، منتشرشده، آرشیوشده)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContentStatus,
  ) {
    if (!status || !Object.values(ContentStatus).includes(status)) {
      throw new BadRequestException('وضعیت ارسالی نامعتبر است.');
    }
    return this.articlesService.updateStatus(id, status);
  }

  // ─── Media Management (STRICT: NO WATERMARK) ──────────────────

  @Post('upload-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود تصویر شاخص یا محتوای مقاله (بدون واترمارک و تبدیل به WebP)' })
  async uploadImage(@UploadedFile() file: UploadedMulterFile) {
    if (!file) {
      throw new BadRequestException('هیچ فایلی برای آپلود ارسال نشده است.');
    }

    return this.imageProcessingService.processAndSaveArticleImage(
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
  @ApiOperation({ summary: 'آپلود چند تصویر گالری مقاله (بدون واترمارک)' })
  async uploadImages(@UploadedFiles() files: UploadedMulterFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('هیچ فایلی برای آپلود ارسال نشده است.');
    }

    const processed = [];
    for (const file of files) {
      const res = await this.imageProcessingService.processAndSaveArticleImage(
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
  @ApiOperation({ summary: 'آپلود ویدیوی مرتبط با مقاله (بدون واترمارک)' })
  async uploadVideo(@UploadedFile() file: UploadedMulterFile) {
    if (!file) {
      throw new BadRequestException('فایل ویدیو ارسال نشده است.');
    }

    return this.imageProcessingService.saveUploadedVideo(
      file.buffer,
      file.originalname,
      file.mimetype,
      'articles',
    );
  }

  @Delete('media/:filename')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف فایل رسانه مقاله' })
  async deleteMedia(@Param('filename') filename: string) {
    const success = await this.imageProcessingService.deleteMediaFile(filename, 'articles');
    return { success };
  }

  // ─── Categories Management ────────────────────────────────────

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ایجاد دسته‌بندی جدید مقالات' })
  async createCategory(@Body() body: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    return this.articlesService.createCategory(body);
  }

  @Put('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'ویرایش دسته‌بندی مقالات' })
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.articlesService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'حذف دسته‌بندی مقالات' })
  async deleteCategory(@Param('id') id: string) {
    return this.articlesService.deleteCategory(id);
  }
}
