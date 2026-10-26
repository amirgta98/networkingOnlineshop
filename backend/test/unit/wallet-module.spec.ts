import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { RequestWalletWithdrawalUseCase } from '../../src/application/use-cases/wallet/request-wallet-withdrawal.use-case.js';
import { GetAdminWithdrawalsUseCase } from '../../src/application/use-cases/wallet/get-admin-withdrawals.use-case.js';
import { GetAdminDepositsUseCase } from '../../src/application/use-cases/wallet/get-admin-deposits.use-case.js';
import { UpdateWithdrawalStatusUseCase } from '../../src/application/use-cases/wallet/update-withdrawal-status.use-case.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';

describe('Wallet Withdrawal & Admin Financial Management Module', () => {
  let userRepo: InMemoryUserRepository;
  let requestWithdrawalUseCase: RequestWalletWithdrawalUseCase;
  let getAdminWithdrawalsUseCase: GetAdminWithdrawalsUseCase;
  let getAdminDepositsUseCase: GetAdminDepositsUseCase;
  let updateWithdrawalStatusUseCase: UpdateWithdrawalStatusUseCase;

  const testUserId = 'test-user-123';

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    requestWithdrawalUseCase = new RequestWalletWithdrawalUseCase(userRepo);
    getAdminWithdrawalsUseCase = new GetAdminWithdrawalsUseCase(userRepo);
    getAdminDepositsUseCase = new GetAdminDepositsUseCase(userRepo);
    updateWithdrawalStatusUseCase = new UpdateWithdrawalStatusUseCase(userRepo);

    // Seed test user
    const user = User.create({
      id: testUserId,
      name: 'کاربر همکار تستی',
      email: 'test@velox.ir',
      phone: '09162947221',
    });
    await userRepo.save(user);

    // Initial deposit of 10,000,000 Tomans
    await userRepo.creditUserWallet(testUserId, 10000000, 'SHP-INIT-001', 'REF-INIT-001');
  });

  describe('RequestWalletWithdrawalUseCase', () => {
    it('rejects withdrawal if amount is zero or negative', async () => {
      await expect(
        requestWithdrawalUseCase.execute({
          userId: testUserId,
          amount: 0,
          cardNumber: '6037991122334455',
          shabaNumber: 'IR120170000000123456789012',
        }),
      ).rejects.toThrow('باید بزرگتر از صفر باشد');
    });

    it('rejects withdrawal if card number is not 16 digits', async () => {
      await expect(
        requestWithdrawalUseCase.execute({
          userId: testUserId,
          amount: 1000000,
          cardNumber: '6037991122', // 10 digits
          shabaNumber: 'IR120170000000123456789012',
        }),
      ).rejects.toThrow('شماره کارت بانکی باید دقیقاً ۱۶ رقم باشد');
    });

    it('rejects withdrawal if sheba is not 26 chars', async () => {
      await expect(
        requestWithdrawalUseCase.execute({
          userId: testUserId,
          amount: 1000000,
          cardNumber: '6037991122334455',
          shabaNumber: 'IR1234', // short
        }),
      ).rejects.toThrow('شماره شبا باید با IR آغاز شده و مجموعاً ۲۶ کاراکتر باشد');
    });

    it('rejects withdrawal if requested amount exceeds wallet cash balance', async () => {
      await expect(
        requestWithdrawalUseCase.execute({
          userId: testUserId,
          amount: 25000000, // exceeds 10M
          cardNumber: '6037991122334455',
          shabaNumber: 'IR120170000000123456789012',
        }),
      ).rejects.toThrow('کافی نیست');
    });

    it('successfully creates withdrawal request, updates balance, and logs WITHDRAWAL transaction', async () => {
      const withdrawal = await requestWithdrawalUseCase.execute({
        userId: testUserId,
        amount: 3000000,
        cardNumber: '6037-9911-2233-4455',
        shabaNumber: 'IR120170000000123456789012',
        accountHolder: 'کاربر همکار تستی',
        bankName: 'بانک ملی ایران',
      });

      expect(withdrawal.id).toBeDefined();
      expect(withdrawal.amount).toBe(3000000);
      expect(withdrawal.status).toBe('PENDING');
      expect(withdrawal.cardNumber).toBe('6037991122334455');
      expect(withdrawal.shabaNumber).toBe('IR120170000000123456789012');

      const wallet = await userRepo.getUserWallet(testUserId);
      expect(wallet).not.toBeNull();
      expect(wallet!.balance).toBe(7000000); // 10M - 3M = 7M
      expect(wallet!.withdrawals).toHaveLength(1);
      expect(wallet!.transactions[0].type).toBe('WITHDRAWAL');
      expect(wallet!.transactions[0].amount).toBe(-3000000);
    });

    it('accepts card and Sheba with Persian numerals and spaces, normalizing them properly', async () => {
      // 16 Persian digits for card, spaced Sheba with Persian digits
      const withdrawal = await requestWithdrawalUseCase.execute({
        userId: testUserId,
        amount: 1500000,
        cardNumber: '۶۰۳۷-۹۹۱۱-۲۲۳۳-۴۴۵۵',
        shabaNumber: 'ir ۱۲ ۰۱۷۰ ۰۰۰۰ ۰۰۱۲ ۳۴۵۶ ۷۸۹۰ ۱۲',
        accountHolder: 'کاربر همکار با صفحه کلید فارسی',
      });

      expect(withdrawal.cardNumber).toBe('6037991122334455');
      expect(withdrawal.shabaNumber).toBe('IR120170000000123456789012');
      expect(withdrawal.amount).toBe(1500000);
    });

    it('rejects Sheba containing non-numeric characters after IR', async () => {
      await expect(
        requestWithdrawalUseCase.execute({
          userId: testUserId,
          amount: 1000000,
          cardNumber: '6037991122334455',
          shabaNumber: 'IR120170000000ABC456789012',
        }),
      ).rejects.toThrow('شماره شبا باید با IR آغاز شده و مجموعاً ۲۶ کاراکتر باشد');
    });

    it('enforces minimum 10,000,000 Tomans withdrawal limit for partner role', async () => {
      const partnerUser = User.create({
        id: 'partner-user-99',
        name: 'همکار رسمی شبکه',
        email: 'partner@velox.ir',
        role: 'partner',
        phone: '09123333333',
      });
      await userRepo.save(partnerUser);
      await userRepo.creditUserWallet('partner-user-99', 25000000, 'SHP-PARTNER-01', 'REF-P1');

      // Reject if less than 10M Tomans
      await expect(
        requestWithdrawalUseCase.execute({
          userId: 'partner-user-99',
          amount: 5000000, // 5M Tomans
          cardNumber: '6037991122334455',
          shabaNumber: 'IR120170000000123456789012',
        }),
      ).rejects.toThrow('حداقل مبلغ قابل برداشت برای همکاران ۱۰,۰۰۰,۰۰۰ تومان (۱۰ میلیون تومان) است.');

      // Accept if 10M Tomans or more
      const successWdr = await requestWithdrawalUseCase.execute({
        userId: 'partner-user-99',
        amount: 10000000,
        cardNumber: '6037991122334455',
        shabaNumber: 'IR120170000000123456789012',
      });
      expect(successWdr.amount).toBe(10000000);
      expect(successWdr.status).toBe('PENDING');
    });

    it('uses pre-registered card and Sheba from profile when omitted in request', async () => {
      const userWithBank = new User({
        id: 'user-with-bank-profile',
        name: 'کاربر با مشخصات بانکی در پروفایل',
        email: { value: 'profile_bank@velox.ir' } as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'customer',
        cardNumber: '6037997788990011',
        shebaNumber: 'IR980170000000998877665544',
        bankName: 'بانک پاسارگاد',
        accountHolderName: 'کاربر با مشخصات بانکی',
      });
      await userRepo.save(userWithBank);
      await userRepo.creditUserWallet('user-with-bank-profile', 5000000, 'CR-001', 'REF-001');

      // Request withdrawal sending ONLY amount, card and sheba are resolved automatically from profile
      const wdr = await requestWithdrawalUseCase.execute({
        userId: 'user-with-bank-profile',
        amount: 1200000,
      });

      expect(wdr.amount).toBe(1200000);
      expect(wdr.cardNumber).toBe('6037997788990011');
      expect(wdr.shabaNumber).toBe('IR980170000000998877665544');
      expect(wdr.bankAccountTitle).toBe('بانک پاسارگاد');
    });

    it('rejects withdrawal if neither request nor user profile has registered Sheba', async () => {
      const userWithoutBank = User.create({
        id: 'user-no-bank-profile',
        name: 'کاربر بدون بانک',
        email: 'nobank@velox.ir',
        role: 'customer',
      });
      await userRepo.save(userWithoutBank);
      await userRepo.creditUserWallet('user-no-bank-profile', 5000000, 'CR-002', 'REF-002');

      await expect(
        requestWithdrawalUseCase.execute({
          userId: 'user-no-bank-profile',
          amount: 500000,
        }),
      ).rejects.toThrow('شماره شبای بانکی در پروفایل شما ثبت نشده');
    });
  });

  describe('Admin Operations: Withdrawals, Deposits, and Status Update', () => {
    it('retrieves withdrawal requests with metrics for admin dashboard', async () => {
      await requestWithdrawalUseCase.execute({
        userId: testUserId,
        amount: 2000000,
        cardNumber: '6037991122334455',
        shabaNumber: 'IR120170000000123456789012',
      });

      const res = await getAdminWithdrawalsUseCase.execute({});
      expect(res.total).toBe(1);
      expect(res.metrics.pendingCount).toBe(1);
      expect(res.metrics.pendingAmount).toBe(2000000);
      expect(res.items[0].cardNumber).toBe('6037991122334455');
    });

    it('retrieves deposits list with total deposit amount for admin dashboard', async () => {
      const res = await getAdminDepositsUseCase.execute({});
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.totalAmount).toBe(10000000);
      expect(res.items[0].type).toBe('DEPOSIT');
    });

    it('approves withdrawal with payout reference (COMPLETED status)', async () => {
      const w = await requestWithdrawalUseCase.execute({
        userId: testUserId,
        amount: 4000000,
        cardNumber: '6037991122334455',
        shabaNumber: 'IR120170000000123456789012',
      });

      const updated = await updateWithdrawalStatusUseCase.execute({
        withdrawalId: w.id,
        status: 'COMPLETED',
        payoutReference: 'PAYA-14030801-998877',
      });

      expect(updated.status).toBe('COMPLETED');
      expect(updated.payoutReference).toBe('PAYA-14030801-998877');
      expect(updated.processedAt).toBeDefined();

      const wallet = await userRepo.getUserWallet(testUserId);
      expect(wallet!.balance).toBe(6000000); // 10M - 4M = 6M
    });

    it('rejects withdrawal and automatically refunds the amount back to user wallet with REFUND transaction', async () => {
      const w = await requestWithdrawalUseCase.execute({
        userId: testUserId,
        amount: 5000000,
        cardNumber: '6037991122334455',
        shabaNumber: 'IR120170000000123456789012',
      });

      // Wallet balance right after request is 5,000,000
      let wallet = await userRepo.getUserWallet(testUserId);
      expect(wallet!.balance).toBe(5000000);

      // Admin rejects withdrawal
      const updated = await updateWithdrawalStatusUseCase.execute({
        withdrawalId: w.id,
        status: 'REJECTED',
        rejectionReason: 'عدم تطابق شماره شبا با کارت: شماره شبا متعلق به بانک سامان است اما شماره کارت بانک ملی درج شده است.',
      });

      expect(updated.status).toBe('REJECTED');
      expect(updated.rejectionReason).toContain('عدم تطابق');

      // Check refunded balance: 5M + 5M = 10M
      wallet = await userRepo.getUserWallet(testUserId);
      expect(wallet!.balance).toBe(10000000);

      // Verify refund transaction was logged
      const latestTx = wallet!.transactions[0];
      expect(latestTx.type).toBe('REFUND');
      expect(latestTx.amount).toBe(5000000);
      expect(latestTx.description).toContain('استرداد وجه');
    });
  });
});
