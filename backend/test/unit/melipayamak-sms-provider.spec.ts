import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MelipayamakBaseServiceProvider } from '../../src/infrastructure/sms/melipayamak-base-service.provider.js';
import { MelipayamakConsoleOtpProvider } from '../../src/infrastructure/sms/melipayamak-console-otp.provider.js';
import { CompositeSmsProvider } from '../../src/infrastructure/sms/composite-sms.provider.js';
import { TelegramOtpService } from '../../src/infrastructure/sms/telegram-otp.service.js';
import { resolveSmsDeliveryMode } from '../../src/infrastructure/sms/sms-delivery-mode.js';

const SMS_ENV_KEYS = [
  'NODE_ENV',
  'FORCE_REAL_SMS',
  'SMS_DELIVERY_MODE',
  'MOCK_SMS',
  'MELIPAYAMAK_USERNAME',
  'MELIPAYAMAK_PASSWORD',
  'MELIPAYAMAK_OTP_BODY_ID',
  'MELIPAYAMAK_OTP_API_KEY',
  'MELIPAYAMAK_API_KEY',
  'MELIPAYAMAK_OTP_TOKEN',
  'MELIPAYAMAK_CONSOLE_BASE_URL',
  'MELIPAYAMAK_BASE_SERVICE_URL',
  'MELIPAYAMAK_PROVIDER_TYPE',
] as const;

function clearSmsEnv(): void {
  for (const key of SMS_ENV_KEYS) {
    delete process.env[key];
  }
}

describe('Melipayamak SMS Providers (Unit)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    clearSmsEnv();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('SmsDeliveryMode resolution', () => {
    it('uses the real SMS API when credentials are configured, even if NODE_ENV is not production', () => {
      const resolution = resolveSmsDeliveryMode({
        realProviderConfigured: true,
        env: { NODE_ENV: 'development' } as NodeJS.ProcessEnv,
      });

      expect(resolution.mode).toBe('real');
    });

    it('always uses the real SMS API in production, even without credentials (fails loudly instead of Telegram)', () => {
      const resolution = resolveSmsDeliveryMode({
        realProviderConfigured: false,
        env: { NODE_ENV: 'production' } as NodeJS.ProcessEnv,
      });

      expect(resolution.mode).toBe('real');
    });

    it('falls back to the Telegram simulation only when nothing is configured locally', () => {
      const resolution = resolveSmsDeliveryMode({
        realProviderConfigured: false,
        env: { NODE_ENV: 'development' } as NodeJS.ProcessEnv,
      });

      expect(resolution.mode).toBe('telegram');
    });

    it('obeys an explicit SMS_DELIVERY_MODE=telegram even when credentials are configured', () => {
      const resolution = resolveSmsDeliveryMode({
        realProviderConfigured: true,
        env: { NODE_ENV: 'development', SMS_DELIVERY_MODE: 'telegram' } as NodeJS.ProcessEnv,
      });

      expect(resolution.mode).toBe('telegram');
    });

    it('obeys an explicit SMS_DELIVERY_MODE=real over dev flags', () => {
      const resolution = resolveSmsDeliveryMode({
        realProviderConfigured: true,
        env: { NODE_ENV: 'development', FORCE_REAL_SMS: 'false', SMS_DELIVERY_MODE: 'real' } as NodeJS.ProcessEnv,
      });

      expect(resolution.mode).toBe('real');
    });

    it('treats FORCE_REAL_SMS=false as an explicit local/dev opt-in', () => {
      const resolution = resolveSmsDeliveryMode({
        realProviderConfigured: true,
        env: { NODE_ENV: 'development', FORCE_REAL_SMS: 'false' } as NodeJS.ProcessEnv,
      });

      expect(resolution.mode).toBe('telegram');
    });

    it('never performs outbound requests in automated tests', () => {
      expect(
        resolveSmsDeliveryMode({ realProviderConfigured: true, env: { NODE_ENV: 'test' } as NodeJS.ProcessEnv }).mode,
      ).toBe('test');
      expect(
        resolveSmsDeliveryMode({ realProviderConfigured: true, env: { MOCK_SMS: 'true' } as NodeJS.ProcessEnv }).mode,
      ).toBe('test');
    });
  });

  describe('MelipayamakBaseServiceProvider (Flow B)', () => {
    it('returns error when credentials are not configured', async () => {
      const provider = new MelipayamakBaseServiceProvider({
        username: '',
        password: '',
        bodyId: 0,
      });

      const res = await provider.sendOtp('09123456789', '12345');
      expect(res.success).toBe(false);
      expect(res.errorMessage).toContain('پیکربندی');
    });

    it('successfully interprets RetStatus: 1 as accepted SMS request', async () => {
      const provider = new MelipayamakBaseServiceProvider({
        username: 'test_user',
        password: 'test_password',
        bodyId: 123456,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          Value: '5501234567890123', // > 15 digits tracking recID
          RetStatus: 1,
          StrRetStatus: 'Ok',
        }),
      });

      const res = await provider.sendOtp('09123456789', '54321');
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('5501234567890123');
      expect(res.providerStatus).toBe(1);

      // Verify request payload conforms to PDF specification
      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'test_user',
            password: 'test_password',
            text: '54321',
            to: '09123456789',
            bodyId: 123456,
          }),
        }),
      );
    });

    it('handles provider error status codes gracefully without throwing', async () => {
      const provider = new MelipayamakBaseServiceProvider({
        username: 'test_user',
        password: 'test_password',
        bodyId: 123456,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          Value: '2', // low balance error
          RetStatus: 35,
          StrRetStatus: 'InvalidData',
        }),
      });

      const res = await provider.sendOtp('09123456789', '54321');
      expect(res.success).toBe(false);
      expect(res.providerStatus).toBe(35);
      expect(res.errorMessage).toBeDefined();
    });

    it('handles network timeout and abort errors', async () => {
      const provider = new MelipayamakBaseServiceProvider({
        username: 'test_user',
        password: 'test_password',
        bodyId: 123456,
        timeoutMs: 50,
      });

      global.fetch = vi.fn().mockRejectedValue(new DOMException('Timeout', 'AbortError'));

      const res = await provider.sendOtp('09123456789', '54321');
      expect(res.success).toBe(false);
      expect(res.errorMessage).toContain('پایان');
    });
  });

  describe('MelipayamakConsoleOtpProvider', () => {
    it('returns error when token is unconfigured', async () => {
      const provider = new MelipayamakConsoleOtpProvider({
        otpToken: '',
      });

      const res = await provider.sendOtp('09123456789', '12345');
      expect(res.success).toBe(false);
      expect(res.errorMessage).toContain('تنظیم نشده');
    });

    it('successfully calls account-specific console endpoint', async () => {
      const provider = new MelipayamakConsoleOtpProvider({
        otpToken: '35a1295420244314a52a34bbd2b0ed7b',
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'otp_msg_789',
        }),
      });

      const res = await provider.sendOtp('09123456789', '54321');
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('otp_msg_789');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://console.melipayamak.com/api/send/otp/35a1295420244314a52a34bbd2b0ed7b',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ to: '09123456789' }),
        }),
      );
    });

    it('successfully calls account-specific console shared pattern endpoint when bodyId is set', async () => {
      const provider = new MelipayamakConsoleOtpProvider({
        otpToken: '35a1295420244314a52a34bbd2b0ed7b',
        bodyId: 556130,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          recId: '5249004813124591851',
          status: 'عملیات موفق',
        }),
      });

      const res = await provider.sendOtp('09134761097', '54321');
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('5249004813124591851');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://console.melipayamak.com/api/send/shared/35a1295420244314a52a34bbd2b0ed7b',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            to: '09134761097',
            bodyId: 556130,
            args: ['54321'],
          }),
        }),
      );
    });
  });

  describe('CompositeSmsProvider (Routing Logic)', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      process.env = { ...originalEnv };
      clearSmsEnv();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('in production without Melipayamak credentials, it fails and NEVER dispatches to Telegram', async () => {
      process.env.NODE_ENV = 'production';

      const mockTg = new TelegramOtpService();
      const sendTgSpy = vi.spyOn(mockTg, 'sendOtpMessage').mockResolvedValue({ success: true });

      const unconfiguredBase = new MelipayamakBaseServiceProvider({ username: '', password: '', bodyId: 0 });
      const unconfiguredConsole = new MelipayamakConsoleOtpProvider({ otpToken: '' });

      const composite = new CompositeSmsProvider(mockTg, unconfiguredBase, unconfiguredConsole);
      const res = await composite.sendOtp('09121111111', '12345');

      expect(res.success).toBe(false);
      expect(res.errorMessage).toContain('پیکربندی');
      expect(sendTgSpy).not.toHaveBeenCalled();
    });

    it('in production with Melipayamak BaseService configured, it dispatches real SMS and bypasses Telegram', async () => {
      process.env.NODE_ENV = 'production';

      const mockTg = new TelegramOtpService();
      const sendTgSpy = vi.spyOn(mockTg, 'sendOtpMessage').mockResolvedValue({ success: true });

      const configuredBase = new MelipayamakBaseServiceProvider({ username: 'user', password: 'pwd', bodyId: 100 });
      vi.spyOn(configuredBase, 'sendOtp').mockResolvedValue({ success: true, messageId: 'base_999' });

      const unconfiguredConsole = new MelipayamakConsoleOtpProvider({ otpToken: '' });

      const composite = new CompositeSmsProvider(mockTg, configuredBase, unconfiguredConsole);
      const res = await composite.sendOtp('09121111111', '12345');

      expect(res.success).toBe(true);
      expect(res.messageId).toBe('base_999');
      expect(sendTgSpy).not.toHaveBeenCalled();
    });

    it('in development without real SMS forced, it forwards OTP to Telegram bot', async () => {
      process.env.NODE_ENV = 'development';

      const mockTg = new TelegramOtpService();
      const sendTgSpy = vi.spyOn(mockTg, 'sendOtpMessage').mockResolvedValue({
        success: true,
        messageId: 'tg_test_123',
      });

      const unconfiguredBase = new MelipayamakBaseServiceProvider({ username: '', password: '', bodyId: 0 });
      const unconfiguredConsole = new MelipayamakConsoleOtpProvider({ otpToken: '' });

      const composite = new CompositeSmsProvider(mockTg, unconfiguredBase, unconfiguredConsole);
      const res = await composite.sendOtp('09121111111', '12345');

      expect(res.success).toBe(true);
      expect(sendTgSpy).toHaveBeenCalledWith('09121111111', '12345');
    });

    it('in development with FORCE_REAL_SMS=true, it dispatches via Melipayamak instead of Telegram', async () => {
      process.env.NODE_ENV = 'development';
      process.env.FORCE_REAL_SMS = 'true';

      const mockTg = new TelegramOtpService();
      const sendTgSpy = vi.spyOn(mockTg, 'sendOtpMessage').mockResolvedValue({ success: true });

      const configuredBase = new MelipayamakBaseServiceProvider({ username: 'user', password: 'pwd', bodyId: 100 });
      const sendBaseSpy = vi.spyOn(configuredBase, 'sendOtp').mockResolvedValue({ success: true, messageId: 'real_sms_456' });

      const unconfiguredConsole = new MelipayamakConsoleOtpProvider({ otpToken: '' });

      const composite = new CompositeSmsProvider(mockTg, configuredBase, unconfiguredConsole);
      const res = await composite.sendOtp('09121111111', '12345');

      expect(res.success).toBe(true);
      expect(res.messageId).toBe('real_sms_456');
      expect(sendBaseSpy).toHaveBeenCalled();
      expect(sendTgSpy).not.toHaveBeenCalled();
    });

    it('REGRESSION: in a non-production server with Melipayamak configured, it dispatches real SMS and never uses Telegram', async () => {
      // This is the deployment bug: the server had working Melipayamak
      // credentials but NODE_ENV was not exactly "production", so OTPs were
      // silently routed to the Telegram/dev channel instead of the SMS API.
      process.env.NODE_ENV = 'development';

      const mockTg = new TelegramOtpService();
      const sendTgSpy = vi.spyOn(mockTg, 'sendOtpMessage').mockResolvedValue({
        success: true,
        messageId: 'tg_should_not_be_used',
      });

      const configuredConsole = new MelipayamakConsoleOtpProvider({ otpToken: 'token', bodyId: 556130 });
      const sendConsoleSpy = vi.spyOn(configuredConsole, 'sendOtp').mockResolvedValue({
        success: true,
        messageId: 'real_console_sms',
      });
      const unconfiguredBase = new MelipayamakBaseServiceProvider({ username: '', password: '', bodyId: 0 });

      const composite = new CompositeSmsProvider(mockTg, unconfiguredBase, configuredConsole);
      const res = await composite.sendOtp('09121111111', '12345');

      expect(composite.getDeliveryMode()).toBe('real');
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('real_console_sms');
      expect(sendConsoleSpy).toHaveBeenCalledWith('09121111111', '12345');
      expect(sendTgSpy).not.toHaveBeenCalled();
    });

    it('on a developer machine with SMS_DELIVERY_MODE=telegram, it still simulates locally even with credentials', async () => {
      process.env.NODE_ENV = 'development';
      process.env.SMS_DELIVERY_MODE = 'telegram';

      const mockTg = new TelegramOtpService();
      const sendTgSpy = vi.spyOn(mockTg, 'sendOtpMessage').mockResolvedValue({
        success: true,
        messageId: 'tg_dev_mode',
      });

      const configuredConsole = new MelipayamakConsoleOtpProvider({ otpToken: 'token', bodyId: 556130 });
      const sendConsoleSpy = vi.spyOn(configuredConsole, 'sendOtp').mockResolvedValue({
        success: true,
        messageId: 'real_console_sms',
      });
      const unconfiguredBase = new MelipayamakBaseServiceProvider({ username: '', password: '', bodyId: 0 });

      const composite = new CompositeSmsProvider(mockTg, unconfiguredBase, configuredConsole);
      const res = await composite.sendOtp('09121111111', '12345');

      expect(composite.getDeliveryMode()).toBe('telegram');
      expect(res.success).toBe(true);
      expect(sendTgSpy).toHaveBeenCalledWith('09121111111', '12345');
      expect(sendConsoleSpy).not.toHaveBeenCalled();
    });
  });
});

