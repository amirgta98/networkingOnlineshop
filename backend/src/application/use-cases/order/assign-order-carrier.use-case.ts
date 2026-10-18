import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import { Order, OrderStatus } from '../../../domain/entities/order.entity.js';
import { OrderNotFoundException } from '../../../domain/exceptions/order.exceptions.js';

export class AssignOrderCarrierUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string, carrier: string, trackingCode?: string): Promise<Order> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new OrderNotFoundException(id);
    }

    return this.orderRepository.updateStatus(
      id,
      OrderStatus.SHIPPING,
      trackingCode || existing.trackingCode,
      carrier,
    );
  }
}
