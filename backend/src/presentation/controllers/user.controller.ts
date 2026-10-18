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
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case.js';
import { GetAllUsersUseCase } from '../../application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from '../../application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserStatusUseCase } from '../../application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case.js';
import { GetUserProfileUseCase } from '../../application/use-cases/user/get-user-profile.use-case.js';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/update-user-profile.use-case.js';
import { UploadUserAvatarUseCase } from '../../application/use-cases/user/upload-user-avatar.use-case.js';
import { DeleteUserAvatarUseCase } from '../../application/use-cases/user/delete-user-avatar.use-case.js';
import { GetUserAddressesUseCase } from '../../application/use-cases/user/get-user-addresses.use-case.js';
import { GetUserCartUseCase } from '../../application/use-cases/user/get-user-cart.use-case.js';
import { GetUserOrdersUseCase } from '../../application/use-cases/user/get-user-orders.use-case.js';
import { GetUserInvoicesUseCase } from '../../application/use-cases/user/get-user-invoices.use-case.js';
import { GetUserWalletUseCase } from '../../application/use-cases/user/get-user-wallet.use-case.js';
import { GetUserFavoritesUseCase } from '../../application/use-cases/user/get-user-favorites.use-case.js';
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
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserAddressesUseCase: GetUserAddressesUseCase,
    private readonly getUserCartUseCase: GetUserCartUseCase,
    private readonly getUserOrdersUseCase: GetUserOrdersUseCase,
    private readonly getUserInvoicesUseCase: GetUserInvoicesUseCase,
    private readonly getUserWalletUseCase: GetUserWalletUseCase,
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private readonly getUserRfqUseCase: GetUserRfqUseCase,
    private readonly getUserAuthenticityUseCase: GetUserAuthenticityUseCase,
    private readonly getUserLoyaltyUseCase: GetUserLoyaltyUseCase,
    private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    private readonly revokeUserSessionUseCase: RevokeUserSessionUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly uploadUserAvatarUseCase: UploadUserAvatarUseCase,
    private readonly deleteUserAvatarUseCase: DeleteUserAvatarUseCase,
  ) {}

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
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    return await this.getUserProfileUseCase.execute(userId);
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
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    return await this.updateUserProfileUseCase.execute(userId, dto);
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
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
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
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    return await this.deleteUserAvatarUseCase.execute(userId);
  }

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

  @Get(':id/addresses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست نشانی‌های کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressResponseDto] })
  async getUserAddresses(@Param('id') id: string): Promise<AddressResponseDto[]> {
    const list = await this.getUserAddressesUseCase.execute(id);
    return list.map((a) => AddressResponseDto.fromDomain(a));
  }

  @Get(':id/cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت سبد خرید فعال کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async getUserCart(@Param('id') id: string): Promise<UserCartResponseDto | { cart: null; items: []; totalItems: 0; totalAmount: 0 }> {
    const cart = await this.getUserCartUseCase.execute(id);
    const dto = UserCartResponseDto.fromDomain(cart);
    if (!dto) {
      return { cart: null, items: [], totalItems: 0, totalAmount: 0 };
    }
    return dto;
  }

  @Get(':id/orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت سوابق سفارش‌های کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserOrderResponseDto] })
  async getUserOrders(@Param('id') id: string): Promise<UserOrderResponseDto[]> {
    const list = await this.getUserOrdersUseCase.execute(id);
    return list.map((o) => UserOrderResponseDto.fromDomain(o));
  }

  @Get(':id/invoices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت صورتحساب‌ها و فاکتورهای کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserInvoiceResponseDto] })
  async getUserInvoices(@Param('id') id: string): Promise<UserInvoiceResponseDto[]> {
    const list = await this.getUserInvoicesUseCase.execute(id);
    return list.map((inv) => UserInvoiceResponseDto.fromDomain(inv));
  }

  @Get(':id/wallet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات و تراکنش‌های کیف پول کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserWalletResponseDto })
  async getUserWallet(
    @Param('id') id: string,
  ): Promise<UserWalletResponseDto | { wallet: null; balance: 0; lockedBalance: 0; currency: 'IRT'; isActive: false; transactions: []; withdrawals: [] }> {
    const wallet = await this.getUserWalletUseCase.execute(id);
    const dto = UserWalletResponseDto.fromDomain(wallet);
    if (!dto) {
      return { wallet: null, balance: 0, lockedBalance: 0, currency: 'IRT', isActive: false, transactions: [], withdrawals: [] };
    }
    return dto;
  }

  @Get(':id/favorites')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست علاقه‌مندی‌ها و محصولات نشان‌شده کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserFavoriteResponseDto] })
  async getUserFavorites(@Param('id') id: string): Promise<UserFavoriteResponseDto[]> {
    const list = await this.getUserFavoritesUseCase.execute(id);
    return list.map((f) => UserFavoriteResponseDto.fromDomain(f));
  }

  @Get(':id/rfq')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت استعلام‌های قیمت و RFQ کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserRfqResponseDto] })
  async getUserRfq(@Param('id') id: string): Promise<UserRfqResponseDto[]> {
    const list = await this.getUserRfqUseCase.execute(id);
    return list.map((r) => UserRfqResponseDto.fromDomain(r));
  }

  @Get(':id/authenticity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تاریخچه استعلام‌های اصالت و گارانتی تجهیزات کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserAuthenticityResponseDto] })
  async getUserAuthenticity(@Param('id') id: string): Promise<UserAuthenticityResponseDto[]> {
    const list = await this.getUserAuthenticityUseCase.execute(id);
    return list.map((a) => UserAuthenticityResponseDto.fromDomain(a));
  }

  @Get(':id/loyalty')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت امتیازات و حساب باشگاه مشتریان کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: UserLoyaltyResponseDto })
  async getUserLoyalty(
    @Param('id') id: string,
  ): Promise<UserLoyaltyResponseDto | { loyalty: null; pointsBalance: 0; lifetimePoints: 0; tierCode: 'BRONZE'; tierTitle: 'سطح برنزی'; cashbackPercent: 0; transactions: [] }> {
    const loyalty = await this.getUserLoyaltyUseCase.execute(id);
    const dto = UserLoyaltyResponseDto.fromDomain(loyalty);
    if (!dto) {
      return { loyalty: null, pointsBalance: 0, lifetimePoints: 0, tierCode: 'BRONZE', tierTitle: 'سطح برنزی', cashbackPercent: 0, transactions: [] };
    }
    return dto;
  }

  @Get(':id/sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت نشست‌های فعال و تاریخچه ورود کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای کاربر' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserSessionResponseDto] })
  async getUserSessions(@Param('id') id: string): Promise<UserSessionResponseDto[]> {
    const list = await this.getUserSessionsUseCase.execute(id);
    return list.map((s) => UserSessionResponseDto.fromDomain(s));
  }

  @Delete(':id/sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ابطال و اخراج نشست فعال کاربر' })
  @ApiParam({ name: 'id', description: 'شناسه کاربر' })
  @ApiParam({ name: 'sessionId', description: 'شناسه نشست جهت ابطال' })
  @ApiResponse({ status: HttpStatus.OK })
  async revokeUserSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.revokeUserSessionUseCase.execute(id, sessionId);
    return {
      success,
      message: success ? 'نشست کاربر با موفقیت ابطال شد.' : 'نشست مورد نظر یافت نشد.',
    };
  }
}
