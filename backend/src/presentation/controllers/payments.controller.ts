import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthGuard } from '../guards/auth.guard.js';
import { OptionalAuthGuard } from '../guards/optional-auth.guard.js';
import { RequestOrderPaymentUseCase } from '../../application/use-cases/payment/request-order-payment.use-case.js';
import { RequestWalletChargeUseCase } from '../../application/use-cases/payment/request-wallet-charge.use-case.js';
import { RequestInvoicePaymentUseCase } from '../../application/use-cases/payment/request-invoice-payment.use-case.js';
import { VerifyPaymentUseCase } from '../../application/use-cases/payment/verify-payment.use-case.js';
import {
  RequestOrderPaymentDto,
  RequestWalletChargeDto,
  RequestInvoicePaymentDto,
  DirectVerifyPaymentDto,
} from '../dto/request/payment/request-payment.dto.js';
import {
  PaymentInitiatedResponseDto,
  PaymentVerificationResponseDto,
} from '../dto/response/payment/payment.response.dto.js';
import { USER_REPOSITORY_TOKEN } from '../../shared/constants/tokens.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role?: string;
    phone?: string;
  };
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly requestOrderPaymentUseCase: RequestOrderPaymentUseCase,
    private readonly requestWalletChargeUseCase: RequestWalletChargeUseCase,
    private readonly requestInvoicePaymentUseCase: RequestInvoicePaymentUseCase,
    private readonly verifyPaymentUseCase: VerifyPaymentUseCase,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  @Post('order/:orderId/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ایجاد تراکنش پرداخت آنلاین زرین‌پال برای سفارش' })
  @ApiParam({ name: 'orderId', description: 'شناسه یا شماره سفارش' })
  @ApiResponse({ status: HttpStatus.OK, type: PaymentInitiatedResponseDto })
  async payOrder(
    @Param('orderId') orderId: string,
    @Body() dto: RequestOrderPaymentDto,
    @Req() req: Request,
  ): Promise<PaymentInitiatedResponseDto> {
    const defaultCallback = this.resolveCallbackUrl(req, dto.callbackUrl);

    const result = await this.requestOrderPaymentUseCase.execute({
      orderId,
      callbackUrl: defaultCallback,
    });

    return {
      authority: result.authority,
      paymentUrl: result.paymentUrl,
      trackingCode: result.trackingCode,
      amount: result.amount,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    };
  }

  @Post('wallet/charge')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ایجاد تراکنش شارژ آنلاین کیف پول با درگاه زرین‌پال' })
  @ApiResponse({ status: HttpStatus.OK, type: PaymentInitiatedResponseDto })
  async chargeWallet(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestWalletChargeDto,
  ): Promise<PaymentInitiatedResponseDto> {
    let userId = req.user?.sub;

    if (!userId) {
      // Find default or first active user for guest/demo convenience
      const users = await this.userRepository.findAll();
      if (users && users.length > 0) {
        userId = users[0].id;
      } else {
        throw new BadRequestException('برای شارژ کیف پول ابتدا وارد حساب کاربری خود شوید.');
      }
    }

    const defaultCallback = this.resolveCallbackUrl(req, dto.callbackUrl);

    const result = await this.requestWalletChargeUseCase.execute({
      userId,
      amount: dto.amount,
      callbackUrl: defaultCallback,
    });

    return {
      authority: result.authority,
      paymentUrl: result.paymentUrl,
      trackingCode: result.trackingCode,
      amount: result.amount,
    };
  }

  @Post('invoice/:invoiceId/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ایجاد تراکنش تسویه آنلاین فاکتور با زرین‌پال' })
  @ApiParam({ name: 'invoiceId', description: 'شناسه یا شماره فاکتور' })
  @ApiResponse({ status: HttpStatus.OK, type: PaymentInitiatedResponseDto })
  async payInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: RequestInvoicePaymentDto,
    @Req() req: Request,
  ): Promise<PaymentInitiatedResponseDto> {
    const defaultCallback = this.resolveCallbackUrl(req, dto.callbackUrl);

    const result = await this.requestInvoicePaymentUseCase.execute({
      invoiceId,
      callbackUrl: defaultCallback,
    });

    return {
      authority: result.authority,
      paymentUrl: result.paymentUrl,
      trackingCode: result.trackingCode,
      amount: result.amount,
      invoiceId: result.invoiceId,
      invoiceNumber: result.invoiceNumber,
    };
  }

  /**
   * Zarinpal gateway callback redirect handler
   */
  @Get('verify')
  @ApiOperation({ summary: 'بازگشت از درگاه پرداخت شاپرک زرین‌پال و تأیید تراکنش' })
  @ApiQuery({ name: 'Authority', required: true })
  @ApiQuery({ name: 'Status', required: false })
  async verifyCallback(
    @Query('Authority') authority: string,
    @Query('Status') status: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!authority) {
      return res.redirect(this.getFrontendUrl(req, '/payment/callback?status=failed&message=' + encodeURIComponent('شناسه تراکنش یافت نشد.')));
    }

    try {
      const result = await this.verifyPaymentUseCase.execute({
        authority,
        status,
      });

      const frontendBase = this.getFrontendUrl(req);
      const queryParams = new URLSearchParams({
        status: result.success ? 'success' : 'failed',
        authority,
        trackingCode: result.trackingCode,
        refId: result.refId || '',
        cardPan: result.cardPan || '',
        type: result.type,
        targetId: result.targetId,
        orderNumber: result.orderNumber || '',
        invoiceNumber: result.invoiceNumber || '',
        amount: String(result.amount),
        message: result.message,
      });

      return res.redirect(`${frontendBase}/payment/callback?${queryParams.toString()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.redirect(
        this.getFrontendUrl(
          req,
          `/payment/callback?status=failed&authority=${encodeURIComponent(authority)}&message=${encodeURIComponent(msg)}`,
        ),
      );
    }
  }

  /**
   * Direct API endpoint for verifying a payment without HTTP 302 redirect
   */
  @Post('verify-direct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'اعتبارسنجی مستقیم تراکنش بدون ریدایرکت' })
  @ApiResponse({ status: HttpStatus.OK, type: PaymentVerificationResponseDto })
  async verifyDirect(@Body() dto: DirectVerifyPaymentDto): Promise<PaymentVerificationResponseDto> {
    const result = await this.verifyPaymentUseCase.execute({
      authority: dto.authority,
      status: dto.status || 'OK',
      amount: dto.amount,
      type: dto.type,
      targetId: dto.targetId,
      userId: dto.userId,
      trackingCode: dto.trackingCode,
    });

    return result;
  }

  /**
   * Built-in sandbox gateway simulation page if Zarinpal site is unreachable or offline
   */
  @Get('mock-gateway')
  @ApiOperation({ summary: 'صفحه شبیه‌ساز درگاه شاپرک زرین‌پال برای محیط تست آفلاین' })
  mockGateway(
    @Query('authority') authority: string,
    @Query('amount') amount: string,
    @Query('callbackUrl') callbackUrl: string,
    @Res() res: Response,
  ) {
    const formattedAmount = Number(amount || 0).toLocaleString('fa-IR');
    const safeCallback = callbackUrl || '/api/v1/payments/verify';

    const successUrl = `${safeCallback}${safeCallback.includes('?') ? '&' : '?'}Authority=${authority}&Status=OK`;
    const cancelUrl = `${safeCallback}${safeCallback.includes('?') ? '&' : '?'}Authority=${authority}&Status=NOK`;

    const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>درگاه پرداخت تستی زرین‌پال | ققنوس آکادمی</title>
  <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #0c0d0e; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.5rem; }
    .card { background: #16171b; border: 1px solid #27272a; border-radius: 1.5rem; width: 100%; max-width: 460px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); color: #fb923c; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem; }
    .title { font-size: 1.25rem; font-weight: 900; color: #fff; margin-bottom: 0.25rem; }
    .subtitle { font-size: 0.8rem; color: #94a3b8; }
    .info-box { background: #0f1013; border: 1px solid #1e2025; border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem; }
    .info-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
    .info-label { color: #94a3b8; }
    .info-value { font-weight: 700; color: #fff; font-family: monospace; }
    .info-value.amount { font-size: 1.2rem; color: #34d399; font-weight: 900; }
    .terminal { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.5rem; }
    .card-num { font-family: monospace; letter-spacing: 2px; font-size: 1.05rem; color: #f8fafc; margin-bottom: 0.5rem; text-align: center; }
    .card-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; }
    .actions { display: flex; flex-direction: column; gap: 0.75rem; }
    .btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.85rem 1rem; border-radius: 0.85rem; font-size: 0.9rem; font-weight: 700; text-decoration: none; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-success { background: #10b981; color: #022c22; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); }
    .btn-success:hover { background: #059669; }
    .btn-cancel { background: transparent; color: #94a3b8; border: 1px solid #3f3f46; }
    .btn-cancel:hover { background: #27272a; color: #fff; }
    .note { margin-top: 1.25rem; text-align: center; font-size: 0.7rem; color: #64748b; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">
        <span>⚡ شبیه‌ساز سندباکس زرین‌پال شاپرک</span>
      </div>
      <h1 class="title">تست پرداخت آنلاین شاپرک</h1>
      <p class="subtitle">تجهیزات تخصصی شبکه ققنوس آکادمی</p>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">مبلغ قابل پرداخت:</span>
        <span class="info-value amount">${formattedAmount} تومان</span>
      </div>
      <div class="info-row">
        <span class="info-label">شناسه تراکنش:</span>
        <span class="info-value" style="font-size:0.75rem">${authority}</span>
      </div>
      <div class="info-row">
        <span class="info-label">پذیرنده:</span>
        <span class="info-value">ققنوس آکادمی (تستی)</span>
      </div>
    </div>

    <div class="terminal">
      <div class="card-num">۶۰۳۷ - ۹۹** - **** - ۵۵۲۱</div>
      <div class="card-meta">
        <span>کارت تستی شتاب</span>
        <span>CVV2: ***</span>
      </div>
    </div>

    <div class="actions">
      <a href="${successUrl}" class="btn btn-success">
        ✓ تکمیل تراکنش با موفقیت (پرداخت تستی)
      </a>
      <a href="${cancelUrl}" class="btn btn-cancel">
        ✕ انصراف از پرداخت و بازگشت
      </a>
    </div>

    <p class="note">
      این درگاه در حالت تستی (Sandbox) قرار داشته و هیچ هزینه‌ای از کارت بانکی شما کسر نمی‌گردد.
    </p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  private resolveCallbackUrl(req: Request, explicitCallback?: string): string {
    if (explicitCallback) {
      return explicitCallback;
    }
    const envUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.startsWith('http')) {
      const clean = envUrl.replace(/\/$/, '');
      return clean.endsWith('/payments/verify') ? clean : `${clean}/payments/verify`;
    }
    let host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3001';
    if (host.startsWith('0.0.0.0')) {
      host = host.replace('0.0.0.0', 'localhost');
    }
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    return `${protocol}://${host}/api/v1/payments/verify`;
  }

  private getFrontendUrl(req: Request, path: string = ''): string {
    const configured =
      process.env.FRONTEND_URL ||
      process.env.CORS_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (configured && configured.startsWith('http')) {
      return `${configured.replace(/\/$/, '')}${path}`;
    }
    const origin = req.get('origin') || req.get('referer');
    if (origin) {
      try {
        const parsed = new URL(origin);
        let host = parsed.host;
        if (host.startsWith('0.0.0.0')) {
          host = host.replace('0.0.0.0', 'localhost');
        }
        return `${parsed.protocol}//${host}${path}`;
      } catch {
        // ignore
      }
    }
    return `http://localhost:3000${path}`;
  }
}
