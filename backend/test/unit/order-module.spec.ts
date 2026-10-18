import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '../../src/application/use-cases/order/create-order.use-case.js';
import { GetAllOrdersUseCase } from '../../src/application/use-cases/order/get-all-orders.use-case.js';
import { GetOrderByIdUseCase } from '../../src/application/use-cases/order/get-order-by-id.use-case.js';
import { GetUserOrdersUseCase } from '../../src/application/use-cases/order/get-user-orders.use-case.js';
import { UpdateOrderStatusUseCase } from '../../src/application/use-cases/order/update-order-status.use-case.js';
import { AssignOrderCarrierUseCase } from '../../src/application/use-cases/order/assign-order-carrier.use-case.js';
import { InMemoryOrderRepository } from '../../src/infrastructure/database/in-memory/in-memory-order.repository.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { InMemoryProductRepository } from '../../src/infrastructure/database/in-memory/in-memory-product.repository.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { Email } from '../../src/domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';
import { Product } from '../../src/domain/entities/product.entity.js';
import { OrderStatus } from '../../src/domain/entities/order.entity.js';
import {
  EmptyOrderException,
  DuplicateOrderException,
  OrderNotFoundException,
  InvalidOrderException,
} from '../../src/domain/exceptions/order.exceptions.js';
import { UserNotFoundException } from '../../src/domain/exceptions/user-not-found.exception.js';

describe('Order Module - Clean Architecture Use Cases', () => {
  let orderRepository: InMemoryOrderRepository;
  let userRepository: InMemoryUserRepository;
  let productRepository: InMemoryProductRepository;

  let createOrderUseCase: CreateOrderUseCase;
  let getAllOrdersUseCase: GetAllOrdersUseCase;
  let getOrderByIdUseCase: GetOrderByIdUseCase;
  let getUserOrdersUseCase: GetUserOrdersUseCase;
  let updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  let assignOrderCarrierUseCase: AssignOrderCarrierUseCase;

  const testUserId = 'user-00000000-0000-4000-a000-000000000001';
  const testProductId = 'prod-cisco-switch-2960x';
  const basePrice = 18200000;

  beforeEach(async () => {
    orderRepository = new InMemoryOrderRepository();
    userRepository = new InMemoryUserRepository();
    productRepository = new InMemoryProductRepository();

    createOrderUseCase = new CreateOrderUseCase(orderRepository, productRepository, userRepository);
    getAllOrdersUseCase = new GetAllOrdersUseCase(orderRepository);
    getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);
    getUserOrdersUseCase = new GetUserOrdersUseCase(orderRepository);
    updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
    assignOrderCarrierUseCase = new AssignOrderCarrierUseCase(orderRepository);

    // Seed test user
    const user = new User({
      id: testUserId,
      name: 'عرفان رضایی',
      email: Email.create('erfan@network-fonix.ir'),
      phone: PhoneNumber.create('09121234567'),
      role: 'customer',
      status: 'active',
      isActive: true,
      firstName: 'عرفان',
      lastName: 'رضایی',
      companyName: 'شبکه ققنوس',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepository.save(user);

    // Seed test product
    const product = new Product({
      id: testProductId,
      name: 'سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L',
      slug: 'cisco-ws-c2960x-24ps-l',
      sku: 'WS-C2960X-24PS-L',
      price: basePrice,
      originalPrice: 26000000,
      shortDescription: 'سوئیچ مدیریتی لایه ۲ سیسکو',
      brand: 'Cisco',
      category: 'switches',
      stock: 10,
      featured: true,
      hasOriginalWarranty: true,
      isFreeExpressShipping: true,
      rating: 4.9,
      reviewsCount: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await productRepository.save(product);
  });

  describe('CreateOrderUseCase', () => {
    const validShippingAddress = {
      recipientName: 'مهندس رضایی',
      phoneNumber: '09121234567',
      province: 'تهران',
      city: 'تهران',
      postalCode: '1998765432',
      address: 'خیابان ولیعصر، پلاک ۳۴',
    };

    it('should throw EmptyOrderException when items array is empty', async () => {
      await expect(
        createOrderUseCase.execute({
          userId: testUserId,
          items: [],
          shippingAddress: validShippingAddress,
        }),
      ).rejects.toThrow(EmptyOrderException);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      await expect(
        createOrderUseCase.execute({
          userId: 'non-existent-user-id',
          items: [{ productId: testProductId, quantity: 1 }],
          shippingAddress: validShippingAddress,
        }),
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should enforce server-side prices and ignore tampered unitPrice from client', async () => {
      const tamperedPrice = 1000; // Frontend trying to pay 1000 instead of 18200000
      const order = await createOrderUseCase.execute({
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 2, unitPrice: tamperedPrice }],
        shippingAddress: validShippingAddress,
        deliveryMethodId: 'express_courier',
      });

      expect(order.items[0].unitPrice).toBe(basePrice);
      expect(order.financialSummary.subtotal).toBe(basePrice * 2);
      expect(order.orderNumber).toMatch(/^VX-\d+$/);
      expect(order.trackingCode).toMatch(/^NET-\d+$/);
      expect(order.status).toBe('pending_financial');
      expect(order.paymentStatus).toBe('pending_transfer');
    });

    it('should calculate coupon discounts accurately (NETMARKET 5%)', async () => {
      const order = await createOrderUseCase.execute({
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 1 }],
        shippingAddress: validShippingAddress,
        couponCode: 'NETMARKET',
      });

      const expectedDiscount = Math.round(basePrice * 0.05);
      expect(order.financialSummary.couponDiscount).toBe(expectedDiscount);
      expect(order.financialSummary.payableTotal).toBe(
        basePrice - expectedDiscount + order.financialSummary.shippingCost,
      );
    });

    it('should calculate 10% VAT tax for legal invoice requests', async () => {
      const order = await createOrderUseCase.execute({
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 1 }],
        shippingAddress: validShippingAddress,
        invoiceType: 'legal',
        legalInvoice: {
          companyName: 'شرکت فناوران شبکه ققنوس',
          nationalId: '10103567890',
        },
      });

      const expectedVat = Math.round(basePrice * 0.1);
      expect(order.financialSummary.vatTax).toBe(expectedVat);
      expect(order.financialSummary.payableTotal).toBe(
        basePrice + expectedVat + order.financialSummary.shippingCost,
      );
    });

    it('should apply free shipping when subtotal reaches the delivery method threshold', async () => {
      // express_courier threshold is 5,000,000; basePrice is 18,200,000 (> threshold)
      const order = await createOrderUseCase.execute({
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 1 }],
        shippingAddress: validShippingAddress,
        deliveryMethodId: 'express_courier',
      });

      expect(order.financialSummary.shippingCost).toBe(0);
      expect(order.financialSummary.isFreeShipping).toBe(true);
    });

    it('should prevent duplicate order submissions within the 5-second window', async () => {
      const payload = {
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 1 }],
        shippingAddress: validShippingAddress,
      };

      await createOrderUseCase.execute(payload);

      await expect(createOrderUseCase.execute(payload)).rejects.toThrow(
        DuplicateOrderException,
      );
    });
  });

  describe('Admin and User Order Query Use Cases', () => {
    let createdOrderId: string;
    let orderNum: string;

    beforeEach(async () => {
      const res = await createOrderUseCase.execute({
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 1 }],
        shippingAddress: {
          recipientName: 'مهندس رضایی',
          phoneNumber: '09121234567',
          province: 'تهران',
          city: 'تهران',
          postalCode: '1998765432',
          address: 'خیابان ولیعصر',
        },
      });
      createdOrderId = res.orderId;
      orderNum = res.orderNumber;
    });

    it('should retrieve all orders and support status filter', async () => {
      const all = await getAllOrdersUseCase.execute();
      expect(all.length).toBeGreaterThanOrEqual(1);

      const filtered = await getAllOrdersUseCase.execute({ status: 'PENDING_FINANCIAL' });
      expect(filtered.length).toBeGreaterThanOrEqual(1);

      const emptyFilter = await getAllOrdersUseCase.execute({ status: 'DELIVERED' });
      expect(emptyFilter.length).toBe(0);
    });

    it('should retrieve order by ID, order number, or tracking code', async () => {
      const byId = await getOrderByIdUseCase.execute(createdOrderId);
      expect(byId.id).toBe(createdOrderId);

      const byNumber = await getOrderByIdUseCase.execute(orderNum);
      expect(byNumber.id).toBe(createdOrderId);

      await expect(getOrderByIdUseCase.execute('INVALID-CODE')).rejects.toThrow(
        OrderNotFoundException,
      );
    });

    it('should retrieve user orders by userId', async () => {
      const userOrders = await getUserOrdersUseCase.execute(testUserId);
      expect(userOrders.length).toBe(1);
      expect(userOrders[0].userId).toBe(testUserId);
    });
  });

  describe('Order Status Transitions and Logistics Carrier Assignment', () => {
    let orderId: string;

    beforeEach(async () => {
      const res = await createOrderUseCase.execute({
        userId: testUserId,
        items: [{ productId: testProductId, quantity: 1 }],
        shippingAddress: {
          recipientName: 'مهندس رضایی',
          phoneNumber: '09121234567',
          province: 'تهران',
          city: 'تهران',
          postalCode: '1998765432',
          address: 'خیابان ولیعصر',
        },
      });
      orderId = res.orderId;
    });

    it('should update status to PROCESSING_WAREHOUSE upon financial verification', async () => {
      const updated = await updateOrderStatusUseCase.execute(
        orderId,
        'PROCESSING_WAREHOUSE',
        undefined,
        undefined,
      );

      expect(updated.status).toBe(OrderStatus.PROCESSING_WAREHOUSE);
    });

    it('should throw InvalidOrderException when assigning an unknown status', async () => {
      await expect(
        updateOrderStatusUseCase.execute(orderId, 'NON_EXISTENT_STATUS'),
      ).rejects.toThrow(InvalidOrderException);
    });

    it('should assign carrier, tracking code, and transition to SHIPPING status', async () => {
      const updated = await assignOrderCarrierUseCase.execute(
        orderId,
        'tipax',
        'TPX-9842104',
      );

      expect(updated.status).toBe(OrderStatus.SHIPPING);
      expect(updated.shippingCarrier).toBe('tipax');
      expect(updated.trackingCode).toBe('TPX-9842104');
    });
  });
});
