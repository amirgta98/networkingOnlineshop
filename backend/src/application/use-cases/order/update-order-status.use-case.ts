import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import { Order, OrderStatus } from '../../../domain/entities/order.entity.js';
import { OrderNotFoundException, InvalidOrderException } from '../../../domain/exceptions/order.exceptions.js';

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string, statusInput: string, trackingCode?: string, carrier?: string): Promise<Order> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new OrderNotFoundException(id);
    }

    const normalizedStatus = statusInput.toUpperCase() as OrderStatus;
    if (!Object.values(OrderStatus).includes(normalizedStatus)) {
      throw new InvalidOrderException(`وضعیت سفارش «${statusInput}» نامعتبر است.`);
    }

    return this.orderRepository.updateStatus(id, normalizedStatus, trackingCode, carrier);
  }
}
