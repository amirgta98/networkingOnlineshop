import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MelipayamakBaseServiceProvider } from '../../src/infrastructure/sms/melipayamak-base-service.provider.js';
import { MelipayamakConsoleOtpProvider } from '../../src/infrastructure/sms/melipayamak-console-otp.provider.js';

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
});

