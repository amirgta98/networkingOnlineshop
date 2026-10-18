import type { IOrderRepository, OrderFilterOptions } from '../../../domain/repositories/order.repository.interface.js';
import type { Order } from '../../../domain/entities/order.entity.js';

export class GetAllOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(filter?: OrderFilterOptions): Promise<Order[]> {
    return this.orderRepository.findAll(filter);
  }
}
