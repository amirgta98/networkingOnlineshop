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

  constructor(@Optional() telegramOtpService?: TelegramOtpService) {
    this.baseServiceProvider = new MelipayamakBaseServiceProvider();
    this.consoleOtpProvider = new MelipayamakConsoleOtpProvider();
    this.telegramOtpService = telegramOtpService ?? new TelegramOtpService();
  }

  async sendOtp(to: string, code: string): Promise<SmsSendResult> {
    const isDev =
      process.env.NODE_ENV !== 'production' && process.env.FORCE_REAL_SMS !== 'true';

    // In automated testing environments, avoid outbound network requests
    if (process.env.NODE_ENV === 'test' || process.env.MOCK_SMS === 'true') {
      const masked = `${to.substring(0, 4)}***${to.substring(7)}`;
      this.logger.log(`[TEST MOCK SMS] Simulated SMS dispatch to ${masked} (automated test).`);
      return {
        success: true,
        messageId: `test_msg_${Date.now()}`,
      };
    }

    // In development mode: Real SMS is suppressed, code is forwarded to Telegram Bot
    if (isDev) {
      this.logger.log(
        `[DEV MODE] Real SMS dispatch suppressed for ${to}. Dispatching OTP to Telegram bot...`,
      );
      const tgResult = await this.telegramOtpService.sendOtpMessage(to, code);
      return {
        success: true,
        messageId: tgResult.messageId ?? `tg_dev_${Date.now()}`,
      };
    }

    // Production mode: Use configured SMS gateway (Melipayamak)
    const providerType = (process.env.MELIPAYAMAK_PROVIDER_TYPE ?? 'auto').toLowerCase();

    // 1. Prioritize Console Provider (console.melipayamak.com) when API Key is configured
    if (
      (providerType === 'console' || providerType === 'console_otp' || providerType === 'auto') &&
      this.consoleOtpProvider.isConfigured()
    ) {
      const consoleResult = await this.consoleOtpProvider.sendOtp(to, code);
      if (consoleResult.success || providerType === 'console' || !this.baseServiceProvider.isConfigured()) {
        return consoleResult;
      }
      this.logger.warn(`Console provider failed: ${consoleResult.errorMessage}. Falling back to BaseService.`);
    }

    // 2. Fallback to classic BaseService (payamak-panel.com)
    if (
      (providerType === 'baseservice' || providerType === 'base_service' || providerType === 'auto') &&
      this.baseServiceProvider.isConfigured()
    ) {
      return this.baseServiceProvider.sendOtp(to, code);
    }

    // 3. Fallback
    const masked = `${to.substring(0, 4)}***${to.substring(7)}`;
    this.logger.log(
      `[MOCK SMS ADAPTER] Simulated SMS dispatch to ${masked} (Provider credentials not configured).`,
    );

    return {
      success: true,
      messageId: `mock_msg_${Date.now()}`,
    };
  }
}
