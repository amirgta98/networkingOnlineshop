import type { Order } from '../../domain/entities/order.entity.js';

export interface AdminNotificationDispatchDetail {
  adminId: string;
  adminName: string;
  phone: string;
  success: boolean;
  messageId?: string;
  errorMessage?: string;
}

export interface AdminOrderNotificationResult {
  orderId: string;
  orderNumber: string;
  totalAdmins: number;
  successfulCount: number;
  failedCount: number;
  skipped?: boolean;
  reason?: string;
  details?: AdminNotificationDispatchDetail[];
}

export interface CustomerOrderNotificationResult {
  orderId: string;
  orderNumber: string;
  customerPhone?: string;
  success: boolean;
  messageId?: string;
  skipped?: boolean;
  reason?: string;
  errorMessage?: string;
}

export interface OrderShippedNotificationResult {
  orderId: string;
  orderNumber: string;
  customerPhone?: string;
  carrier: string;
  success: boolean;
  messageId?: string;
  skipped?: boolean;
  reason?: string;
  errorMessage?: string;
}

export interface IOrderNotificationService {
  /**
   * Dispatches a new order notification to all eligible, active system administrators.
   */
  notifyAdminsOfNewOrder(order: Order): Promise<AdminOrderNotificationResult>;

  /**
   * Dispatches an order confirmation SMS directly to the customer who placed the order.
   *
   * @param order The newly created order entity.
   * @param customerPhone Optional phone number from the authenticated user profile (login phone).
   */
  notifyCustomerOfNewOrder(
    order: Order,
    customerPhone?: string,
  ): Promise<CustomerOrderNotificationResult>;

  /**
   * Dispatches a shipping / delivery handover SMS to the customer when their order is handed to the carrier/courier.
   *
   * @param order The order entity being shipped.
   * @param carrier The carrier name or slug (e.g. 'tipax', 'post', 'چاپار').
   * @param customerPhone Optional explicit recipient phone number.
   */
  notifyCustomerOfOrderShipped(
    order: Order,
    carrier?: string,
    customerPhone?: string,
  ): Promise<OrderShippedNotificationResult>;
}
