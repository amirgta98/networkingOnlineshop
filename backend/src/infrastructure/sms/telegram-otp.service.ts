import { Injectable, Logger } from '@nestjs/common';
import type { SmsPatternMetadata } from './sms-provider.interface.js';

export interface TelegramSendResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
  chatIds?: (string | number)[];
}

@Injectable()
export class TelegramOtpService {
  private readonly logger = new Logger(TelegramOtpService.name);
  private readonly botToken: string;
  private readonly configuredChatId: string;
  private readonly discoveredChatIds = new Set<string | number>();

  constructor() {
    this.botToken =
      process.env.TELEGRAM_BOT_TOKEN ?? '8649024200:AAEiDwn_97UgvfLR7AayjxZgd51uhoop9y8';
    this.configuredChatId = (process.env.TELEGRAM_CHAT_ID ?? '').trim();
    if (this.configuredChatId) {
      this.discoveredChatIds.add(this.configuredChatId);
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.botToken);
  }

  /**
   * Fetches recent updates from Telegram to discover any chat IDs of users who interacted with the bot.
   */
  public async discoverChatIds(): Promise<(string | number)[]> {
    if (!this.botToken) return [];
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        this.logger.warn(`Telegram getUpdates failed with status ${res.status}`);
        return Array.from(this.discoveredChatIds);
      }
      const data = (await res.json()) as {
        ok: boolean;
        result?: Array<{
          message?: { chat?: { id?: number | string } };
          channel_post?: { chat?: { id?: number | string } };
          my_chat_member?: { chat?: { id?: number | string } };
        }>;
      };

      if (data.ok && Array.isArray(data.result)) {
        for (const item of data.result) {
          const chatId =
            item.message?.chat?.id ??
            item.channel_post?.chat?.id ??
            item.my_chat_member?.chat?.id;
          if (chatId) {
            this.discoveredChatIds.add(chatId);
          }
        }
      }
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to query Telegram getUpdates: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return Array.from(this.discoveredChatIds);
  }

  /**
   * Sends the OTP notification to Telegram.
   */
  public async sendOtpMessage(phone: string, otpCode: string): Promise<TelegramSendResult> {
    if (!this.botToken) {
      return {
        success: false,
        errorMessage: 'توکن ربات تلگرام تنظیم نشده است.',
      };
    }

    // Refresh chat IDs if we don't have any yet
    let targets = Array.from(this.discoveredChatIds);
    if (targets.length === 0) {
      targets = await this.discoverChatIds();
    }

    const persianTime = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const messageText = [
      '🔐 *کد ورود و احراز هویت (حالت توسعه / Dev)*',
      '',
      `📱 *شماره موبایل:* \`${phone}\``,
      `🔑 *کد یک‌بار مصرف (OTP):*`,
      `👉 \`${otpCode}\` 👈 _(برای کپی لمس کنید)_`,
      '',
      `⏳ *اعتبار:* ۲ دقیقه`,
      `⏰ *زمان ارسال:* ${persianTime}`,
      '',
      '⚡️ _ارسال پیامک واقعی در حالت دولوپمنت غیرفعال است و کدها به این ربات فرستاده می‌شوند._',
    ].join('\n');

    if (targets.length === 0) {
      this.logger.warn(
        `[Telegram OTP] کد تایید برای شماره ${phone} معادل: [${otpCode}] است.\nهنوز هیچ کاربر یا چتی در ربات تلگرام فعال نشده است!\nجهت دریافت لحظه‌ای کدها در تلگرام، لطفاً وارد لینک زیر شده و دکمه Start را بزنید:\n👉 https://t.me/FonixAccademicBot\n(یا TELEGRAM_CHAT_ID را در فایل .env قرار دهید)`,
      );
      return {
        success: true,
        messageId: `dev_log_only_${Date.now()}`,
      };
    }

    let sentAny = false;
    for (const chatId of targets) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });
        const resJson = (await response.json()) as { ok: boolean; description?: string };
        if (resJson.ok) {
          sentAny = true;
          this.logger.log(`[Telegram OTP] Dispatched OTP [${otpCode}] for ${phone} to Telegram chat ${chatId}`);
        } else {
          this.logger.warn(`[Telegram OTP] Telegram rejected dispatch to chat ${chatId}: ${resJson.description}`);
        }
      } catch (err: unknown) {
        this.logger.error(
          `[Telegram OTP] Network error sending to Telegram chat ${chatId}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    return {
      success: sentAny || targets.length === 0,
      chatIds: targets,
      messageId: `tg_${Date.now()}`,
    };
  }

  /**
   * Sends a pre-approved pattern/template notification to Telegram (local/dev simulation).
   */
  public async sendPatternMessage(
    to: string,
    bodyId: number,
    args: string[],
    metadata?: SmsPatternMetadata,
  ): Promise<TelegramSendResult> {
    if (!this.botToken) {
      return {
        success: false,
        errorMessage: 'توکن ربات تلگرام تنظیم نشده است.',
      };
    }

    let targets = Array.from(this.discoveredChatIds);
    if (targets.length === 0) {
      targets = await this.discoverChatIds();
    }

    const persianTime = new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const renderedBody =
      metadata?.renderedText ||
      `الگو: ${bodyId}\nمتغیرها: ${args.join(', ')}`;

    const title = metadata?.title || 'اطلاع‌رسانی سیستم (حالت توسعه / Dev)';
    const recipientTitle =
      (metadata?.recipientLabel as string) ||
      (metadata?.adminName ? 'گیرنده پیامک (ادمین)' : 'گیرنده پیامک');

    const messageText = [
      `🛒 *${title}*`,
      '',
      renderedBody,
      '',
      '──────────────────',
      `📱 *${recipientTitle}:* \`${to}\``,
      `⏰ *زمان ثبت:* ${persianTime}`,
      `📋 *کد پترن:* \`${bodyId}\``,
      '',
      '⚡️ _ارسال پیامک واقعی در حالت دولوپمنت غیرفعال است و پیام به این ربات فرستاده شده است._',
    ].join('\n');

    if (targets.length === 0) {
      this.logger.warn(
        `[Telegram Dev SMS] پیام اطلاع‌رسانی برای شماره ${to} (پترن ${bodyId}):\n${renderedBody}\nهنوز هیچ کاربر یا چتی در ربات تلگرام فعال نشده است!\nجهت دریافت لحظه‌ای پیام‌ها در تلگرام، لطفاً وارد ربات شوید:\n👉 https://t.me/FonixAccademicBot\n(یا TELEGRAM_CHAT_ID را در فایل .env قرار دهید)`,
      );
      return {
        success: true,
        messageId: `dev_log_only_${Date.now()}`,
      };
    }

    let sentAny = false;
    for (const chatId of targets) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });
        const resJson = (await response.json()) as { ok: boolean; description?: string };
        if (resJson.ok) {
          sentAny = true;
          this.logger.log(`[Telegram Dev SMS] Dispatched pattern ${bodyId} for ${to} to Telegram chat ${chatId}`);
        } else {
          this.logger.warn(`[Telegram Dev SMS] Telegram rejected dispatch to chat ${chatId}: ${resJson.description}`);
        }
      } catch (err: unknown) {
        this.logger.error(
          `[Telegram Dev SMS] Network error sending to Telegram chat ${chatId}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    return {
      success: sentAny || targets.length === 0,
      chatIds: targets,
      messageId: `tg_${Date.now()}`,
    };
  }
}
