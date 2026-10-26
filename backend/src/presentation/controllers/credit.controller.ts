import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { GetUserCreditUseCase } from '../../application/use-cases/credit/get-user-credit.use-case.js';
import {
  GetUserChequesUseCase,
  CreateChequeUseCase,
} from '../../application/use-cases/credit/cheques.use-case.js';
import { USER_REPOSITORY_TOKEN } from '../../shared/constants/tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Credit & Sayad Cheques')
@Controller('credit')
export class CreditController {
  constructor(
    private readonly getUserCreditUseCase: GetUserCreditUseCase,
    private readonly getUserChequesUseCase: GetUserChequesUseCase,
    private readonly createChequeUseCase: CreateChequeUseCase,
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
    return '00000000-0000-4000-a000-000000000001';
  }

  @Get('my')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت وضعیت خط اعتباری و سقف خرید همکار جاری' })
  async getMyCredit(@Req() req: AuthenticatedRequest) {
    const userId = await this.resolveUserId(req);
    return this.getUserCreditUseCase.execute(userId);
  }

  @Get('cheques')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'لیست چک‌های صیادی بنفش ثبت‌شده همکار' })
  async getMyCheques(@Req() req: AuthenticatedRequest) {
    const userId = await this.resolveUserId(req);
    return this.getUserChequesUseCase.execute(userId);
  }

  @Post('cheques')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت چک صیادی جدید جهت تضمین خط اعتباری' })
  async createCheque(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      chequeId: string;
      bank?: string;
      branch?: string;
      dueDate?: string;
      amount: number;
      serialNumber?: string;
    },
  ) {
    if (!body.chequeId?.trim()) {
      throw new BadRequestException('شناسه ۱۶ رقمی صیادی چک الزامی است.');
    }
    const userId = await this.resolveUserId(req);
    return this.createChequeUseCase.execute({
      userId,
      ...body,
    });
  }
}
