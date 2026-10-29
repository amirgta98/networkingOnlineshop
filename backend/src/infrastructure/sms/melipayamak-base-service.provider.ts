import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider, SmsSendResult } from './sms-provider.interface.js';
import { firstNonEmpty, firstNonEmptyNumber } from './sms-env.util.js';

export interface MelipayamakBaseServiceConfig {
  username?: string;
  password?: string;
  bodyId?: number;
  apiUrl?: string;
  timeoutMs?: number;
}

@Injectable()
export class MelipayamakBaseServiceProvider implements ISmsProvider {
  private readonly logger = new Logger(MelipayamakBaseServiceProvider.name);
  private readonly username: string;
  private readonly password: string;
  private readonly bodyId: number;
  private readonly apiUrl: string;
  private readonly timeoutMs: number;

  constructor(config?: MelipayamakBaseServiceConfig) {
    // Empty strings (docker compose injects them for missing variables) are
    // treated as "unset" so the provider is not silently half-configured.
    this.username = firstNonEmpty(config?.username) ?? firstNonEmpty(process.env.MELIPAYAMAK_USERNAME) ?? '';
    this.password = firstNonEmpty(config?.password) ?? firstNonEmpty(process.env.MELIPAYAMAK_PASSWORD) ?? '';

    // Explicit configuration (DI/tests) wins; environment is only consulted when
    // the caller did not pass a value at all.
    const rawBodyId =
      config?.bodyId !== undefined ? config.bodyId : process.env.MELIPAYAMAK_OTP_BODY_ID;
    this.bodyId = firstNonEmptyNumber(rawBodyId) ?? 0;

    this.apiUrl =
      firstNonEmpty(config?.apiUrl) ??
      firstNonEmpty(process.env.MELIPAYAMAK_BASE_SERVICE_URL) ??
      'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber';
    this.timeoutMs =
      config?.timeoutMs ??
      firstNonEmptyNumber(process.env.MELIPAYAMAK_TIMEOUT_MS) ??
      12000;
  }

  public isConfigured(): boolean {
    return Boolean(
      this.username &&
      this.password &&
      Number.isFinite(this.bodyId) &&
      this.bodyId > 0,
    );
  }

  async sendOtp(to: string, code: string): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      this.logger.warn('Melipayamak BaseService credentials are not fully configured.');
      return {
        success: false,
        errorMessage: 'سرویس ارسال پیامک در حال حاضر پیکربندی نشده است.',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      this.logger.log(`Initiating BaseService SMS request to ${to.substring(0, 4)}***${to.substring(7)}`);

      const payload = {
        username: this.username,
        password: this.password,
        text: code,
        to,
        bodyId: this.bodyId,
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`Melipayamak HTTP error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          providerStatus: response.status,
          errorMessage: 'پاسخ نامعتبر از ارائه‌دهنده پیامک دریافت شد.',
        };
      }

      const data = (await response.json()) as {
        Value?: string;
        RetStatus?: number;
        StrRetStatus?: string;
      };

      // As documented in webservice-SharedNumber.pdf:
      // RetStatus === 1 and Value is a receipt ID (typically > 15 digits) means success
      if (data.RetStatus === 1) {
        this.logger.log(`Melipayamak accepted SMS dispatch. Tracking: ${data.Value}`);
        return {
          success: true,
          messageId: data.Value,
          providerStatus: data.RetStatus,
        };
      }

      const errorDescription = this.translateErrorCode(data.Value ?? String(data.RetStatus));
      this.logger.warn(`Melipayamak rejected dispatch with code: ${data.Value} (${errorDescription})`);

      return {
        success: false,
        providerStatus: data.RetStatus,
        errorMessage: 'ارسال پیامک با خطا مواجه شد. لطفاً بعداً تلاش فرمایید.',
      };
    } catch (err: unknown) {
      const isTimeout =
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'));
      if (isTimeout) {
        this.logger.error(`Melipayamak request timed out after ${this.timeoutMs}ms`);
        return {
          success: false,
          errorMessage: 'زمان پاسخ‌دهی درگاه پیامک به پایان رسید.',
        };
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      const cause = err && typeof err === 'object' && 'cause' in err ? String((err as any).cause) : '';
      const fullError = cause ? `${errorMsg} (علت: ${cause})` : errorMsg;
      this.logger.error(`Network error while calling Melipayamak: ${fullError}`);
      return {
        success: false,
        errorMessage: `خطای شبکه در ارتباط با سامانه پیامکی رخ داد (${fullError}).`,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async sendPattern(to: string, bodyId: number, args: string[]): Promise<SmsSendResult> {
    if (!this.username || !this.password) {
      this.logger.warn('Melipayamak BaseService credentials are not fully configured.');
      return {
        success: false,
        errorMessage: 'سرویس ارسال پیامک در حال حاضر پیکربندی نشده است.',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      this.logger.log(
        `Initiating BaseService SMS pattern request (${bodyId}) to ${to.substring(0, 4)}***${to.substring(7)}`,
      );

      const payload = {
        username: this.username,
        password: this.password,
        text: args.join(';'),
        to,
        bodyId,
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`Melipayamak HTTP error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          providerStatus: response.status,
          errorMessage: 'پاسخ نامعتبر از ارائه‌دهنده پیامک دریافت شد.',
        };
      }

      const data = (await response.json()) as {
        Value?: string;
        RetStatus?: number;
        StrRetStatus?: string;
      };

      if (data.RetStatus === 1) {
        this.logger.log(`Melipayamak accepted SMS dispatch. Tracking: ${data.Value}`);
        return {
          success: true,
          messageId: data.Value,
          providerStatus: data.RetStatus,
        };
      }

      const errorDescription = this.translateErrorCode(data.Value ?? String(data.RetStatus));
      this.logger.warn(`Melipayamak rejected dispatch with code: ${data.Value} (${errorDescription})`);

      return {
        success: false,
        providerStatus: data.RetStatus,
        errorMessage: 'ارسال پیامک با خطا مواجه شد. لطفاً بعداً تلاش فرمایید.',
      };
    } catch (err: unknown) {
      const isTimeout =
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError'));
      if (isTimeout) {
        this.logger.error(`Melipayamak request timed out after ${this.timeoutMs}ms`);
        return {
          success: false,
          errorMessage: 'زمان پاسخ‌دهی درگاه پیامک به پایان رسید.',
        };
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      const cause = err && typeof err === 'object' && 'cause' in err ? String((err as any).cause) : '';
      const fullError = cause ? `${errorMsg} (علت: ${cause})` : errorMsg;
      this.logger.error(`Network error while calling Melipayamak: ${fullError}`);
      return {
        success: false,
        errorMessage: `خطای شبکه در ارتباط با سامانه پیامکی رخ داد (${fullError}).`,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private translateErrorCode(code: string): string {
    const errorMap: Record<string, string> = {
      '0': 'نام کاربری یا کلمه عبور نادرست است',
      '2': 'اعتبار ناکافی',
      '4': 'کد متن پیش‌فرض (bodyId) صحیح نمی‌باشد یا تایید نشده است',
      '5': 'متن ارسالی با قالب مشخص همخوانی ندارد',
      '6': 'خطای داخلی سامانه پیامک',
      '18': 'شماره موبایل گیرنده معتبر نیست',
      '19': 'سقف محدودیت روزانه وب‌سرویس',
      '110': 'الزام استفاده از ApiKey',
    };
    return errorMap[code] ?? `کد خطای ${code}`;
  }
}
