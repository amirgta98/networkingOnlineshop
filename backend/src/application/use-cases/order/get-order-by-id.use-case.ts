import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { Order } from '../../../domain/entities/order.entity.js';
import { OrderNotFoundException } from '../../../domain/exceptions/order.exceptions.js';

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(idOrNumber: string): Promise<Order> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);
    let order: Order | null = null;
    if (isUuid) {
      order = await this.orderRepository.findById(idOrNumber);
    }
    if (!order) {
      order = await this.orderRepository.findByOrderNumber(idOrNumber);
    }
    if (!order) {
      order = await this.orderRepository.findByTrackingCode(idOrNumber);
    }
    if (!order) {
      throw new OrderNotFoundException(idOrNumber);
    }
    return order;
  }
}
