import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { IOrderRepository, OrderFilterOptions } from '../../../../domain/repositories/order.repository.interface.js';
import { Order, OrderItemEntity, OrderStatus } from '../../../../domain/entities/order.entity.js';
import { InsufficientStockException, InvalidOrderException } from '../../../../domain/exceptions/order.exceptions.js';
import { InMemoryOrderRepository } from '../../in-memory/in-memory-order.repository.js';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  private readonly logger = new Logger(PrismaOrderRepository.name);
  private readonly inMemoryFallback = new InMemoryOrderRepository();

  constructor(private readonly prisma: PrismaService) {}

  private isPrismaConnectionError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const name = (err as any).name;
    const code = (err as any).code;
    const message = String((err as any).message || '');
    return (
      name === 'PrismaClientInitializationError' ||
      name === 'PrismaClientRustPanicError' ||
      name === 'PrismaClientUnknownRequestError' ||
      code === 'P1000' ||
      code === 'P1001' ||
      code === 'P1002' ||
      code === 'P1003' ||
      code === 'P1008' ||
      code === 'P1010' ||
      code === 'P1017' ||
      code === 'P2021' ||
      code === 'P2022' ||
      message.includes('Authentication failed') ||
      message.includes("Can't reach database server") ||
      message.includes('database server was reached') ||
      message.includes('does not exist in the current database')
    );
  }

  async create(order: Order, options?: { decrementStock?: boolean }): Promise<Order> {
    const shouldDecrement = options?.decrementStock !== false;

    try {
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
            } else {
              // Variant or inventory missing -> product is out of stock
              throw new InsufficientStockException(
                product.name,
                item.quantity,
                0,
              );
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
            affiliatePartnerId: order.affiliatePartnerId,
            affiliateDiscountAmount: BigInt(order.affiliateDiscountAmount || 0),
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
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in create order; falling back to in-memory order repository.`);
        return this.inMemoryFallback.create(order, options);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Order | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return null;

    try {
      const raw = await this.prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
      });
      return raw ? this.toDomain(raw) : null;
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in findById order; falling back to in-memory.`);
        return this.inMemoryFallback.findById(id);
      }
      throw err;
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const raw = await this.prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
      });
      return raw ? this.toDomain(raw) : null;
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in findByOrderNumber; falling back to in-memory.`);
        return this.inMemoryFallback.findByOrderNumber(orderNumber);
      }
      throw err;
    }
  }

  async findByTrackingCode(trackingCode: string): Promise<Order | null> {
    try {
      const raw = await this.prisma.order.findUnique({
        where: { trackingCode },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
      });
      return raw ? this.toDomain(raw) : null;
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in findByTrackingCode; falling back to in-memory.`);
        return this.inMemoryFallback.findByTrackingCode(trackingCode);
      }
      throw err;
    }
  }

  async findAll(filter?: OrderFilterOptions): Promise<Order[]> {
    try {
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
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return rows.map((r) => this.toDomain(r));
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in findAll orders; falling back to in-memory.`);
        return this.inMemoryFallback.findAll(filter);
      }
      throw err;
    }
  }

  async findByUserId(userId: string): Promise<Order[]> {
    try {
      const rows = await this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return rows.map((r) => this.toDomain(r));
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in findByUserId; falling back to in-memory.`);
        return this.inMemoryFallback.findByUserId(userId);
      }
      throw err;
    }
  }

  async update(order: Order): Promise<Order> {
    try {
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
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in update order; falling back to in-memory.`);
        return this.inMemoryFallback.update(order);
      }
      throw err;
    }
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

    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
      });

      return this.toDomain(updated);
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in updateStatus; falling back to in-memory.`);
        return this.inMemoryFallback.updateStatus(id, status, trackingCode, carrier);
      }
      if (err?.code === 'P2002') {
        throw new InvalidOrderException('کد رهگیری مرسوله قبلاً در سیستم برای سفارش دیگری ثبت شده و باید یکتا باشد.');
      }
      throw err;
    }
  }

  async findRecentOrder(
    userId: string,
    payableAmount: number,
    windowSeconds: number,
  ): Promise<Order | null> {
    const threshold = new Date(Date.now() - windowSeconds * 1000);
    try {
      const raw = await this.prisma.order.findFirst({
        where: {
          userId,
          payableAmount: BigInt(payableAmount),
          createdAt: { gte: threshold },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  },
                },
              },
            },
          },
        },
      });

      return raw ? this.toDomain(raw) : null;
    } catch (err: any) {
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Postgres connection error in findRecentOrder; falling back to in-memory.`);
        return this.inMemoryFallback.findRecentOrder(userId, payableAmount, windowSeconds);
      }
      throw err;
    }
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
      affiliatePartnerId: raw.affiliatePartnerId,
      affiliateDiscountAmount: Number(raw.affiliateDiscountAmount || 0),
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
            imageUrl: it.product?.images?.[0]?.url || it.imageUrl || null,
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
