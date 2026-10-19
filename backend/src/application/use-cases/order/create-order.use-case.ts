import { randomUUID } from 'node:crypto';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { Order, OrderItemEntity, OrderStatus } from '../../../domain/entities/order.entity.js';
import {
  EmptyOrderException,
  DuplicateOrderException,
  InvalidOrderException,
  InsufficientStockException,
} from '../../../domain/exceptions/order.exceptions.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import type {
  CreateOrderCommand,
  PlacedOrderOutputDto,
} from '../../dto/order/order.dto.js';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateOrderCommand): Promise<PlacedOrderOutputDto> {
    if (!command.items || command.items.length === 0) {
      throw new EmptyOrderException();
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    // Server-side product price & details lookup
    const orderItems: OrderItemEntity[] = [];
    let subtotal = 0;

    for (const itemInput of command.items) {
      if (itemInput.quantity <= 0) {
        throw new InvalidOrderException('تعداد هر قلم کالا باید حداقل ۱ عدد باشد.');
      }

      let product = null;
      if (itemInput.productId) {
        product = await this.productRepository.findById(itemInput.productId);
      }
      if (!product && itemInput.sku) {
        product = await this.productRepository.findBySku(itemInput.sku);
      }

      let unitPrice = 0;
      let title = '';
      let sku = itemInput.sku || '';
      let brand = 'Cisco';
      let model = itemInput.sku || '';
      let warranty = 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس';

      if (!product) {
        throw new InvalidOrderException(
          `محصول مورد نظر با شناسه ${itemInput.productId || itemInput.sku} در پایگاه داده یافت نشد.`,
        );
      }

      const prodJson = product.toJSON();
      if (prodJson.stock !== undefined && prodJson.stock !== null && prodJson.stock < itemInput.quantity) {
        throw new InsufficientStockException(
          prodJson.name,
          itemInput.quantity,
          prodJson.stock,
        );
      }

      unitPrice = prodJson.price;
      title = prodJson.name;
      sku = prodJson.sku || sku;
      if (prodJson.warranty) {
        warranty = prodJson.warranty;
      }

      const itemTotalPrice = unitPrice * itemInput.quantity;
      subtotal += itemTotalPrice;

      orderItems.push(
        new OrderItemEntity({
          id: randomUUID(),
          productId: product ? product.id : itemInput.productId,
          sku,
          title,
          brand,
          model,
          unitPrice,
          quantity: itemInput.quantity,
          totalPrice: itemTotalPrice,
          warranty,
          serialNumbers: [],
          createdAt: new Date(),
        }),
      );
    }

    // Coupon calculation
    let couponDiscount = 0;
    if (command.couponCode) {
      const code = command.couponCode.trim().toUpperCase();
      if (code === 'NETMARKET') couponDiscount = Math.round(subtotal * 0.05);
      else if (code === 'VIP50') couponDiscount = 350000;
      else if (code === 'OFF10') couponDiscount = Math.round(subtotal * 0.1);
      else if (code === 'CISCO2026') couponDiscount = 700000;
      else couponDiscount = 0;
    }

    // Shipping cost calculation
    const methodId = command.deliveryMethodId || 'express_courier';
    let shippingCost = 0;
    let isFreeShipping = false;

    if (methodId === 'express_courier') {
      shippingCost = 45000;
      if (subtotal >= 5000000) {
        shippingCost = 0;
        isFreeShipping = true;
      }
    } else if (methodId === 'tipax_express') {
      shippingCost = 75000;
      if (subtotal >= 8000000) {
        shippingCost = 0;
        isFreeShipping = true;
      }
    } else if (methodId === 'heavy_freight') {
      shippingCost = 140000;
    } else if (methodId === 'post_pishtaz') {
      shippingCost = 40000;
      if (subtotal >= 6000000) {
        shippingCost = 0;
        isFreeShipping = true;
      }
    } else if (methodId === 'warehouse_pickup') {
      shippingCost = 0;
      isFreeShipping = true;
    }

    // VAT calculation: 10% for legal invoices
    const isLegal = command.invoiceType === 'legal';
    const vatTax = isLegal ? Math.round((subtotal - couponDiscount) * 0.1) : 0;
    const payableTotal = Math.max(0, subtotal - couponDiscount + shippingCost + vatTax);

    // Duplicate order prevention (5-second window)
    const recent = await this.orderRepository.findRecentOrder(command.userId, payableTotal, 5);
    if (recent) {
      throw new DuplicateOrderException();
    }

    // Generate unique orderNumber and trackingCode
    const orderNumber = 'VX-' + Math.floor(1000 + Math.random() * 9000);
    const trackingCode = 'NET-' + Math.floor(10000000 + Math.random() * 90000000);

    const addr = command.shippingAddress;
    const customerType = isLegal ? 'b2b' : 'retail';
    const userPhoneStr = user.phone ? (typeof user.phone === 'string' ? user.phone : (user.phone as any).value || '') : '';
    const customerName = addr.recipientName || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || userPhoneStr || 'مشتری'));
    const companyName = command.legalInvoice?.companyName || user.companyName;
    const nationalCode = command.legalInvoice?.nationalId || command.legalInvoice?.economicCode;
    const phoneNumber = addr.phoneNumber || userPhoneStr || '09121234567';

    const deliveryNoteParts = [
      command.deliveryMethodId ? `روش ارسال: ${command.deliveryMethodId}` : '',
      command.deliveryDateJalali ? `تاریخ تحویل: ${command.deliveryDateJalali} (${command.deliveryTimeSlot || ''})` : '',
      command.liftRequired ? 'بالابر هیدرولیک: بله' : '',
      command.specialDeliveryNotes ? `یادداشت تحویل: ${command.specialDeliveryNotes}` : '',
    ].filter(Boolean);

    const deliveryNotes = deliveryNoteParts.length > 0 ? deliveryNoteParts.join(' | ') : undefined;

    const order = new Order({
      id: randomUUID(),
      orderNumber,
      trackingCode,
      userId: command.userId,
      status: OrderStatus.PENDING_FINANCIAL,
      customerType,
      customerName,
      companyName,
      nationalCode,
      phoneNumber,
      totalAmount: subtotal,
      discountAmount: couponDiscount,
      vatTaxAmount: vatTax,
      payableAmount: payableTotal,
      paymentMethod: command.paymentMethodId || 'online_gateway',
      shippingCarrier: command.deliveryMethodId,
      shippingCost,
      deliveryNotes,
      shippingAddress: {
        province: addr.province,
        city: addr.city,
        address: addr.address,
        postalCode: addr.postalCode,
        recipientName: addr.recipientName,
        phoneNumber: addr.phoneNumber,
        buildingNumber: addr.buildingNumber,
        unit: addr.unit,
        deliveryNotes: addr.deliveryNotes,
      },
      items: orderItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await this.orderRepository.create(order, { decrementStock: true });

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      trackingCode: savedOrder.trackingCode,
      createdAt: savedOrder.createdAt.toISOString(),
      status: 'pending_financial',
      statusLabel: 'در انتظار تایید مالی',
      items: savedOrder.items.map((it) => ({
        productId: it.productId ?? undefined,
        sku: it.sku,
        title: it.title,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        totalPrice: it.totalPrice,
      })),
      shippingAddress: {
        recipientName: addr.recipientName,
        phoneNumber: addr.phoneNumber,
        province: addr.province,
        city: addr.city,
        postalCode: addr.postalCode,
        address: addr.address,
        buildingNumber: addr.buildingNumber,
        unit: addr.unit,
        deliveryNotes: addr.deliveryNotes,
      },
      financialSummary: {
        subtotal,
        discountTotal: couponDiscount,
        couponDiscount,
        shippingCost,
        vatTax,
        payableTotal,
        isFreeShipping,
      },
      paymentMethod: {
        id: command.paymentMethodId || 'online_gateway',
        type: command.paymentMethodId || 'online_gateway',
        title:
          command.paymentMethodId === 'bank_transfer'
            ? 'واریز به شماره حساب / پایا و ساتنا'
            : command.paymentMethodId === 'credit'
            ? 'اعتبار سازمانی (خرید اعتباری B2B)'
            : command.paymentMethodId === 'cheque'
            ? 'چک صیادی بنفش'
            : 'درگاه پرداخت اینترنتی شاپرک',
      },
      paymentStatus: 'pending_transfer',
    };
  }
}
