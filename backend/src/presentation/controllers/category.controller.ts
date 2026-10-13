import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case.js';
import { GetCategoriesUseCase } from '../../application/use-cases/category/get-categories.use-case.js';
import { GetCategoryByIdUseCase } from '../../application/use-cases/category/get-category-by-id.use-case.js';
import { UpdateCategoryUseCase } from '../../application/use-cases/category/update-category.use-case.js';
import { DeleteCategoryUseCase } from '../../application/use-cases/category/delete-category.use-case.js';
import { CreateCategoryRequestDto } from '../dto/request/category/create-category.request.dto.js';
import { UpdateCategoryRequestDto } from '../dto/request/category/update-category.request.dto.js';
import { CategoryQueryRequestDto } from '../dto/request/category/category-query.request.dto.js';
import { CategoryResponseDto } from '../dto/response/category/category.response.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد دسته‌بندی جدید' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'دسته‌بندی با موفقیت ایجاد شد.',
    type: CategoryResponseDto,
  })
  async create(@Body() dto: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
    const category = await this.createCategoryUseCase.execute(dto);
    const json = category.toJSON();
    return {
      ...json,
      productCount: json.productCount ?? 0,
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست دسته‌بندی‌ها با شمارش محصولات متصل' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست دسته‌بندی‌ها بازیابی شد.',
    type: [CategoryResponseDto],
  })
  async findAll(@Query() query: CategoryQueryRequestDto): Promise<CategoryResponseDto[]> {
    const categories = await this.getCategoriesUseCase.execute({
      search: query.search,
      isActive: query.isActive,
      parentId: query.parentId,
    });
    return categories.map((cat) => {
      const json = cat.toJSON();
      return {
        ...json,
        productCount: json.productCount ?? 0,
        createdAt: json.createdAt.toISOString(),
        updatedAt: json.updatedAt.toISOString(),
      };
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت جزئیات دسته‌بندی بر اساس شناسه یا اسلاگ' })
  @ApiParam({ name: 'id', description: 'شناسه یا پیوند یکتای (اسلاگ) دسته‌بندی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'مشخصات دسته‌بندی پیدا شد.',
    type: CategoryResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.getCategoryByIdUseCase.execute(id);
    const json = category.toJSON();
    return {
      ...json,
      productCount: json.productCount ?? 0,
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات دسته‌بندی' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'دسته‌بندی با موفقیت ویرایش شد.',
    type: CategoryResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    const updated = await this.updateCategoryUseCase.execute({
      id,
      shortName: dto.shortName,
      longName: dto.longName,
      slug: dto.slug,
      description: dto.description,
      icon: dto.icon,
      badge: dto.badge,
      parentId: dto.parentId,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    });
    const json = updated.toJSON();
    return {
      ...json,
      productCount: json.productCount ?? 0,
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف دسته‌بندی' })
  @ApiParam({ name: 'id', description: 'شناسه دسته‌بندی' })
  @ApiQuery({ name: 'force', required: false, description: 'حذف اجباری حتی در صورت وجود محصول متصل' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'دسته‌بندی با موفقیت حذف شد.',
  })
  async delete(
    @Param('id') id: string,
    @Query('force') force?: string,
  ): Promise<{ success: boolean; message: string }> {
    const isForce = force === 'true' || force === '1';
    const deleted = await this.deleteCategoryUseCase.execute(id, isForce);
    return {
      success: deleted,
      message: deleted ? 'دسته‌بندی با موفقیت حذف شد.' : 'عملیات حذف انجام نشد.',
    };
  }
}
