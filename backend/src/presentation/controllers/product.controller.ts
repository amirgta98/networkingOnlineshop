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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { CreateProductUseCase } from '../../application/use-cases/product/create-product.use-case.js';
import { GetProductsUseCase } from '../../application/use-cases/product/get-products.use-case.js';
import { GetProductByIdUseCase } from '../../application/use-cases/product/get-product-by-id.use-case.js';
import { UpdateProductUseCase } from '../../application/use-cases/product/update-product.use-case.js';
import { DeleteProductUseCase } from '../../application/use-cases/product/delete-product.use-case.js';
import { UpdateProductStockUseCase } from '../../application/use-cases/product/update-product-stock.use-case.js';
import { BulkUpdateProductStatusUseCase } from '../../application/use-cases/product/bulk-update-product-status.use-case.js';
import { BulkDeleteProductsUseCase } from '../../application/use-cases/product/bulk-delete-products.use-case.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from '../../shared/constants/tokens.js';
import type { IImageProcessingService } from '../../application/services/image-processing.service.interface.js';
import { CreateProductRequestDto } from '../dto/request/product/create-product.request.dto.js';
import { UpdateProductRequestDto } from '../dto/request/product/update-product.request.dto.js';
import { UpdateProductStockRequestDto } from '../dto/request/product/update-stock.request.dto.js';
import { BulkUpdateProductStatusRequestDto } from '../dto/request/product/bulk-update-status.request.dto.js';
import { BulkDeleteProductsRequestDto } from '../dto/request/product/bulk-delete.request.dto.js';
import { ProductQueryRequestDto } from '../dto/request/product/product-query.request.dto.js';
import {
  ProductResponseDto,
  PaginatedProductsResponseDto,
} from '../dto/response/product/product.response.dto.js';
import {
  BulkUpdateProductStatusResponseDto,
  BulkDeleteProductsResponseDto,
} from '../dto/response/product/bulk-action.response.dto.js';

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly updateProductStockUseCase: UpdateProductStockUseCase,
    private readonly bulkUpdateProductStatusUseCase: BulkUpdateProductStatusUseCase,
    private readonly bulkDeleteProductsUseCase: BulkDeleteProductsUseCase,
    @Inject(IMAGE_PROCESSING_SERVICE_TOKEN)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد محصول جدید با ویژگی‌ها و تصاویر' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'محصول با موفقیت ایجاد شد.',
    type: ProductResponseDto,
  })
  async create(@Body() dto: CreateProductRequestDto): Promise<ProductResponseDto> {
    return await this.createProductUseCase.execute(dto as any);
  }

  @Post('bulk-status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بروزرسانی دسته‌ای وضعیت محصولات' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'وضعیت محصولات با موفقیت تغییر یافت.',
    type: BulkUpdateProductStatusResponseDto,
  })
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateProductStatusRequestDto,
  ): Promise<BulkUpdateProductStatusResponseDto> {
    return await this.bulkUpdateProductStatusUseCase.execute(dto);
  }

  @Patch('bulk-status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بروزرسانی دسته‌ای وضعیت محصولات (Patch)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'وضعیت محصولات با موفقیت تغییر یافت.',
    type: BulkUpdateProductStatusResponseDto,
  })
  async bulkUpdateStatusPatch(
    @Body() dto: BulkUpdateProductStatusRequestDto,
  ): Promise<BulkUpdateProductStatusResponseDto> {
    return await this.bulkUpdateProductStatusUseCase.execute(dto);
  }

  @Post('bulk-delete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف دسته‌ای محصولات' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'محصولات انتخابی با موفقیت حذف شدند.',
    type: BulkDeleteProductsResponseDto,
  })
  async bulkDelete(
    @Body() dto: BulkDeleteProductsRequestDto,
  ): Promise<BulkDeleteProductsResponseDto> {
    return await this.bulkDeleteProductsUseCase.execute(dto);
  }

  @Delete('bulk')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف دسته‌ای محصولات (Delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'محصولات انتخابی با موفقیت حذف شدند.',
    type: BulkDeleteProductsResponseDto,
  })
  async bulkDeleteMethod(
    @Body() dto: BulkDeleteProductsRequestDto,
  ): Promise<BulkDeleteProductsResponseDto> {
    return await this.bulkDeleteProductsUseCase.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست محصولات با فیلتر، صفحه‌بندی و جستجو' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست محصولات بازیابی شد.',
    type: PaginatedProductsResponseDto,
  })
  async findAll(@Query() query: ProductQueryRequestDto): Promise<PaginatedProductsResponseDto> {
    return await this.getProductsUseCase.execute(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت جزئیات کامل یک محصول بر اساس شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'مشخصات محصول پیدا شد.',
    type: ProductResponseDto,
  })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.getProductByIdUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات کامل، ویژگی‌ها و تصاویر محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'محصول با موفقیت ویرایش شد.',
    type: ProductResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.updateProductUseCase.execute(id, dto as any);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف محصول از سیستم' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'محصول حذف شد.',
  })
  async delete(@Param('id') id: string): Promise<{ success: boolean; id: string }> {
    return await this.deleteProductUseCase.execute(id);
  }

  @Patch(':id/stock')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تنظیم سریع موجودی انبار و قیمت واحد' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'موجودی به‌روزرسانی شد.',
    type: ProductResponseDto,
  })
  async updateStock(
    @Param('id') id: string,
    @Body() dto: UpdateProductStockRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.updateProductStockUseCase.execute(id, dto);
  }

  @Patch(':id/images')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'مدیریت و تغییر ترتیب تصاویر محصول و تعیین تصویر اصلی' })
  @ApiParam({ name: 'id', description: 'شناسه محصول' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ترتیب تصاویر و تصویر اصلی محصول با موفقیت به‌روزرسانی شد.',
    type: ProductResponseDto,
  })
  async updateImages(
    @Param('id') id: string,
    @Body() body: { images: string[] },
  ): Promise<ProductResponseDto> {
    if (!body || !Array.isArray(body.images)) {
      throw new BadRequestException('لیست تصاویر ارسالی نامعتبر است.');
    }
    return await this.updateProductUseCase.execute(id, { images: body.images });
  }

  @Post('upload-images')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'آپلود چند تصویر محصول، برش ۱:۱، اعمال واترمارک و تبدیل به WebP',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async uploadImages(
    @UploadedFiles() files: UploadedMulterFile[],
  ): Promise<{ images: any[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('هیچ تصویری برای آپلود ارسال نشده است.');
    }

    const processed = [];
    for (const file of files) {
      const res = await this.imageProcessingService.processAndSaveProductImage(
        file.buffer,
        file.originalname,
      );
      processed.push(res);
    }

    return { images: processed };
  }

  @Post('upload-icon')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود آیکون اختصاصی ویژگی (PNG, SVG, WebP)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadIcon(
    @UploadedFile() file: UploadedMulterFile,
  ): Promise<{ filename: string; originalName: string; url: string; size: number }> {
    if (!file) {
      throw new BadRequestException('فایل آیکون ارسال نشده است.');
    }

    return await this.imageProcessingService.processAndSaveFeatureIcon(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete('images/:filename')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف فایل تصویر آپلودشده' })
  async deleteImage(@Param('filename') filename: string): Promise<{ success: boolean }> {
    const success = await this.imageProcessingService.deleteProductImage(filename);
    return { success };
  }

  @Delete('icons/:filename')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'store_manager')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف فایل آیکون آپلودشده' })
  async deleteIcon(@Param('filename') filename: string): Promise<{ success: boolean }> {
    const success = await this.imageProcessingService.deleteFeatureIcon(filename);
    return { success };
  }
}
