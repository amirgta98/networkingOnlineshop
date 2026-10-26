import { Logger } from '@nestjs/common';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IAffiliateRepository } from '../../../domain/repositories/affiliate.repository.interface.js';
import type { IOrderNotificationService } from '../../services/order-notification.service.interface.js';
import { Order, OrderStatus } from '../../../domain/entities/order.entity.js';
import { OrderNotFoundException, InvalidOrderException } from '../../../domain/exceptions/order.exceptions.js';

export class UpdateOrderStatusUseCase {
  private readonly logger = new Logger(UpdateOrderStatusUseCase.name);

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly orderNotificationService?: IOrderNotificationService,
    private readonly affiliateRepository?: IAffiliateRepository,
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

    const wasAlreadyVoided =
      existing.status === OrderStatus.CANCELLED ||
      (existing.status as string) === 'REFUNDED' ||
      (existing.status as string) === 'RETURNED';

    const updated = await this.orderRepository.updateStatus(id, normalizedStatus, trackingCode, carrier);

    // If order was cancelled, refunded, or returned, adjust or cancel affiliate commissions & partner stats
    const isOrderVoided =
      normalizedStatus === OrderStatus.CANCELLED ||
      (normalizedStatus as string) === 'REFUNDED' ||
      (normalizedStatus as string) === 'RETURNED';

    if (isOrderVoided && !wasAlreadyVoided && this.affiliateRepository) {
      try {
        await this.affiliateRepository.cancelCommissionsByOrderId(id);
        const partnerId = existing.affiliatePartnerId;
        if (partnerId) {
          const partner = await this.affiliateRepository.findPartnerById(partnerId);
          if (partner) {
            await this.affiliateRepository.updatePartner(partner.id, {
              totalSales: Math.max(0, partner.totalSales - existing.payableAmount),
              totalOrders: Math.max(0, partner.totalOrders - 1),
            });
          }
        }
      } catch (err: unknown) {
        this.logger.error(`Error cancelling commissions/adjusting partner for voided order ${id}: ${err}`);
      }
    }

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
