import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MelipayamakBaseServiceProvider } from '../../src/infrastructure/sms/melipayamak-base-service.provider.js';
import { MelipayamakConsoleOtpProvider } from '../../src/infrastructure/sms/melipayamak-console-otp.provider.js';
import { CompositeSmsProvider } from '../../src/infrastructure/sms/composite-sms.provider.js';
import { TelegramOtpService } from '../../src/infrastructure/sms/telegram-otp.service.js';

describe('Melipayamak SMS Providers (Unit)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
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
      delete process.env.NODE_ENV;
      delete process.env.FORCE_REAL_SMS;
      delete process.env.MOCK_SMS;
      delete process.env.MELIPAYAMAK_USERNAME;
      delete process.env.MELIPAYAMAK_PASSWORD;
      delete process.env.MELIPAYAMAK_OTP_BODY_ID;
      delete process.env.MELIPAYAMAK_OTP_API_KEY;
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
  });
});

