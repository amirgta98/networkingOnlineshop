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
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard.js';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from '../decorators/roles.decorator.js';
import { RequirePermissions } from '../decorators/permissions.decorator.js';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case.js';
import { GetAllUsersUseCase } from '../../application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from '../../application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserPermissionsUseCase } from '../../application/use-cases/user/update-user-permissions.use-case.js';
import { UpdateUserStatusUseCase } from '../../application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case.js';
import { GetUserProfileUseCase } from '../../application/use-cases/user/get-user-profile.use-case.js';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/update-user-profile.use-case.js';
import { UploadUserAvatarUseCase } from '../../application/use-cases/user/upload-user-avatar.use-case.js';
import { DeleteUserAvatarUseCase } from '../../application/use-cases/user/delete-user-avatar.use-case.js';
import { GetUserAddressesUseCase } from '../../application/use-cases/user/get-user-addresses.use-case.js';
import { GetUserCartUseCase } from '../../application/use-cases/user/get-user-cart.use-case.js';
import { SyncUserCartUseCase } from '../../application/use-cases/user/sync-user-cart.use-case.js';
import { AddCartItemUseCase } from '../../application/use-cases/user/add-cart-item.use-case.js';
import { UpdateCartItemUseCase } from '../../application/use-cases/user/update-cart-item.use-case.js';
import { RemoveCartItemUseCase } from '../../application/use-cases/user/remove-cart-item.use-case.js';
import { ClearUserCartUseCase } from '../../application/use-cases/user/clear-user-cart.use-case.js';
import {
  SyncCartRequestDto,
  AddCartItemRequestDto,
  UpdateCartItemRequestDto,
} from '../dto/request/cart/cart-requests.dto.js';
import { GetUserOrdersUseCase } from '../../application/use-cases/user/get-user-orders.use-case.js';
import { GetUserInvoicesUseCase } from '../../application/use-cases/user/get-user-invoices.use-case.js';
import { GetUserWalletUseCase } from '../../application/use-cases/user/get-user-wallet.use-case.js';
import { GetUserFavoritesUseCase } from '../../application/use-cases/user/get-user-favorites.use-case.js';
import { AddUserFavoriteUseCase } from '../../application/use-cases/user/add-user-favorite.use-case.js';
import { RemoveUserFavoriteUseCase } from '../../application/use-cases/user/remove-user-favorite.use-case.js';
import { ToggleUserFavoriteUseCase } from '../../application/use-cases/user/toggle-user-favorite.use-case.js';
import { CheckUserFavoriteUseCase } from '../../application/use-cases/user/check-user-favorite.use-case.js';
import { GetUserRfqUseCase } from '../../application/use-cases/user/get-user-rfq.use-case.js';
import { GetUserAuthenticityUseCase } from '../../application/use-cases/user/get-user-authenticity.use-case.js';
import { GetUserLoyaltyUseCase } from '../../application/use-cases/user/get-user-loyalty.use-case.js';
import { GetUserSessionsUseCase } from '../../application/use-cases/user/get-user-sessions.use-case.js';
import { RevokeUserSessionUseCase } from '../../application/use-cases/user/revoke-user-session.use-case.js';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto.js';
import { UpdateUserProfileRequestDto } from '../dto/request/update-profile.request.dto.js';
import { UserProfileResponseDto } from '../dto/response/user-profile.response.dto.js';
import {
  UpdateUserRoleRequestDto,
  UpdateUserPermissionsRequestDto,
  UpdateUserStatusRequestDto,
  UpdateUserRequestDto,
} from '../dto/request/update-user.request.dto.js';
import { AdminUserResponseDto } from '../dto/response/admin-user.response.dto.js';
import { AddressResponseDto } from '../dto/response/address/address.response.dto.js';
import { UserCartResponseDto } from '../dto/response/user-details/user-cart.response.dto.js';
import { UserOrderResponseDto } from '../dto/response/user-details/user-orders.response.dto.js';
import { UserInvoiceResponseDto } from '../dto/response/user-details/user-invoices.response.dto.js';
import { UserWalletResponseDto } from '../dto/response/user-details/user-wallet.response.dto.js';
import { UserFavoriteResponseDto } from '../dto/response/user-details/user-favorites.response.dto.js';
import { UserRfqResponseDto } from '../dto/response/user-details/user-rfq.response.dto.js';
import { UserAuthenticityResponseDto } from '../dto/response/user-details/user-authenticity.response.dto.js';
import { UserLoyaltyResponseDto } from '../dto/response/user-details/user-loyalty.response.dto.js';
import { UserSessionResponseDto } from '../dto/response/user-details/user-sessions.response.dto.js';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly updateUserPermissionsUseCase: UpdateUserPermissionsUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly getUserCartUseCase: GetUserCartUseCase,
    private readonly getUserOrdersUseCase: GetUserOrdersUseCase,
    private readonly getUserInvoicesUseCase: GetUserInvoicesUseCase,
    private readonly getUserWalletUseCase: GetUserWalletUseCase,
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private readonly addUserFavoriteUseCase: AddUserFavoriteUseCase,
    private readonly removeUserFavoriteUseCase: RemoveUserFavoriteUseCase,
    private readonly toggleUserFavoriteUseCase: ToggleUserFavoriteUseCase,
    private readonly checkUserFavoriteUseCase: CheckUserFavoriteUseCase,
    private readonly getUserRfqUseCase: GetUserRfqUseCase,
    private readonly getUserAuthenticityUseCase: GetUserAuthenticityUseCase,
    private readonly getUserLoyaltyUseCase: GetUserLoyaltyUseCase,
    private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    private readonly revokeUserSessionUseCase: RevokeUserSessionUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly uploadUserAvatarUseCase: UploadUserAvatarUseCase,
    private readonly deleteUserAvatarUseCase: DeleteUserAvatarUseCase,
    @Optional() private readonly syncUserCartUseCase?: SyncUserCartUseCase,
    @Optional() private readonly addCartItemUseCase?: AddCartItemUseCase,
    @Optional() private readonly updateCartItemUseCase?: UpdateCartItemUseCase,
    @Optional() private readonly removeCartItemUseCase?: RemoveCartItemUseCase,
    @Optional() private readonly clearUserCartUseCase?: ClearUserCartUseCase,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  private async resolveUserId(req: any): Promise<string> {
    const rawId = req.user?.sub || req.user?.id;
    const phone = req.user?.phone;
    if (!rawId && !phone) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    if (this.prisma && rawId) {
      const exists = await this.prisma.user.findUnique({
        where: { id: rawId },
        select: { id: true },
      });
      if (exists) {
        return exists.id;
      }
      if (phone) {
        const byPhone = await this.prisma.user.findUnique({
          where: { phone },
          select: { id: true },
        });
        if (byPhone) {
          return byPhone.id;
        }
      }
    }
    return rawId;
  }

  @Get('me/profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات کامل پروفایل کاربر جاری' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'اطلاعات پروفایل کاربر بازگردانده شد.',
    type: UserProfileResponseDto,
  })
  async getMyProfile(
    @Req() req: any,
  ): Promise<UserProfileResponseDto> {
    const userId = await this.resolveUserId(req);
    return await this.getUserProfileUseCase.execute(userId, req.user?.phone);
  }

  @Put('me/profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ویرایش مشخصات کامل پروفایل کاربر جاری' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'اطلاعات پروفایل کاربر بروزرسانی شد.',
    type: UserProfileResponseDto,
  })
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateUserProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    const userId = await this.resolveUserId(req);
    return await this.updateUserProfileUseCase.execute(userId, dto, req.user?.phone);
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'بارگذاری یا تعویض تصویر پروفایل کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تصویر پروفایل با موفقیت بارگذاری شد.',
  })
  async uploadMyAvatar(
    @Req() req: any,
    @UploadedFile() file: any,
  ): Promise<{ avatarUrl: string; filename: string; message: string }> {
    const userId = await this.resolveUserId(req);
    if (!file) {
      throw new BadRequestException('هیچ فایلی برای تصویر پروفایل ارسال نشده است.');
    }
    return await this.uploadUserAvatarUseCase.execute(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete('me/avatar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف تصویر پروفایل کاربر و بازگشت به پیش‌فرض' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'تصویر پروفایل حذف شد.',
  })
  async deleteMyAvatar(
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const userId = await this.resolveUserId(req);
    return await this.deleteUserAvatarUseCase.execute(userId);
  }

  @Get('me/favorites')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست نشان‌شده‌ها و کالاهای برگزیده کاربر جاری' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserFavoriteResponseDto] })
  async getMyFavorites(@Req() req: any): Promise<UserFavoriteResponseDto[]> {
    const userId = await this.resolveUserId(req);
    const list = await this.getUserFavoritesUseCase.execute(userId);
    return list.map((f) => UserFavoriteResponseDto.fromDomain(f));
  }

  @Post('me/favorites/:productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'افزودن کالا به لیست نشان‌شده‌های کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserFavoriteResponseDto })
  async addMyFavorite(
    @Req() req: any,
    @Param('productId') productId: string,
  ): Promise<UserFavoriteResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    const fav = await this.addUserFavoriteUseCase.execute(userId, productId);
    return UserFavoriteResponseDto.fromDomain(fav);
  }

  @Delete('me/favorites/:productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف کالا از لیست نشان‌شده‌های کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول یا شناسه رکورد' })
  @ApiResponse({ status: HttpStatus.OK })
  async removeMyFavorite(
    @Req() req: any,
    @Param('productId') productId: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    const success = await this.removeUserFavoriteUseCase.execute(userId, productId);
    return {
      success,
      message: success
        ? 'محصول با موفقیت از نشان‌شده‌ها حذف شد.'
        : 'محصول در لیست علاقه‌مندی‌ها یافت نشد.',
    };
  }

  @Post('me/favorites/toggle/:productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر وضعیت نشان‌شدن کالا (افزودن/حذف)' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول' })
  @ApiResponse({ status: HttpStatus.OK })
  async toggleMyFavorite(
    @Req() req: any,
    @Param('productId') productId: string,
  ): Promise<{ isFavorited: boolean; message: string; item?: UserFavoriteResponseDto }> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    const result = await this.toggleUserFavoriteUseCase.execute(userId, productId);
    return {
      isFavorited: result.isFavorited,
      message: result.message,
      item: result.item ? UserFavoriteResponseDto.fromDomain(result.item) : undefined,
    };
  }

  @Get('me/favorites/check/:productId')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بررسی وضعیت نشان‌شدن کالا برای کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول' })
  @ApiResponse({ status: HttpStatus.OK })
  async checkMyFavorite(
    @Req() req: any,
    @Param('productId') productId: string,
  ): Promise<{ isFavorited: boolean }> {
    const userId = req.user?.sub || req.user?.id;
    const isFavorited = await this.checkUserFavoriteUseCase.execute(userId, productId);
    return { isFavorited };
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions('admin:users')
  @Roles('admin', 'super_admin', 'site_manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست کلیه کاربران پلتفرم (پنل مدیریت)' })
  @ApiQuery({ name: 'role', required: false, description: 'فیلتر بر اساس نقش کاربری' })
  @ApiQuery({ name: 'status', required: false, description: 'فیلتر بر اساس وضعیت حساب' })
  @ApiQuery({ name: 'search', required: false, description: 'جستجو در نام، موبایل، ایمیل، کد ملی یا شرکت' })
  @ApiQuery({ name: 'page', required: false, description: 'شماره صفحه' })
  @ApiQuery({ name: 'limit', required: false, description: 'تعداد در هر صفحه' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست کاربران با موفقیت بازگردانده شد.',
    type: [AdminUserResponseDto],
  })
  async getAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<AdminUserResponseDto[]> {
    const pageNum = page ? Math.max(1, Number(page) || 1) : 1;
    const take = limit ? Math.max(1, Math.min(200, Number(limit) || 20)) : undefined;
    const skip = take ? (pageNum - 1) * take : undefined;
    const users = await this.getAllUsersUseCase.execute({
      role,
      status,
      search,
      page: pageNum,
      limit: take,
      skip,
      take,
    });
    return users.map(AdminUserResponseDto.fromDomain);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions('admin:users')
  @Roles('admin', 'super_admin', 'site_manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت و ایجاد کاربر جدید' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'کاربر با موفقیت ایجاد شد.',
    type: AdminUserResponseDto,
  })
  async create(@Body() dto: CreateUserRequestDto): Promise<AdminUserResponseDto> {
    const name = dto.name || dto.fullName || '';
    const phone = dto.phone?.trim();
    const email = dto.email?.trim() || (phone ? `u_${phone}@velox.local` : `user_${Date.now()}@velox.local`);
    const createdDto = await this.createUserUseCase.execute({
      email,
      name,
      phone: dto.phone,
      role: dto.role,
      status: dto.status,
      nationalCode: dto.nationalCode,
      companyName: dto.companyName,
      notes: dto.notes,
      canBuyInternet: dto.canBuyInternet,
    });
    const user = await this.getUserByIdUseCase.execute(createdDto.id);
    return AdminUserResponseDto.fromDomain(user);
  }

  @Get('permissions/catalog')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'site_manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت کاتالوگ کلیه دسترسی‌ها و مجوزهای سیستم برای نقش سایتگردان' })
  async getPermissionsCatalog(): Promise<any[]> {
    if (this.prisma) {
      const perms = await this.prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { code: 'asc' }],
      });
      return perms.map((p) => ({
        id: p.id,
        code: p.code,
        module: p.module,
        name: p.name,
        description: p.description,
      }));
    }
    return [];
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions('admin:users')
  @Roles('admin', 'super_admin', 'site_manager')
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
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
    const updated = await this.updateUserRoleUseCase.execute({
      userId: id,
      role: dto.role,
      permissions: dto.permissions,
    });
    return AdminUserResponseDto.fromDomain(updated);
  }

  @Patch(':id/permissions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تخصیص یا ویرایش دسترسی‌های سفارشی سایتگردان' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'دسترسی‌های کاربر بروزرسانی شد.',
    type: AdminUserResponseDto,
  })
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsRequestDto,
  ): Promise<AdminUserResponseDto> {
    const updated = await this.updateUserPermissionsUseCase.execute({
      userId: id,
      permissions: dto.permissions,
    });
    return AdminUserResponseDto.fromDomain(updated);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions('admin:users')
  @Roles('admin', 'super_admin', 'site_manager')
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
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions('admin:users')
  @Roles('admin', 'super_admin', 'site_manager')
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
  @UseGuards(AuthGuard, RolesGuard)
  @RequirePermissions('admin:users')
  @Roles('admin', 'super_admin', 'site_manager')
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

  private resolveTargetUserId(id: string, req: any): string {
    if (id === 'me') {
      return req?.user?.sub || req?.user?.id || '00000000-0000-4000-a000-000000000001';
    }
    return id;
  }

  @Get(':id/addresses')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست نشانی‌های کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressResponseDto] })
  async getUserAddresses(@Param('id') id: string, @Req() req: any): Promise<AddressResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserAddressesUseCase.execute(targetId);
    return list.map((a) => AddressResponseDto.fromDomain(a));
  }

  @Get(':id/cart')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت سبد خرید فعال کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async getUserCart(@Param('id') id: string, @Req() req: any): Promise<UserCartResponseDto | { cart: null; items: []; totalItems: 0; totalAmount: 0 }> {
    const targetId = this.resolveTargetUserId(id, req);
    const cart = await this.getUserCartUseCase.execute(targetId);
    const dto = UserCartResponseDto.fromDomain(cart);
    if (!dto) {
      return { cart: null, items: [], totalItems: 0, totalAmount: 0 };
    }
    return dto;
  }

  @Post(':id/cart/sync')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'همگام‌سازی کامل اقلام سبد خرید کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async syncUserCart(
    @Param('id') id: string,
    @Body() dto: SyncCartRequestDto,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const targetId = this.resolveTargetUserId(id, req);
    if (!this.syncUserCartUseCase) {
      throw new BadRequestException('SyncUserCartUseCase not initialized');
    }
    const cart = await this.syncUserCartUseCase.execute(targetId, dto.items || []);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Post(':id/cart/items')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'افزودن کالا به سبد خرید کاربر (توسط ادمین یا کاربر)' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async addUserCartItem(
    @Param('id') id: string,
    @Body() dto: AddCartItemRequestDto,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const targetId = this.resolveTargetUserId(id, req);
    if (!this.addCartItemUseCase) {
      throw new BadRequestException('AddCartItemUseCase not initialized');
    }
    const cart = await this.addCartItemUseCase.execute(targetId, dto.productId, dto.quantity);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Patch(':id/cart/items/:itemId')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر تعداد قلم کالا در سبد خرید کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiParam({ name: 'itemId', description: 'شناسه آیتم سبد خرید' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async updateUserCartItemQuantity(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemRequestDto,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const targetId = this.resolveTargetUserId(id, req);
    if (!this.updateCartItemUseCase) {
      throw new BadRequestException('UpdateCartItemUseCase not initialized');
    }
    const cart = await this.updateCartItemUseCase.execute(targetId, itemId, dto.quantity);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Delete(':id/cart/items/:itemId')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف یک کالا از سبد خرید کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiParam({ name: 'itemId', description: 'شناسه آیتم سبد خرید' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async removeUserCartItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const targetId = this.resolveTargetUserId(id, req);
    if (!this.removeCartItemUseCase) {
      throw new BadRequestException('RemoveCartItemUseCase not initialized');
    }
    const cart = await this.removeCartItemUseCase.execute(targetId, itemId);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Delete(':id/cart')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تخلیه کامل سبد خرید کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK })
  async clearUserCart(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const targetId = this.resolveTargetUserId(id, req);
    if (!this.clearUserCartUseCase) {
      throw new BadRequestException('ClearUserCartUseCase not initialized');
    }
    await this.clearUserCartUseCase.execute(targetId);
    return { success: true, message: 'سبد خرید کاربر با موفقیت تخلیه شد.' };
  }

  @Get(':id/orders')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت سوابق سفارش‌های کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserOrderResponseDto] })
  async getUserOrders(@Param('id') id: string, @Req() req: any): Promise<UserOrderResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserOrdersUseCase.execute(targetId);
    return list.map((o) => UserOrderResponseDto.fromDomain(o));
  }

  @Get(':id/invoices')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت صورتحساب‌ها و فاکتورهای کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserInvoiceResponseDto] })
  async getUserInvoices(@Param('id') id: string, @Req() req: any): Promise<UserInvoiceResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserInvoicesUseCase.execute(targetId);
    return list.map((inv) => UserInvoiceResponseDto.fromDomain(inv));
  }

  @Get(':id/wallet')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات و تراکنش‌های کیف پول کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserWalletResponseDto })
  async getUserWallet(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<UserWalletResponseDto | { wallet: null; balance: 0; lockedBalance: 0; currency: 'IRT'; isActive: false; transactions: []; withdrawals: [] }> {
    const targetId = this.resolveTargetUserId(id, req);
    const wallet = await this.getUserWalletUseCase.execute(targetId);
    const dto = UserWalletResponseDto.fromDomain(wallet);
    if (!dto) {
      return { wallet: null, balance: 0, lockedBalance: 0, currency: 'IRT', isActive: false, transactions: [], withdrawals: [] };
    }
    return dto;
  }

  @Get(':id/favorites')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست علاقه‌مندی‌ها و محصولات نشان‌شده کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserFavoriteResponseDto] })
  async getUserFavorites(@Param('id') id: string, @Req() req: any): Promise<UserFavoriteResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserFavoritesUseCase.execute(targetId);
    return list.map((f) => UserFavoriteResponseDto.fromDomain(f));
  }

  @Get(':id/rfq')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت استعلام‌های قیمت و RFQ کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserRfqResponseDto] })
  async getUserRfq(@Param('id') id: string, @Req() req: any): Promise<UserRfqResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserRfqUseCase.execute(targetId);
    return list.map((r) => UserRfqResponseDto.fromDomain(r));
  }

  @Get(':id/authenticity')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تاریخچه استعلام‌های اصالت و گارانتی تجهیزات کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserAuthenticityResponseDto] })
  async getUserAuthenticity(@Param('id') id: string, @Req() req: any): Promise<UserAuthenticityResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserAuthenticityUseCase.execute(targetId);
    return list.map((a) => UserAuthenticityResponseDto.fromDomain(a));
  }

  @Get(':id/loyalty')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت امتیازات و حساب باشگاه مشتریان کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserLoyaltyResponseDto })
  async getUserLoyalty(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<UserLoyaltyResponseDto | { loyalty: null; pointsBalance: 0; lifetimePoints: 0; tierCode: 'BRONZE'; tierTitle: 'سطح برنزی'; cashbackPercent: 0; transactions: [] }> {
    const targetId = this.resolveTargetUserId(id, req);
    const loyalty = await this.getUserLoyaltyUseCase.execute(targetId);
    const dto = UserLoyaltyResponseDto.fromDomain(loyalty);
    if (!dto) {
      return { loyalty: null, pointsBalance: 0, lifetimePoints: 0, tierCode: 'BRONZE', tierTitle: 'سطح برنزی', cashbackPercent: 0, transactions: [] };
    }
    return dto;
  }

  @Get(':id/sessions')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت نشست‌های فعال و تاریخچه ورود کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserSessionResponseDto] })
  async getUserSessions(@Param('id') id: string, @Req() req: any): Promise<UserSessionResponseDto[]> {
    const targetId = this.resolveTargetUserId(id, req);
    const list = await this.getUserSessionsUseCase.execute(targetId);
    return list.map((s) => UserSessionResponseDto.fromDomain(s));
  }

  @Delete(':id/sessions/:sessionId')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ابطال و اخراج نشست فعال کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiParam({ name: 'sessionId', description: 'شناسه نشست جهت ابطال' })
  @ApiResponse({ status: HttpStatus.OK })
  async revokeUserSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const targetId = this.resolveTargetUserId(id, req);
    const success = await this.revokeUserSessionUseCase.execute(targetId, sessionId);
    return {
      success,
      message: success ? 'نشست کاربر با موفقیت ابطال شد.' : 'نشست مورد نظر یافت نشد.',
    };
  }
}
