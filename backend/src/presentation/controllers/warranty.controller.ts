import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { GetUserAuthenticityUseCase } from '../../application/use-cases/user/get-user-authenticity.use-case.js';
import { VerifySerialUseCase } from '../../application/use-cases/warranty/verify-serial.use-case.js';
import { CreateRmaUseCase } from '../../application/use-cases/warranty/create-rma.use-case.js';
import { USER_REPOSITORY_TOKEN } from '../../shared/constants/tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserAuthenticityResponseDto } from '../dto/response/user-details/user-authenticity.response.dto.js';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Warranty & Authenticity (RMA)')
@Controller('warranty')
export class WarrantyController {
  constructor(
    private readonly getUserAuthenticityUseCase: GetUserAuthenticityUseCase,
    private readonly verifySerialUseCase: VerifySerialUseCase,
    private readonly createRmaUseCase: CreateRmaUseCase,
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

  @Get('verify/:serialNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'استعلام اصالت سریال قطعه و وضعیت گارانتی طلایی' })
  @ApiParam({ name: 'serialNumber', description: 'شماره سریال قطعه شبکه' })
  async verifySerial(@Param('serialNumber') serialNumber: string) {
    if (!serialNumber?.trim()) {
      throw new BadRequestException('شماره سریال قطعه الزامی است.');
    }
    const result = await this.verifySerialUseCase.execute(serialNumber);
    if (!result) {
      return {
        isAuthentic: false,
        serialNumber: serialNumber.trim().toUpperCase(),
        status: 'invalid',
        statusLabel: 'سریال نامعتبر — در پایگاه داده ققنوس یافت نشد',
        productName: 'تجهیزات ناشناخته',
        brand: 'نامشخص',
        daysRemaining: 0,
      };
    }
    return UserAuthenticityResponseDto.fromDomain(result);
  }

  @Get('my')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'دریافت تاریخچه استعلام‌ها و درخواست‌های RMA کاربر جاری' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserAuthenticityResponseDto] })
  async getMyWarranty(@Req() req: AuthenticatedRequest): Promise<UserAuthenticityResponseDto[]> {
    const userId = await this.resolveUserId(req);
    const list = await this.getUserAuthenticityUseCase.execute(userId);
    return list.map((a) => UserAuthenticityResponseDto.fromDomain(a));
  }

  @Post('rma')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت درخواست تعویض درجا یا تعمیر (RMA)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserAuthenticityResponseDto })
  async createRma(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      serialNumber: string;
      productName: string;
      faultDescription: string;
      deliveryMethod?: string;
      brand?: string;
    },
  ): Promise<UserAuthenticityResponseDto> {
    if (!body.serialNumber?.trim()) {
      throw new BadRequestException('شماره سریال قطعه الزامی است.');
    }
    const userId = await this.resolveUserId(req);
    const created = await this.createRmaUseCase.execute({
      userId,
      serialNumber: body.serialNumber,
      productName: body.productName,
      faultDescription: body.faultDescription,
      deliveryMethod: body.deliveryMethod,
      brand: body.brand,
    });
    return UserAuthenticityResponseDto.fromDomain(created);
  }
}
