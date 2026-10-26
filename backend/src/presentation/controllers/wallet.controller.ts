import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { RequestWalletWithdrawalUseCase } from '../../application/use-cases/wallet/request-wallet-withdrawal.use-case.js';
import { GetAdminWithdrawalsUseCase } from '../../application/use-cases/wallet/get-admin-withdrawals.use-case.js';
import { GetAdminDepositsUseCase } from '../../application/use-cases/wallet/get-admin-deposits.use-case.js';
import { UpdateWithdrawalStatusUseCase } from '../../application/use-cases/wallet/update-withdrawal-status.use-case.js';
import { GetUserWalletUseCase } from '../../application/use-cases/user/get-user-wallet.use-case.js';
import { RequestWithdrawalDto, UpdateWithdrawalStatusDto } from '../../application/dto/wallet/wallet.dto.js';
import {
  UserWalletResponseDto,
  UserWalletWithdrawalResponseDto,
} from '../dto/response/user-details/user-wallet.response.dto.js';
import { USER_REPOSITORY_TOKEN } from '../../shared/constants/tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Wallet & Financial Requests')
@Controller()
export class WalletController {
  constructor(
    private readonly requestWithdrawalUseCase: RequestWalletWithdrawalUseCase,
    private readonly getAdminWithdrawalsUseCase: GetAdminWithdrawalsUseCase,
    private readonly getAdminDepositsUseCase: GetAdminDepositsUseCase,
    private readonly updateWithdrawalStatusUseCase: UpdateWithdrawalStatusUseCase,
    private readonly getUserWalletUseCase: GetUserWalletUseCase,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  private async resolveUserId(req: AuthenticatedRequest): Promise<string> {
    if (req.user?.sub) {
      return req.user.sub;
    }
    const allUsers = await this.userRepository.findAll();
    if (allUsers && allUsers.length > 0) {
      return allUsers[0].id;
    }
    throw new BadRequestException('برای دسترسی به کیف پول لطفاً ابتدا وارد حساب کاربری خود شوید.');
  }

  // ─── User / Partner Endpoints ──────────────────────────────────────────

  @Get('wallet/my-wallet')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت مشخصات کامل کیف پول کاربر یا همکار جاری' })
  @ApiResponse({ status: HttpStatus.OK, type: UserWalletResponseDto })
  async getMyWallet(@Req() req: AuthenticatedRequest) {
    const userId = await this.resolveUserId(req);
    const wallet = await this.getUserWalletUseCase.execute(userId);
    return UserWalletResponseDto.fromDomain(wallet) || {
      id: '',
      userId,
      balance: 0,
      lockedBalance: 0,
      currency: 'IRT',
      isActive: true,
      transactions: [],
      withdrawals: [],
    };
  }

  @Post('wallet/withdraw')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت درخواست تسویه و برداشت وجه از کیف پول با شماره کارت و شبا' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserWalletWithdrawalResponseDto })
  async requestWithdrawal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestWithdrawalDto,
  ): Promise<UserWalletWithdrawalResponseDto> {
    const userId = await this.resolveUserId(req);
    const withdrawal = await this.requestWithdrawalUseCase.execute({
      userId,
      amount: dto.amount,
      cardNumber: dto.cardNumber,
      shabaNumber: dto.shabaNumber,
      accountHolder: dto.accountHolder,
      bankName: dto.bankName,
    });
    return UserWalletWithdrawalResponseDto.fromDomain(withdrawal);
  }

  @Get('wallet/withdrawals')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست درخواست‌های برداشت کاربر جاری' })
  async getMyWithdrawals(@Req() req: AuthenticatedRequest) {
    const userId = await this.resolveUserId(req);
    const wallet = await this.getUserWalletUseCase.execute(userId);
    return (wallet?.withdrawals || []).map(UserWalletWithdrawalResponseDto.fromDomain);
  }

  @Get('wallet/deposits')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت لیست واریزی‌ها و شارژهای کاربر جاری' })
  async getMyDeposits(@Req() req: AuthenticatedRequest) {
    const userId = await this.resolveUserId(req);
    const wallet = await this.getUserWalletUseCase.execute(userId);
    const deposits = (wallet?.transactions || []).filter((tx) => tx.type === 'DEPOSIT');
    return deposits;
  }

  // ─── Admin Endpoints ──────────────────────────────────────────────────

  @Get('admin/wallet/withdrawals')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مشاهده کلیه درخواست‌های برداشت کاربران و همکاران برای ادمین' })
  @ApiQuery({ name: 'status', required: false, description: 'فیلتر بر اساس وضعیت' })
  @ApiQuery({ name: 'search', required: false, description: 'جستجو در نام، شماره کارت، شبا، تلفن و کد رهگیری' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAdminWithdrawals(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.getAdminWithdrawalsUseCase.execute({
      status,
      search,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('admin/wallet/deposits')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مشاهده کلیه تراکنش‌های واریز و شارژ کیف پول کاربران و همکاران برای ادمین' })
  @ApiQuery({ name: 'search', required: false, description: 'جستجو در نام، شماره تماس و کد رهگیری' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAdminDeposits(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.getAdminDepositsUseCase.execute({
      search,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Patch('admin/wallet/withdrawals/:id/status')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تغییر وضعیت درخواست برداشت (تایید و واریز پایا، در حال پردازش یا رد و استرداد)' })
  @ApiParam({ name: 'id', description: 'شناسه یکتای درخواست برداشت' })
  async updateWithdrawalStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWithdrawalStatusDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserWalletWithdrawalResponseDto> {
    const adminUserId = req.user?.sub;
    const updated = await this.updateWithdrawalStatusUseCase.execute({
      withdrawalId: id,
      status: dto.status,
      payoutReference: dto.payoutReference,
      rejectionReason: dto.rejectionReason,
      adminUserId,
    });
    return UserWalletWithdrawalResponseDto.fromDomain(updated);
  }
}
