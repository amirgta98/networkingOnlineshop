import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IOrderRepository, OrderFilterOptions } from '../../../../domain/repositories/order.repository.interface.js';
import { Order, OrderItemEntity, OrderStatus } from '../../../../domain/entities/order.entity.js';
import { InsufficientStockException } from '../../../../domain/exceptions/order.exceptions.js';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  private readonly logger = new Logger(PrismaOrderRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(order: Order, options?: { decrementStock?: boolean }): Promise<Order> {
    const shouldDecrement = options?.decrementStock !== false;

    await this.prisma.$transaction(async (tx) => {
      // 1. Process inventory checking and decrement atomically
      if (shouldDecrement) {
        for (const item of order.items) {
          if (!item.productId) continue;

          // Find product with variants and inventories
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: {
              variants: {
                include: { inventory: true },
              },
            },
          });

          if (!product) continue;

          const defaultVariant = product.variants[0];

          if (defaultVariant && defaultVariant.inventory) {
            const inv = defaultVariant.inventory;
            if (inv.quantity < item.quantity && !inv.allowBackorder) {
              throw new InsufficientStockException(
                product.name,
                item.quantity,
                inv.quantity,
              );
            }

            await tx.productInventory.update({
              where: { id: inv.id },
              data: {
                quantity: { decrement: item.quantity },
                updatedAt: new Date(),
              },
            });
          } else if (defaultVariant) {
            // Variant exists without inventory record -> create inventory with initial stock
            const initialQty = Math.max(0, 50 - item.quantity);
            await tx.productInventory.create({
              data: {
                variantId: defaultVariant.id,
                quantity: initialQty,
                warehouseCode: 'MAIN',
              },
            });
          } else {
            // Product has no variant yet -> create default variant & inventory
            const newVariant = await tx.productVariant.create({
              data: {
                productId: product.id,
                sku: product.sku || `VAR-${product.id.slice(0, 8)}`,
                price: product.basePrice,
                isDefault: true,
              },
            });

            const initialQty = Math.max(0, 50 - item.quantity);
            await tx.productInventory.create({
              data: {
                variantId: newVariant.id,
                quantity: initialQty,
                warehouseCode: 'MAIN',
              },
            });
          }
        }
      }

      // 2. Insert Order record
      await tx.order.create({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          trackingCode: order.trackingCode,
          userId: order.userId,
          status: order.status as any,
          customerType: order.customerType,
          customerName: order.customerName,
          companyName: order.companyName,
          nationalCode: order.nationalCode,
          phoneNumber: order.phoneNumber,
          totalAmount: BigInt(order.totalAmount),
          discountAmount: BigInt(order.discountAmount),
          vatTaxAmount: BigInt(order.vatTaxAmount),
          payableAmount: BigInt(order.payableAmount),
          paymentMethod: order.paymentMethod,
          shippingCarrier: order.shippingCarrier,
          shippingCost: BigInt(order.shippingCost),
          deliveryNotes: order.deliveryNotes,
          shippingAddress: order.shippingAddress as any,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: {
            create: order.items.map((it) => ({
              id: it.id,
              productId: it.productId,
              sku: it.sku,
              title: it.title,
              brand: it.brand,
              model: it.model,
              unitPrice: BigInt(it.unitPrice),
              quantity: it.quantity,
              totalPrice: BigInt(it.totalPrice),
              warranty: it.warranty,
              serialNumbers: it.serialNumbers,
              createdAt: it.createdAt,
            })),
          },
        },
      });

      // 3. Clear user active cart
      const cart = await tx.cart.findUnique({
        where: { userId: order.userId },
      });
      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    });

    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByTrackingCode(trackingCode: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({
      where: { trackingCode },
      include: { items: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(filter?: OrderFilterOptions): Promise<Order[]> {
    const where: any = {};

    if (filter?.status && filter.status !== 'all') {
      where.status = filter.status.toUpperCase();
    }

    if (filter?.customerType && filter.customerType !== 'all') {
      where.customerType = filter.customerType.toLowerCase();
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { trackingCode: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q } },
      ];
    }

    const rows = await this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((r) => this.toDomain(r));
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async update(order: Order): Promise<Order> {
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status as any,
        shippingCarrier: order.shippingCarrier,
        deliveryNotes: order.deliveryNotes,
        updatedAt: new Date(),
      },
    });
    return order;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    trackingCode?: string,
    carrier?: string,
  ): Promise<Order> {
    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };
    if (trackingCode) updateData.trackingCode = trackingCode;
    if (carrier) updateData.shippingCarrier = carrier;

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return this.toDomain(updated);
  }

  async findRecentOrder(
    userId: string,
    payableAmount: number,
    windowSeconds: number,
  ): Promise<Order | null> {
    const threshold = new Date(Date.now() - windowSeconds * 1000);
    const raw = await this.prisma.order.findFirst({
      where: {
        userId,
        payableAmount: BigInt(payableAmount),
        createdAt: { gte: threshold },
      },
      include: { items: true },
    });

    return raw ? this.toDomain(raw) : null;
  }

  private toDomain(raw: any): Order {
    return new Order({
      id: raw.id,
      orderNumber: raw.orderNumber,
      trackingCode: raw.trackingCode,
      userId: raw.userId,
      status: raw.status as OrderStatus,
      customerType: (raw.customerType || 'retail') as 'retail' | 'b2b',
      customerName: raw.customerName,
      companyName: raw.companyName,
      nationalCode: raw.nationalCode,
      phoneNumber: raw.phoneNumber,
      totalAmount: Number(raw.totalAmount),
      discountAmount: Number(raw.discountAmount),
      vatTaxAmount: Number(raw.vatTaxAmount),
      payableAmount: Number(raw.payableAmount),
      paymentMethod: raw.paymentMethod,
      shippingCarrier: raw.shippingCarrier,
      shippingCost: Number(raw.shippingCost),
      deliveryNotes: raw.deliveryNotes,
      shippingAddress: raw.shippingAddress,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      items: (raw.items || []).map(
        (it: any) =>
          new OrderItemEntity({
            id: it.id,
            orderId: it.orderId,
            productId: it.productId,
            sku: it.sku,
            title: it.title,
            brand: it.brand,
            model: it.model,
            unitPrice: Number(it.unitPrice),
            quantity: it.quantity,
            totalPrice: Number(it.totalPrice),
            warranty: it.warranty,
            serialNumbers: it.serialNumbers || [],
            createdAt: it.createdAt,
          }),
      ),
    });
  }
}
