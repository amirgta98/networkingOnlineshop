import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider, SmsSendResult } from './sms-provider.interface.js';
import { firstNonEmpty, firstNonEmptyNumber } from './sms-env.util.js';

export interface MelipayamakConsoleOtpConfig {
  otpToken?: string;
  bodyId?: number;
  endpointUrl?: string;
  timeoutMs?: number;
}

/**
 * Melipayamak console (console.melipayamak.com) token issued for this account.
 * Kept as a last-resort fallback so a production server whose `.env` lost the
 * variable still delivers real SMS instead of degrading to the dev channel.
 */
export const MELIPAYAMAK_CONSOLE_BUILT_IN_TOKEN = '35a1295420244314a52a34bbd2b0ed7b';
export const MELIPAYAMAK_CONSOLE_BUILT_IN_BODY_ID = 556130;

@Injectable()
export class MelipayamakConsoleOtpProvider implements ISmsProvider {
  private readonly logger = new Logger(MelipayamakConsoleOtpProvider.name);
  private readonly otpToken: string;
  private readonly bodyId: number;
  private readonly baseEndpoint: string;
  private readonly timeoutMs: number;
  private readonly usingBuiltInCredentials: boolean;

  constructor(config?: MelipayamakConsoleOtpConfig) {
    const envToken = firstNonEmpty(
      process.env.MELIPAYAMAK_OTP_API_KEY,
      process.env.MELIPAYAMAK_API_KEY,
      process.env.MELIPAYAMAK_OTP_TOKEN,
    );

    if (config) {
      // Explicit configuration (DI/tests) always wins and never silently
      // falls back to the built-in credentials.
      this.otpToken = firstNonEmpty(config.otpToken) ?? envToken ?? '';
      this.usingBuiltInCredentials = false;
    } else {
      this.usingBuiltInCredentials = !envToken;
      this.otpToken = envToken ?? MELIPAYAMAK_CONSOLE_BUILT_IN_TOKEN;
    }

    const rawBodyId = firstNonEmptyNumber(
      config?.bodyId,
      process.env.MELIPAYAMAK_OTP_BODY_ID,
      config ? undefined : MELIPAYAMAK_CONSOLE_BUILT_IN_BODY_ID,
    );
    // bodyId > 0 → shared pattern endpoint, otherwise the account OTP endpoint.
    this.bodyId = rawBodyId ?? 0;

    this.baseEndpoint =
      firstNonEmpty(config?.endpointUrl) ??
      firstNonEmpty(process.env.MELIPAYAMAK_CONSOLE_BASE_URL) ??
      'https://console.melipayamak.com/api/send';
    this.timeoutMs =
      config?.timeoutMs ??
      firstNonEmptyNumber(process.env.MELIPAYAMAK_TIMEOUT_MS) ??
      12000;
  }

  public get isUsingBuiltInCredentials(): boolean {
    return this.usingBuiltInCredentials;
  }

  public isConfigured(): boolean {
    return Boolean(this.otpToken);
  }

  async sendOtp(to: string, code: string): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      this.logger.warn('Melipayamak Console OTP token is not configured.');
      return {
        success: false,
        errorMessage: 'توکن سرویس پیامک کنسول ملی‌پیامک تنظیم نشده است.',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const isSharedPattern = this.bodyId > 0;
      const url = isSharedPattern
        ? `${this.baseEndpoint.replace(/\/$/, '')}/shared/${this.otpToken}`
        : `${this.baseEndpoint.replace(/\/$/, '')}/otp/${this.otpToken}`;

      const payload = isSharedPattern
        ? { to, bodyId: this.bodyId, args: [code] }
        : { to };

      this.logger.log(
        `Initiating Console ${isSharedPattern ? `Shared (Pattern ${this.bodyId})` : 'OTP'} request for ${to.substring(0, 4)}***${to.substring(7)}`,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`Melipayamak Console HTTP error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          providerStatus: response.status,
          errorMessage: 'خطا در برقراری ارتباط با وب‌سرویس پیامک کنسول.',
        };
      }

      const data = (await response.json()) as {
        recId?: number | string;
        id?: string;
        status?: string;
      };

      // Check success conditions
      const isSuccess =
        Boolean(data.recId) ||
        data.status === 'عملیات موفق' ||
        (data.id && typeof data.id === 'string');

      if (isSuccess) {
        const trackingId = String(data.recId ?? data.id ?? 'success');
        this.logger.log(`Melipayamak Console accepted SMS request. Tracking: ${trackingId}`);
        return {
          success: true,
          messageId: trackingId,
        };
      }

      const failureReason = typeof data.status === 'string' ? data.status : 'رد درخواست توسط سامانه پیامکی';
      this.logger.warn(`Melipayamak Console rejected dispatch: ${failureReason}`);

      return {
        success: false,
        errorMessage: failureReason,
      };
    } catch (err: unknown) {
      const isTimeout =
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'));
      if (isTimeout) {
        this.logger.error(`Melipayamak Console request timed out after ${this.timeoutMs}ms`);
        return {
          success: false,
          errorMessage: 'مهلت پاسخ‌دهی درگاه پیامک کنسول به پایان رسید.',
        };
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      const cause = err && typeof err === 'object' && 'cause' in err ? String((err as any).cause) : '';
      const fullError = cause ? `${errorMsg} (علت: ${cause})` : errorMsg;
      this.logger.error(`Network error calling Melipayamak Console: ${fullError}`);
      return {
        success: false,
        errorMessage: `خطای شبکه در ارتباط با سامانه پیامکی رخ داد (${fullError}).`,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async sendPattern(to: string, bodyId: number, args: string[]): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      this.logger.warn('Melipayamak Console token is not configured.');
      return {
        success: false,
        errorMessage: 'توکن سرویس پیامک کنسول ملی‌پیامک تنظیم نشده است.',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${this.baseEndpoint.replace(/\/$/, '')}/shared/${this.otpToken}`;
      const payload = {
        to,
        bodyId,
        args,
      };

      this.logger.log(
        `Initiating Console Shared (Pattern ${bodyId}) request for ${to.substring(0, 4)}***${to.substring(7)}`,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`Melipayamak Console HTTP error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          providerStatus: response.status,
          errorMessage: 'خطا در برقراری ارتباط با وب‌سرویس پیامک کنسول.',
        };
      }

      const data = (await response.json()) as {
        recId?: number | string;
        id?: string;
        status?: string;
      };

      const isSuccess =
        Boolean(data.recId) ||
        data.status === 'عملیات موفق' ||
        (data.id && typeof data.id === 'string');

      if (isSuccess) {
        const trackingId = String(data.recId ?? data.id ?? 'success');
        this.logger.log(`Melipayamak Console accepted SMS request. Tracking: ${trackingId}`);
        return {
          success: true,
          messageId: trackingId,
        };
      }

      const failureReason = typeof data.status === 'string' ? data.status : 'رد درخواست توسط سامانه پیامکی';
      this.logger.warn(`Melipayamak Console rejected dispatch: ${failureReason}`);

      return {
        success: false,
        errorMessage: failureReason,
      };
    } catch (err: unknown) {
      const isTimeout =
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'));
      if (isTimeout) {
        this.logger.error(`Melipayamak Console request timed out after ${this.timeoutMs}ms`);
        return {
          success: false,
          errorMessage: 'مهلت پاسخ‌دهی درگاه پیامک کنسول به پایان رسید.',
        };
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      const cause = err && typeof err === 'object' && 'cause' in err ? String((err as any).cause) : '';
      const fullError = cause ? `${errorMsg} (علت: ${cause})` : errorMsg;
      this.logger.error(`Network error calling Melipayamak Console: ${fullError}`);
      return {
        success: false,
        errorMessage: `خطای شبکه در ارتباط با سامانه پیامکی رخ داد (${fullError}).`,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
