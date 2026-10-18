import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { Order } from '../../../domain/entities/order.entity.js';

export class GetUserOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }
}
