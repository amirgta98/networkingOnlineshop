import { IOrderRepository, OrderFilterOptions } from '../../../domain/repositories/order.repository.interface.js';
import { Order, OrderStatus } from '../../../domain/entities/order.entity.js';

export class InMemoryOrderRepository implements IOrderRepository {
  private readonly orders = new Map<string, Order>();

  async create(order: Order, options?: { decrementStock?: boolean }): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order;
      }
    }
    return null;
  }

  async findByTrackingCode(trackingCode: string): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (order.trackingCode === trackingCode) {
        return order;
      }
    }
    return null;
  }

  async findAll(filter?: OrderFilterOptions): Promise<Order[]> {
    let list = Array.from(this.orders.values());

    if (filter?.status && filter.status !== 'all') {
      const targetStatus = filter.status.toUpperCase();
      list = list.filter((o) => o.status.toUpperCase() === targetStatus);
    }

    if (filter?.customerType && filter.customerType !== 'all') {
      const targetType = filter.customerType.toLowerCase();
      list = list.filter((o) => o.customerType.toLowerCase() === targetType);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.trackingCode.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.companyName && o.companyName.toLowerCase().includes(q)) ||
          o.phoneNumber.includes(q),
      );
    }

    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const list = Array.from(this.orders.values()).filter((o) => o.userId === userId);
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    trackingCode?: string,
    carrier?: string,
  ): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error(`Order ${id} not found in memory`);
    }
    order.updateStatus(status);
    if (carrier) {
      order.assignCarrier(carrier, trackingCode);
    }
    this.orders.set(id, order);
    return order;
  }

  async findRecentOrder(
    userId: string,
    payableAmount: number,
    windowSeconds: number,
  ): Promise<Order | null> {
    const threshold = Date.now() - windowSeconds * 1000;
    for (const order of this.orders.values()) {
      if (
        order.userId === userId &&
        order.payableAmount === payableAmount &&
        order.createdAt.getTime() > threshold
      ) {
        return order;
      }
    }
    return null;
  }

  public clear(): void {
    this.orders.clear();
  }
}
