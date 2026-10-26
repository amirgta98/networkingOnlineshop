import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard.js';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { GetUserFavoritesUseCase } from '../../application/use-cases/user/get-user-favorites.use-case.js';
import { AddUserFavoriteUseCase } from '../../application/use-cases/user/add-user-favorite.use-case.js';
import { RemoveUserFavoriteUseCase } from '../../application/use-cases/user/remove-user-favorite.use-case.js';
import { ToggleUserFavoriteUseCase } from '../../application/use-cases/user/toggle-user-favorite.use-case.js';
import { CheckUserFavoriteUseCase } from '../../application/use-cases/user/check-user-favorite.use-case.js';
import { UserFavoriteResponseDto } from '../dto/response/user-details/user-favorites.response.dto.js';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private readonly addUserFavoriteUseCase: AddUserFavoriteUseCase,
    private readonly removeUserFavoriteUseCase: RemoveUserFavoriteUseCase,
    private readonly toggleUserFavoriteUseCase: ToggleUserFavoriteUseCase,
    private readonly checkUserFavoriteUseCase: CheckUserFavoriteUseCase,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست نشان‌شده‌ها و علاقه‌مندی‌های کاربر جاری' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserFavoriteResponseDto] })
  async getMyFavorites(@Req() req: any): Promise<UserFavoriteResponseDto[]> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('شناسه کاربر احراز هویت شده یافت نشد.');
    }
    const list = await this.getUserFavoritesUseCase.execute(userId);
    return list.map((f) => UserFavoriteResponseDto.fromDomain(f));
  }

  @Post(':productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'افزودن محصول به لیست علاقه‌مندی‌های کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserFavoriteResponseDto })
  async addFavorite(
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

  @Delete(':productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف محصول از لیست علاقه‌مندی‌های کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول یا شناسه آیتم' })
  @ApiResponse({ status: HttpStatus.OK })
  async removeFavorite(
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

  @Post('toggle/:productId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تغییر وضعیت علاقه‌مندی محصول (افزودن/حذف) برای کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول' })
  @ApiResponse({ status: HttpStatus.OK })
  async toggleFavorite(
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

  @Get('check/:productId')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بررسی نشان‌شدن محصول توسط کاربر جاری' })
  @ApiParam({ name: 'productId', description: 'شناسه یا نامک (اسلاگ) محصول' })
  @ApiResponse({ status: HttpStatus.OK })
  async checkFavorite(
    @Req() req: any,
    @Param('productId') productId: string,
  ): Promise<{ isFavorited: boolean }> {
    const userId = req.user?.sub || req.user?.id;
    const isFavorited = await this.checkUserFavoriteUseCase.execute(userId, productId);
    return { isFavorited };
  }
}
