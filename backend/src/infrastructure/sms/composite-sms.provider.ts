import { Injectable, Logger, Optional } from '@nestjs/common';
import { ISmsProvider, SmsSendResult, SmsPatternMetadata } from './sms-provider.interface.js';
import { MelipayamakBaseServiceProvider } from './melipayamak-base-service.provider.js';
import { MelipayamakConsoleOtpProvider } from './melipayamak-console-otp.provider.js';
import { TelegramOtpService } from './telegram-otp.service.js';
import { resolveSmsDeliveryMode, type SmsDeliveryMode } from './sms-delivery-mode.js';

@Injectable()
export class CompositeSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(CompositeSmsProvider.name);
  private readonly baseServiceProvider: MelipayamakBaseServiceProvider;
  private readonly consoleOtpProvider: MelipayamakConsoleOtpProvider;
  private readonly telegramOtpService: TelegramOtpService;
  private readonly realProviderConfigured: boolean;
  private readonly deliveryMode: SmsDeliveryMode;
  private readonly deliveryModeReason: string;

  constructor(
    @Optional() telegramOtpService?: TelegramOtpService,
    @Optional() baseServiceProvider?: MelipayamakBaseServiceProvider,
    @Optional() consoleOtpProvider?: MelipayamakConsoleOtpProvider,
  ) {
    this.baseServiceProvider = baseServiceProvider ?? new MelipayamakBaseServiceProvider();
    this.consoleOtpProvider = consoleOtpProvider ?? new MelipayamakConsoleOtpProvider();
    this.telegramOtpService = telegramOtpService ?? new TelegramOtpService();

    this.realProviderConfigured =
      this.consoleOtpProvider.isConfigured() || this.baseServiceProvider.isConfigured();

    const resolution = resolveSmsDeliveryMode({ realProviderConfigured: this.realProviderConfigured });
    this.deliveryMode = resolution.mode;
    this.deliveryModeReason = resolution.reason;

    // Startup visibility: `docker logs velox-backend-prod` immediately shows
    // whether the deployment sends real SMS or the simulated dev channel.
    this.logger.log(`[SMS Router] Delivery mode: ${this.deliveryMode.toUpperCase()} — ${resolution.reason}`);
    if (this.consoleOtpProvider.isUsingBuiltInCredentials) {
      this.logger.warn(
        'Melipayamak console credentials were not found in the environment; falling back to the built-in credentials compiled into the application. Set MELIPAYAMAK_OTP_API_KEY and MELIPAYAMAK_OTP_BODY_ID (and/or MELIPAYAMAK_USERNAME/MELIPAYAMAK_PASSWORD) in the server environment.',
      );
    }
  }

  /** Effective OTP delivery mode resolved at boot (single source of truth). */
  public getDeliveryMode(): SmsDeliveryMode {
    return this.deliveryMode;
  }

  public getDeliveryModeReason(): string {
    return this.deliveryModeReason;
  }

  public isRealSmsMode(): boolean {
    return this.deliveryMode === 'real';
  }

  async sendOtp(to: string, code: string): Promise<SmsSendResult> {
    // 1. Automated testing environments must not perform outbound requests.
    if (this.deliveryMode === 'test') {
      const masked = `${to.substring(0, 4)}***${to.substring(7)}`;
      this.logger.log(`[TEST MOCK SMS] Simulated SMS dispatch to ${masked} (automated test).`);
      return {
        success: true,
        messageId: `test_msg_${Date.now()}`,
      };
    }

    // 2. Real SMS through the configured Melipayamak API.
    if (this.deliveryMode === 'real') {
      if (!this.realProviderConfigured) {
        this.logger.error(
          `[CRITICAL SMS ERROR] Real SMS is required (${this.deliveryModeReason}), but no Melipayamak credentials are configured! Check MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD, MELIPAYAMAK_OTP_BODY_ID and MELIPAYAMAK_OTP_API_KEY in the server environment. OTPs are NEVER forwarded to Telegram in this mode.`,
        );
        return {
          success: false,
          errorMessage:
            'سامانه پیامک در سرور پیکربندی نشده است. لطفاً متغیرهای ملی‌پیامک را در سرور بررسی نمایید.',
        };
      }

      return this.dispatchMelipayamak(to, code);
    }

    // 3. Explicit local/dev simulation: forward the code to the Telegram bot.
    this.logger.log(
      `[DEV MODE] Real SMS dispatch suppressed for ${to}. Dispatching OTP to Telegram bot... (${this.deliveryModeReason})`,
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

  async sendPattern(
    to: string,
    bodyId: number,
    args: string[],
    metadata?: SmsPatternMetadata,
  ): Promise<SmsSendResult> {
    // 1. Automated testing environments must not perform outbound requests.
    if (this.deliveryMode === 'test') {
      const masked = `${to.substring(0, 4)}***${to.substring(7)}`;
      this.logger.log(`[TEST MOCK SMS] Simulated pattern ${bodyId} SMS dispatch to ${masked} (automated test).`);
      return {
        success: true,
        messageId: `test_msg_${Date.now()}`,
      };
    }

    // 2. Real SMS through the configured Melipayamak API.
    if (this.deliveryMode === 'real') {
      if (!this.realProviderConfigured) {
        this.logger.error(
          `[CRITICAL SMS ERROR] Real SMS is required (${this.deliveryModeReason}), but no Melipayamak credentials are configured! Check MELIPAYAMAK_USERNAME, MELIPAYAMAK_PASSWORD and MELIPAYAMAK_OTP_API_KEY in the server environment.`,
        );
        return {
          success: false,
          errorMessage:
            'سامانه پیامک در سرور پیکربندی نشده است. لطفاً متغیرهای ملی‌پیامک را در سرور بررسی نمایید.',
        };
      }

      return this.dispatchMelipayamakPattern(to, bodyId, args);
    }

    // 3. Explicit local/dev simulation: forward the pattern notification to Telegram bot.
    this.logger.log(
      `[DEV MODE] Real SMS dispatch suppressed for ${to}. Dispatching pattern ${bodyId} to Telegram bot... (${this.deliveryModeReason})`,
    );
    const tgResult = await this.telegramOtpService.sendPatternMessage(to, bodyId, args, metadata);
    return {
      success: true,
      messageId: tgResult.messageId ?? `tg_dev_${Date.now()}`,
    };
  }

  private async dispatchMelipayamakPattern(
    to: string,
    bodyId: number,
    args: string[],
  ): Promise<SmsSendResult> {
    const providerType = (process.env.MELIPAYAMAK_PROVIDER_TYPE ?? 'auto').toLowerCase();

    // 1. Prioritize Console Provider (console.melipayamak.com) when API Key is configured
    if (
      (providerType === 'console' || providerType === 'console_otp' || providerType === 'auto') &&
      this.consoleOtpProvider.isConfigured()
    ) {
      const consoleResult = await this.consoleOtpProvider.sendPattern(to, bodyId, args);
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
      return this.baseServiceProvider.sendPattern(to, bodyId, args);
    }

    return {
      success: false,
      errorMessage: 'هیچ درگاه پیامکی فعالی یافت نشد.',
    };
  }
}
