import { Injectable, Logger, Optional } from '@nestjs/common';
import { ISmsProvider, SmsSendResult } from './sms-provider.interface.js';
import { MelipayamakBaseServiceProvider } from './melipayamak-base-service.provider.js';
import { MelipayamakConsoleOtpProvider } from './melipayamak-console-otp.provider.js';
import { TelegramOtpService } from './telegram-otp.service.js';

@Injectable()
export class CompositeSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(CompositeSmsProvider.name);
  private readonly baseServiceProvider: MelipayamakBaseServiceProvider;
  private readonly consoleOtpProvider: MelipayamakConsoleOtpProvider;
  private readonly telegramOtpService: TelegramOtpService;

  constructor(
    @Optional() telegramOtpService?: TelegramOtpService,
    @Optional() baseServiceProvider?: MelipayamakBaseServiceProvider,
    @Optional() consoleOtpProvider?: MelipayamakConsoleOtpProvider,
  ) {
    this.baseServiceProvider = baseServiceProvider ?? new MelipayamakBaseServiceProvider();
    this.consoleOtpProvider = consoleOtpProvider ?? new MelipayamakConsoleOtpProvider();
    this.telegramOtpService = telegramOtpService ?? new TelegramOtpService();
  }

  async sendOtp(to: string, code: string): Promise<SmsSendResult> {
    // 1. In automated testing environments, avoid outbound network requests
    if (process.env.NODE_ENV === 'test' || process.env.MOCK_SMS === 'true') {
      const masked = `${to.substring(0, 4)}***${to.substring(7)}`;
      this.logger.log(`[TEST MOCK SMS] Simulated SMS dispatch to ${masked} (automated test).`);
      return {
        success: true,
        messageId: `test_msg_${Date.now()}`,
      };
    }

    const hasMelipayamak =
      this.consoleOtpProvider.isConfigured() || this.baseServiceProvider.isConfigured();
    const isProduction =
      process.env.NODE_ENV === 'production' || process.env.FORCE_REAL_SMS === 'true';

    // 2. Production Environment: Real SMS is mandatory. NEVER dispatch OTPs to Telegram.
    if (isProduction) {
      if (!hasMelipayamak) {
        this.logger.error(
          `[CRITICAL PRODUCTION SMS ERROR] Real SMS requested (NODE_ENV=${process.env.NODE_ENV}, FORCE_REAL_SMS=${process.env.FORCE_REAL_SMS}), but Melipayamak credentials are not configured! Check MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD, and MELIPAYAMAK_OTP_BODY_ID (or MELIPAYAMAK_OTP_API_KEY) in /opt/velox/.env. In production, OTPs are NEVER forwarded to Telegram.`,
        );
        return {
          success: false,
          errorMessage:
            'سامانه پیامک در سرور پیکربندی نشده است. لطفاً متغیرهای ملی‌پیامک را در سرور بررسی نمایید.',
        };
      }

      return this.dispatchMelipayamak(to, code);
    }

    // 3. Development Mode:
    // If real SMS credentials are provided and user explicitly forced real SMS
    if (hasMelipayamak && process.env.FORCE_REAL_SMS === 'true') {
      return this.dispatchMelipayamak(to, code);
    }

    // Otherwise in local dev: Real SMS is suppressed, code is forwarded to Telegram Bot
    this.logger.log(
      `[DEV MODE] Real SMS dispatch suppressed for ${to}. Dispatching OTP to Telegram bot...`,
    );
    const tgResult = await this.telegramOtpService.sendOtpMessage(to, code);
    return {
      success: true,
      messageId: tgResult.messageId ?? `tg_dev_${Date.now()}`,
    };
  }

  private async dispatchMelipayamak(to: string, code: string): Promise<SmsSendResult> {
    const providerType = (process.env.MELIPAYAMAK_PROVIDER_TYPE ?? 'auto').toLowerCase();

    // 1. Prioritize Console Provider (console.melipayamak.com) when API Key is configured
    if (
      (providerType === 'console' || providerType === 'console_otp' || providerType === 'auto') &&
      this.consoleOtpProvider.isConfigured()
    ) {
      const consoleResult = await this.consoleOtpProvider.sendOtp(to, code);
      if (
        consoleResult.success ||
        providerType === 'console' ||
        !this.baseServiceProvider.isConfigured()
      ) {
        return consoleResult;
      }
      this.logger.warn(
        `Console provider failed: ${consoleResult.errorMessage}. Falling back to BaseService.`,
      );
    }

    // 2. Fallback to classic BaseService (payamak-panel.com)
    if (
      (providerType === 'baseservice' || providerType === 'base_service' || providerType === 'auto') &&
      this.baseServiceProvider.isConfigured()
    ) {
      return this.baseServiceProvider.sendOtp(to, code);
    }

    return {
      success: false,
      errorMessage: 'هیچ درگاه پیامکی فعالی یافت نشد.',
    };
  }
}
