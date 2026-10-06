import { CartItem } from "@/features/cart/types";

export type CheckoutStep = "shipping" | "invoice" | "delivery" | "payment" | "success";

export type InvoiceType = "personal" | "legal";

export interface ShippingAddress {
  id?: string;
  title?: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  buildingNumber: string;
  unit?: string;
  deliveryNotes?: string;
  recipientIsSelf: boolean;
}

export interface LegalInvoiceData {
  companyName: string;
  nationalId: string;
  economicCode: string;
  registrationNumber: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  phoneNumber: string;
}

export interface DeliveryMethod {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cost: number;
  freeThreshold?: number;
  estimatedDeliveryTime: string;
  iconName: "truck" | "zap" | "package" | "building2";
  isExpress?: boolean;
}

export type PaymentMethodType = "gateway" | "credit" | "bank_transfer" | "cheque";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  title: string;
  subtitle: string;
  description: string;
  iconName: "credit-card" | "wallet" | "building-bank" | "file-text";
  gateways?: {
    id: string;
    name: string;
    logoUrl?: string;
    bankName: string;
  }[];
}

export interface CouponDiscount {
  code: string;
  amount: number;
  percentage?: number;
  description: string;
}

export interface CheckoutFormState {
  shippingAddress: ShippingAddress;
  invoiceType: InvoiceType;
  legalInvoice: LegalInvoiceData;
  deliveryMethodId: string;
  deliveryTimeSlot: string;
  paymentMethodId: string;
  selectedGatewayId: string;
  bankReceiptNumber?: string;
  couponCode: string;
  appliedCoupon: CouponDiscount | null;
}

export interface OrderFinancialSummary {
  subtotal: number;
  discountTotal: number;
  couponDiscount: number;
  shippingCost: number;
  vatTax: number;
  payableTotal: number;
  isFreeShipping: boolean;
}

export interface PlacedOrderDetails {
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  invoiceType: InvoiceType;
  legalInvoice?: LegalInvoiceData;
  deliveryMethod: DeliveryMethod;
  deliveryTimeSlot: string;
  paymentMethod: PaymentMethod;
  financialSummary: OrderFinancialSummary;
  paymentStatus: "completed" | "pending_transfer" | "credit_approved" | "pending_cheque";
}

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    selectedOptions?: Record<string, string>;
  }[];
  shippingAddress: ShippingAddress;
  invoiceType: InvoiceType;
  legalInvoice?: LegalInvoiceData;
  deliveryMethodId: string;
  deliveryTimeSlot: string;
  paymentMethodId: string;
  selectedGatewayId?: string;
  couponCode?: string;
}
