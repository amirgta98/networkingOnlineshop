export type OrderStatus =
  | "pending_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  model: string;
  brand: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  warranty: string;
}

export interface TrackingStep {
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  trackingCode: string;
  courierName: string;
  courierTrackingUrl?: string;
  createdAt: string;
  deliveredAt?: string;
  status: OrderStatus;
  statusLabel: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  payableAmount: number;
  paymentMethodTitle: string;
  shippingAddress: {
    title: string;
    recipientName: string;
    phoneNumber: string;
    fullAddress: string;
    postalCode: string;
  };
  trackingSteps: TrackingStep[];
  invoiceId?: string;
}
