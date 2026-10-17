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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case.js';
import { GetAllUsersUseCase } from '../../application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from '../../application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserStatusUseCase } from '../../application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case.js';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto.js';
import {
  UpdateUserRoleRequestDto,
  UpdateUserStatusRequestDto,
  UpdateUserRequestDto,
} from '../dto/request/update-user.request.dto.js';
import { AdminUserResponseDto } from '../dto/response/admin-user.response.dto.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست کلیه کاربران پلتفرم (پنل مدیریت)' })
  @ApiQuery({ name: 'role', required: false, description: 'فیلتر بر اساس نقش کاربری' })
  @ApiQuery({ name: 'status', required: false, description: 'فیلتر بر اساس وضعیت حساب' })
  @ApiQuery({ name: 'search', required: false, description: 'جستجو در نام، موبایل، ایمیل، کد ملی یا شرکت' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست کاربران با موفقیت بازگردانده شد.',
    type: [AdminUserResponseDto],
  })
  async getAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<AdminUserResponseDto[]> {
    const users = await this.getAllUsersUseCase.execute({ role, status, search });
    return users.map(AdminUserResponseDto.fromDomain);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت و ایجاد کاربر جدید' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'کاربر با موفقیت ایجاد شد.',
    type: AdminUserResponseDto,
  })
  async create(@Body() dto: CreateUserRequestDto): Promise<AdminUserResponseDto> {
    const name = dto.name || dto.fullName || '';
    const createdDto = await this.createUserUseCase.execute({
      email: dto.email,
      name,
      phone: dto.phone,
      role: dto.role,
      status: dto.status,
      nationalCode: dto.nationalCode,
      companyName: dto.companyName,
      notes: dto.notes,
    });
    const user = await this.getUserByIdUseCase.execute(createdDto.id);
    return AdminUserResponseDto.fromDomain(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت پرونده و مشخصات کاربر با شناسه' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'اطلاعات کاربر بازگردانده شد.',
    type: AdminUserResponseDto,
  })
  async findById(@Param('id') id: string): Promise<AdminUserResponseDto> {
    const user = await this.getUserByIdUseCase.execute(id);
    return AdminUserResponseDto.fromDomain(user);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر سطح دسترسی و نقش کاربری' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'نقش کاربری بروزرسانی شد.',
    type: AdminUserResponseDto,
  })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleRequestDto,
  ): Promise<AdminUserResponseDto> {
    const updated = await this.updateUserRoleUseCase.execute({ userId: id, role: dto.role });
    return AdminUserResponseDto.fromDomain(updated);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر وضعیت حساب کاربر (مسدودسازی یا فعال‌سازی)' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'وضعیت حساب کاربر بروزرسانی شد.',
    type: AdminUserResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusRequestDto,
  ): Promise<AdminUserResponseDto> {
    const updated = await this.updateUserStatusUseCase.execute({ userId: id, status: dto.status });
    return AdminUserResponseDto.fromDomain(updated);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش اطلاعات و پروفایل کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'اطلاعات کاربر بروزرسانی شد.',
    type: AdminUserResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<AdminUserResponseDto> {
    const name = dto.name || dto.fullName;
    const updated = await this.updateUserUseCase.execute({
      userId: id,
      ...dto,
      name,
    });
    return AdminUserResponseDto.fromDomain(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف کاربر از سیستم' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'کاربر با موفقیت حذف شد.',
  })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    return await this.deleteUserUseCase.execute(id);
  }
}
