import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { ZarinpalPaymentService } from '../../src/infrastructure/payment/zarinpal.service.js';
import { InMemoryPaymentRepository } from '../../src/infrastructure/database/in-memory/in-memory-payment.repository.js';
import { InMemoryOrderRepository } from '../../src/infrastructure/database/in-memory/in-memory-order.repository.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { InMemoryInvoiceRepository } from '../../src/infrastructure/database/in-memory/in-memory-invoice.repository.js';
import { RequestOrderPaymentUseCase } from '../../src/application/use-cases/payment/request-order-payment.use-case.js';
import { RequestWalletChargeUseCase } from '../../src/application/use-cases/payment/request-wallet-charge.use-case.js';
import { RequestInvoicePaymentUseCase } from '../../src/application/use-cases/payment/request-invoice-payment.use-case.js';
import { VerifyPaymentUseCase } from '../../src/application/use-cases/payment/verify-payment.use-case.js';
import { PaymentsController } from '../../src/presentation/controllers/payments.controller.js';
import { Order, OrderStatus } from '../../src/domain/entities/order.entity.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { InvoiceEntity } from '../../src/domain/entities/invoice.entity.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';
import { Email } from '../../src/domain/value-objects/email.vo.js';
import { PaymentStatus, PaymentType } from '../../src/domain/entities/payment.entity.js';

describe('Zarinpal Sandbox Payment Module', () => {
  let paymentRepo: InMemoryPaymentRepository;
  let orderRepo: InMemoryOrderRepository;
  let userRepo: InMemoryUserRepository;
  let invoiceRepo: InMemoryInvoiceRepository;
  let zarinpalService: ZarinpalPaymentService;

  let requestOrderPaymentUseCase: RequestOrderPaymentUseCase;
  let requestWalletChargeUseCase: RequestWalletChargeUseCase;
  let requestInvoicePaymentUseCase: RequestInvoicePaymentUseCase;
  let verifyPaymentUseCase: VerifyPaymentUseCase;

  const mockUser = new User({
    id: 'user-test-1',
    name: 'علی تقوی',
    phone: new PhoneNumber('09121234567'),
    email: new Email('ali@example.com'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    paymentRepo = new InMemoryPaymentRepository();
    orderRepo = new InMemoryOrderRepository();
    userRepo = new InMemoryUserRepository();
    invoiceRepo = new InMemoryInvoiceRepository();
    zarinpalService = new ZarinpalPaymentService();

    await userRepo.save(mockUser);

    requestOrderPaymentUseCase = new RequestOrderPaymentUseCase(
      orderRepo,
      paymentRepo,
      zarinpalService,
    );
    requestWalletChargeUseCase = new RequestWalletChargeUseCase(
      userRepo,
      paymentRepo,
      zarinpalService,
    );
    requestInvoicePaymentUseCase = new RequestInvoicePaymentUseCase(
      invoiceRepo,
      paymentRepo,
      zarinpalService,
    );
    verifyPaymentUseCase = new VerifyPaymentUseCase(
      paymentRepo,
      orderRepo,
      userRepo,
      invoiceRepo,
      zarinpalService,
    );
  });

  describe('ZarinpalPaymentService', () => {
    it('requests sandbox payment successfully with fallback resilience', async () => {
      const result = await zarinpalService.requestPayment({
        amount: 2500000,
        description: 'تست درگاه پرداخت زرین‌پال',
        callbackUrl: 'http://localhost:3001/api/v1/payments/verify',
      });

      expect(result).toBeDefined();
      expect(result.authority).toBeDefined();
      expect(result.paymentUrl).toBeDefined();
      expect(result.paymentUrl.length).toBeGreaterThan(10);
    });

    it('verifies sandbox payment with valid authority or mock authority', async () => {
      const verifyRes = await zarinpalService.verifyPayment({
        amount: 2500000,
        authority: 'MOCK_S000000000000000000000000000123456',
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.refId).toBeDefined();
      expect(verifyRes.cardPan).toBeDefined();
    });

    it('does not allow short fake authority to bypass verification', async () => {
      // Short fake authority (e.g. "test" which previously passed via authority.length < 30)
      const res = await zarinpalService.verifyPayment({
        amount: 10000,
        authority: 'test',
      });
      // Should not be marked as mock success
      expect(res.success).toBe(false);
    });

    it('strictly forbids mock simulation when NODE_ENV is production', async () => {
      const prodConfigService = {
        get: (key: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'ZARINPAL_SANDBOX') return 'true';
          return undefined;
        },
      } as unknown as ConfigService;

      const prodZarinpal = new ZarinpalPaymentService(prodConfigService);

      // Even with MOCK_ authority, in production it must attempt real gateway verification
      const res = await prodZarinpal.verifyPayment({
        amount: 2500000,
        authority: 'MOCK_S000000000000000000000000000123456',
      });

      // Real gateway rejects mock authority
      expect(res.success).toBe(false);
    });
  });

  describe('Order Payment Flow', () => {
    it('initiates payment for a pending order and saves transaction', async () => {
      const order = new Order({
        id: 'ord-101',
        orderNumber: 'VX-9090',
        trackingCode: 'NET-12345678',
        userId: mockUser.id,
        status: OrderStatus.PENDING_FINANCIAL,
        customerType: 'retail',
        customerName: mockUser.name,
        phoneNumber: '09121234567',
        totalAmount: 15000000,
        discountAmount: 0,
        vatTaxAmount: 0,
        payableAmount: 15000000,
        paymentMethod: 'online_gateway',
        shippingAddress: {
          recipientName: 'علی تقوی',
          phoneNumber: '09121234567',
          province: 'تهران',
          city: 'تهران',
          address: 'خیابان ولیعصر',
          postalCode: '1998765432',
        },
        items: [],
      });

      await orderRepo.create(order);

      const res = await requestOrderPaymentUseCase.execute({ orderId: order.id });
      expect(res.authority).toBeDefined();
      expect(res.paymentUrl).toBeDefined();
      expect(res.amount).toBe(15000000);

      const savedTx = await paymentRepo.findByAuthority(res.authority);
      expect(savedTx).not.toBeNull();
      expect(savedTx?.targetId).toBe(order.id);
      expect(savedTx?.type).toBe(PaymentType.ORDER);
      expect(savedTx?.status).toBe(PaymentStatus.PENDING);
    });

    it('verifies order payment and transitions status to PROCESSING_WAREHOUSE', async () => {
      const order = new Order({
        id: 'ord-102',
        orderNumber: 'VX-9091',
        trackingCode: 'NET-87654321',
        userId: mockUser.id,
        status: OrderStatus.PENDING_FINANCIAL,
        customerType: 'retail',
        customerName: mockUser.name,
        phoneNumber: '09121234567',
        totalAmount: 20000000,
        discountAmount: 0,
        vatTaxAmount: 0,
        payableAmount: 20000000,
        paymentMethod: 'online_gateway',
        shippingAddress: {
          recipientName: 'علی تقوی',
          phoneNumber: '09121234567',
          province: 'تهران',
          city: 'تهران',
          address: 'خیابان ولیعصر',
          postalCode: '1998765432',
        },
        items: [],
      });

      await orderRepo.create(order);

      // Request payment
      const paymentInit = await requestOrderPaymentUseCase.execute({ orderId: order.id });

      // Mock verify response
      vi.spyOn(zarinpalService, 'verifyPayment').mockResolvedValueOnce({
        success: true,
        code: 100,
        refId: '987654321',
        cardPan: '6037-99**-****-1111',
      });

      const verifyRes = await verifyPaymentUseCase.execute({
        authority: paymentInit.authority,
        status: 'OK',
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.refId).toBe('987654321');

      // Check order status changed
      const updatedOrder = await orderRepo.findById(order.id);
      expect(updatedOrder?.status).toBe(OrderStatus.PROCESSING_WAREHOUSE);

      // Check payment status changed
      const tx = await paymentRepo.findByAuthority(paymentInit.authority);
      expect(tx?.status).toBe(PaymentStatus.SUCCESS);
      expect(tx?.refId).toBe('987654321');
    });

    it('handles cancellation if user cancels on Zarinpal sandbox', async () => {
      const order = new Order({
        id: 'ord-103',
        orderNumber: 'VX-9092',
        trackingCode: 'NET-99999999',
        userId: mockUser.id,
        status: OrderStatus.PENDING_FINANCIAL,
        customerType: 'retail',
        customerName: mockUser.name,
        phoneNumber: '09121234567',
        totalAmount: 1000000,
        discountAmount: 0,
        vatTaxAmount: 0,
        payableAmount: 1000000,
        paymentMethod: 'online_gateway',
        shippingAddress: {
          recipientName: 'علی تقوی',
          phoneNumber: '09121234567',
          province: 'تهران',
          city: 'تهران',
          address: 'خیابان ولیعصر',
          postalCode: '1998765432',
        },
        items: [],
      });

      await orderRepo.create(order);

      const paymentInit = await requestOrderPaymentUseCase.execute({ orderId: order.id });

      const verifyRes = await verifyPaymentUseCase.execute({
        authority: paymentInit.authority,
        status: 'NOK',
      });

      expect(verifyRes.success).toBe(false);
      const tx = await paymentRepo.findByAuthority(paymentInit.authority);
      expect(tx?.status).toBe(PaymentStatus.CANCELLED);
    });
  });

  describe('Wallet Recharge Flow', () => {
    it('creates wallet payment request and updates balance on verify', async () => {
      const res = await requestWalletChargeUseCase.execute({
        userId: mockUser.id,
        amount: 5000000,
      });

      expect(res.authority).toBeDefined();
      expect(res.amount).toBe(5000000);

      vi.spyOn(zarinpalService, 'verifyPayment').mockResolvedValueOnce({
        success: true,
        code: 100,
        refId: 'WAL-REF-555',
        cardPan: '5892-10**-****-4444',
      });

      const verifyRes = await verifyPaymentUseCase.execute({
        authority: res.authority,
        status: 'OK',
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.refId).toBe('WAL-REF-555');

      // Verify wallet was credited
      const wallet = await userRepo.getUserWallet(mockUser.id);
      expect(wallet).not.toBeNull();
      expect(wallet?.balance).toBe(5000000);
      expect(wallet?.transactions.length).toBeGreaterThan(0);
      expect(wallet?.transactions[0].type).toBe('DEPOSIT');
    });
  });

  describe('Invoice Payment Flow', () => {
    it('creates invoice payment request and marks invoice paid on verify', async () => {
      const invoice = new InvoiceEntity({
        id: 'inv-301',
        invoiceNumber: 'INV-1403-001',
        trackingCode: 'TRK-INV-001',
        userId: mockUser.id,
        type: 'OFFICIAL',
        status: 'ISSUED',
        paymentStatus: 'UNPAID',
        subtotal: 10000000,
        totalAmount: 11000000,
      });

      await invoiceRepo.save(invoice);

      const res = await requestInvoicePaymentUseCase.execute({ invoiceId: invoice.id });
      expect(res.authority).toBeDefined();
      expect(res.amount).toBe(11000000);

      vi.spyOn(zarinpalService, 'verifyPayment').mockResolvedValueOnce({
        success: true,
        code: 100,
        refId: 'INV-REF-999',
      });

      const verifyRes = await verifyPaymentUseCase.execute({
        authority: res.authority,
        status: 'OK',
      });

      expect(verifyRes.success).toBe(true);

      const updatedInv = await invoiceRepo.findById(invoice.id);
      expect(updatedInv?.paymentStatus).toBe('PAID');
    });
  });

  describe('PaymentsController & UseCase Security Fixes', () => {
    let paymentsController: PaymentsController;

    beforeEach(() => {
      paymentsController = new PaymentsController(
        requestOrderPaymentUseCase,
        requestWalletChargeUseCase,
        requestInvoicePaymentUseCase,
        verifyPaymentUseCase,
        userRepo,
      );
    });

    it('rejects chargeWallet when request is unauthenticated (no fallback to users[0])', async () => {
      const unauthReq = { user: undefined } as any;

      await expect(
        paymentsController.chargeWallet(unauthReq, { amount: 500000 }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects verifyDirect with empty or missing authority', async () => {
      await expect(
        paymentsController.verifyDirect({ authority: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects verifyDirect with a fake unregistered authority (400 Bad Request)', async () => {
      await expect(
        paymentsController.verifyDirect({ authority: 'fake-test-authority-999999' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('disallows dynamic registration without pre-existing transaction in VerifyPaymentUseCase', async () => {
      await expect(
        verifyPaymentUseCase.execute({
          authority: 'dynamic-unregistered-authority',
          amount: 5000000,
          type: 'WALLET',
          userId: mockUser.id,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects crediting wallet if userId in command mismatches transaction owner', async () => {
      const paymentInit = await requestWalletChargeUseCase.execute({
        userId: mockUser.id,
        amount: 1000000,
      });

      vi.spyOn(zarinpalService, 'verifyPayment').mockResolvedValueOnce({
        success: true,
        code: 100,
        refId: 'WAL-REF-SEC-1',
      });

      // Attacker tries to verify using their own userId for mockUser's transaction
      await expect(
        verifyPaymentUseCase.execute({
          authority: paymentInit.authority,
          status: 'OK',
          userId: 'attacker-user-id',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
