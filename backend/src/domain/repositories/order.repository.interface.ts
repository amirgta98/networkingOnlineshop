import { Order, OrderStatus } from '../entities/order.entity.js';

export interface OrderFilterOptions {
  status?: string;
  customerType?: string;
  search?: string;
}

export interface IOrderRepository {
  create(order: Order, options?: { decrementStock?: boolean }): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByTrackingCode(trackingCode: string): Promise<Order | null>;
  findAll(filter?: OrderFilterOptions): Promise<Order[]>;
  findByUserId(userId: string): Promise<Order[]>;
  update(order: Order): Promise<Order>;
  updateStatus(
    id: string,
    status: OrderStatus,
    trackingCode?: string,
    carrier?: string,
  ): Promise<Order>;
  findRecentOrder(
    userId: string,
    payableAmount: number,
    windowSeconds: number,
  ): Promise<Order | null>;
}
