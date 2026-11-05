import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { GetUserCartUseCase } from '../../application/use-cases/user/get-user-cart.use-case.js';
import { SyncUserCartUseCase } from '../../application/use-cases/user/sync-user-cart.use-case.js';
import { AddCartItemUseCase } from '../../application/use-cases/user/add-cart-item.use-case.js';
import { UpdateCartItemUseCase } from '../../application/use-cases/user/update-cart-item.use-case.js';
import { RemoveCartItemUseCase } from '../../application/use-cases/user/remove-cart-item.use-case.js';
import { ClearUserCartUseCase } from '../../application/use-cases/user/clear-user-cart.use-case.js';
import { UserCartResponseDto } from '../dto/response/user-details/user-cart.response.dto.js';
import {
  SyncCartRequestDto,
  AddCartItemRequestDto,
  UpdateCartItemRequestDto,
} from '../dto/request/cart/cart-requests.dto.js';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly getUserCartUseCase: GetUserCartUseCase,
    private readonly syncUserCartUseCase: SyncUserCartUseCase,
    private readonly addCartItemUseCase: AddCartItemUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly clearUserCartUseCase: ClearUserCartUseCase,
  ) {}

  private resolveUserId(req: any): string {
    return (
      req?.user?.sub ||
      req?.user?.id ||
      '1811d434-1492-4521-9179-a97aa8f87a17'
    );
  }

  @Post('sync')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'همگام‌سازی سبد خرید کاربر با سرور' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async syncCart(
    @Body() dto: SyncCartRequestDto,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const userId = this.resolveUserId(req);
    const cart = await this.syncUserCartUseCase.execute(userId, dto.items || []);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت سبد خرید زنده کاربر فعلی' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async getCart(@Req() req: any): Promise<UserCartResponseDto | { cart: null; items: []; totalItems: 0; totalAmount: 0 }> {
    const userId = this.resolveUserId(req);
    const cart = await this.getUserCartUseCase.execute(userId);
    const dto = UserCartResponseDto.fromDomain(cart);
    if (!dto) {
      return { cart: null, items: [], totalItems: 0, totalAmount: 0 };
    }
    return dto;
  }

  @Post('items')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'افزودن کالا به سبد خرید' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async addItem(
    @Body() dto: AddCartItemRequestDto,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const userId = this.resolveUserId(req);
    const cart = await this.addCartItemUseCase.execute(userId, dto.productId, dto.quantity);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Patch('items/:id')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'به‌روزرسانی تعداد قلم کالا در سبد' })
  @ApiParam({ name: 'id', description: 'شناسه آیتم سبد خرید' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async updateQuantity(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemRequestDto,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const userId = this.resolveUserId(req);
    const cart = await this.updateCartItemUseCase.execute(userId, id, dto.quantity);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Delete('items/:id')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف قلم کالا از سبد خرید' })
  @ApiParam({ name: 'id', description: 'شناسه آیتم سبد خرید' })
  @ApiResponse({ status: HttpStatus.OK, type: UserCartResponseDto })
  async removeItem(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<UserCartResponseDto> {
    const userId = this.resolveUserId(req);
    const cart = await this.removeCartItemUseCase.execute(userId, id);
    return UserCartResponseDto.fromDomain(cart)!;
  }

  @Delete()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'خالی کردن سبد خرید' })
  @ApiResponse({ status: HttpStatus.OK })
  async clearCart(@Req() req: any): Promise<{ success: boolean; message: string }> {
    const userId = this.resolveUserId(req);
    await this.clearUserCartUseCase.execute(userId);
    return { success: true, message: 'سبد خرید با موفقیت تخلیه شد.' };
  }
}
