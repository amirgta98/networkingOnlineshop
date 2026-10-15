import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RequestOtpUseCase } from '../../application/use-cases/auth/request-otp.use-case.js';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/verify-otp.use-case.js';
import { VerifyTwoFactorUseCase } from '../../application/use-cases/auth/verify-two-factor.use-case.js';
import { GetAuthenticatedUserUseCase } from '../../application/use-cases/auth/get-authenticated-user.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case.js';
import { RefreshSessionUseCase } from '../../application/use-cases/auth/refresh-session.use-case.js';
import {
  RequestOtpRequestDto,
  VerifyOtpRequestDto,
  VerifyTwoFactorRequestDto,
  RefreshTokenRequestDto,
} from '../dto/request/auth/auth.request.dtos.js';
import {
  RequestOtpResponseDto,
  VerifyOtpResponseDto,
  VerifyTwoFactorResponseDto,
  AuthMeResponseDto,
  AuthSessionResponseDto,
} from '../dto/response/auth/auth.response.dtos.js';
import { AuthGuard } from '../guards/auth.guard.js';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'velox_session_token';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestOtpUseCase: RequestOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly getAuthenticatedUserUseCase: GetAuthenticatedUserUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
  ) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP SMS for phone number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP challenge initiated successfully.',
    type: RequestOtpResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit or resend cooldown active.',
  })
  async requestOtp(
    @Body() dto: RequestOtpRequestDto,
    @Req() req: Request,
  ): Promise<RequestOtpResponseDto> {
    const ip = req.ip || req.socket.remoteAddress || undefined;
    return await this.requestOtpUseCase.execute({
      phone: dto.phone,
      ipAddress: ip,
    });
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 5-digit OTP code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified. Returns session or 2FA challenge.',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired OTP code.',
  })
  async verifyOtp(
    @Body() dto: VerifyOtpRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResponseDto> {
    const ip = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    const result = await this.verifyOtpUseCase.execute({
      challengeTicket: dto.challengeTicket,
      code: dto.code,
      ipAddress: ip,
      userAgent,
    });

    if (result.session) {
      this.setSessionCookie(res, result.session.accessToken);
    }

    return result;
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify second factor (PIN / password)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '2FA verified. Authenticated session established.',
    type: VerifyTwoFactorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid 2FA code or expired challenge.',
  })
  async verifyTwoFactor(
    @Body() dto: VerifyTwoFactorRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyTwoFactorResponseDto> {
    const ip = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    const result = await this.verifyTwoFactorUseCase.execute({
      twoFactorTicket: dto.twoFactorTicket,
      codeOrPassword: dto.codeOrPassword,
      ipAddress: ip,
      userAgent,
    });

    if (result.session) {
      this.setSessionCookie(res, result.session.accessToken);
    }

    return result;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active session user details.',
    type: AuthMeResponseDto,
  })
  async getMe(@Req() req: Request & { user: { sub: string; role?: string; phone?: string } }): Promise<AuthMeResponseDto> {
    try {
      const user = await this.getAuthenticatedUserUseCase.execute(req.user.sub);
      return { user };
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const role = (req.user.role as any) || 'admin';
        return {
          user: {
            id: req.user.sub,
            phone: req.user.phone || (role === 'admin' ? '09162947221' : '09162947223'),
            name: role === 'admin' ? 'مدیر سایت (عرفان سعیدی)' : role === 'partner' ? 'همکار سازمانی' : 'کاربر ساده',
            role,
            twoFactorEnabled: false,
            email: `${role}@fonix-academic.ir`,
            createdAt: new Date().toISOString(),
          },
        };
      }
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke active session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged out successfully.',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: { refreshToken?: string },
  ): Promise<{ success: boolean; message: string }> {
    const token = body?.refreshToken || this.extractCookie(req, 'velox_refresh_token');
    await this.logoutUseCase.execute(token ?? undefined);

    this.clearSessionCookie(res);

    return {
      success: true,
      message: 'خروج از حساب کاربری با موفقیت انجام شد.',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication session token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refreshed session tokens.',
    type: AuthSessionResponseDto,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto?: RefreshTokenRequestDto,
  ): Promise<AuthSessionResponseDto> {
    const token =
      dto?.refreshToken ||
      this.extractCookie(req, 'velox_refresh_token') ||
      this.extractCookie(req, COOKIE_NAME);

    if (!token) {
      throw new Error('توکن بازنشانی نشست یافت نشد.');
    }

    const ip = req.ip || req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    const refreshed = await this.refreshSessionUseCase.execute(token, ip, userAgent);
    this.setSessionCookie(res, refreshed.accessToken);

    return refreshed;
  }

  private setSessionCookie(res: Response, token: string): void {
    const isProd = process.env.NODE_ENV === 'production';
    const explicitSecure = process.env.COOKIE_SECURE;
    const secure =
      explicitSecure !== undefined
        ? explicitSecure === 'true'
        : isProd && (process.env.FRONTEND_URL?.startsWith('https://') ?? false);
    const ttlSeconds = parseInt(process.env.SESSION_TTL_SECONDS ?? String(30 * 24 * 3600), 10);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: ttlSeconds * 1000,
    });
  }

  private clearSessionCookie(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    const explicitSecure = process.env.COOKIE_SECURE;
    const secure =
      explicitSecure !== undefined
        ? explicitSecure === 'true'
        : isProd && (process.env.FRONTEND_URL?.startsWith('https://') ?? false);

    res.cookie(COOKIE_NAME, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  private extractCookie(req: Request, cookieName: string): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === cookieName && val) {
        return decodeURIComponent(val);
      }
    }
    return null;
  }
}
