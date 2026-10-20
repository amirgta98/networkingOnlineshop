import { Logger } from '@nestjs/common';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IOrderNotificationService } from '../../services/order-notification.service.interface.js';
import { Order, OrderStatus } from '../../../domain/entities/order.entity.js';
import { OrderNotFoundException, InvalidOrderException } from '../../../domain/exceptions/order.exceptions.js';

export class UpdateOrderStatusUseCase {
  private readonly logger = new Logger(UpdateOrderStatusUseCase.name);

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly orderNotificationService?: IOrderNotificationService,
  ) {}

  async execute(id: string, statusInput: string, trackingCode?: string, carrier?: string): Promise<Order> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new OrderNotFoundException(id);
    }

    const normalizedStatus = statusInput.toUpperCase() as OrderStatus;
    if (!Object.values(OrderStatus).includes(normalizedStatus)) {
      throw new InvalidOrderException(`وضعیت سفارش «${statusInput}» نامعتبر است.`);
    }

    const updated = await this.orderRepository.updateStatus(id, normalizedStatus, trackingCode, carrier);

    // If order was moved to SHIPPING status, notify customer of handover
    if (normalizedStatus === OrderStatus.SHIPPING && this.orderNotificationService) {
      try {
        await this.orderNotificationService.notifyCustomerOfOrderShipped(
          updated,
          carrier || updated.shippingCarrier || undefined,
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `[OrderShippedNotification] Uncaught error notifying customer for shipped order ${updated.orderNumber}: ${errorMsg}`,
        );
      }
    }

    return updated;
  }
}
