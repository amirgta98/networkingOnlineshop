import { Logger } from '@nestjs/common';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IOrderNotificationService } from '../../services/order-notification.service.interface.js';
import { Order, OrderStatus } from '../../../domain/entities/order.entity.js';
import { OrderNotFoundException } from '../../../domain/exceptions/order.exceptions.js';

export class AssignOrderCarrierUseCase {
  private readonly logger = new Logger(AssignOrderCarrierUseCase.name);

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly orderNotificationService?: IOrderNotificationService,
  ) {}

  async execute(id: string, carrier: string, trackingCode?: string): Promise<Order> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new OrderNotFoundException(id);
    }

    const updated = await this.orderRepository.updateStatus(
      id,
      OrderStatus.SHIPPING,
      trackingCode || existing.trackingCode,
      carrier,
    );

    // Automatic customer notification via Melipayamak Pattern 546532 (or Telegram in Dev)
    if (this.orderNotificationService) {
      try {
        await this.orderNotificationService.notifyCustomerOfOrderShipped(updated, carrier);
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
