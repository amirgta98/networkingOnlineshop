export interface CreateOrderItemInput {
  productId?: string;
  sku?: string;
  quantity: number;
  unitPrice?: number;
}

export interface ShippingAddressInput {
  recipientName: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  buildingNumber?: string;
  unit?: string;
  deliveryNotes?: string;
}

export interface LegalInvoiceInput {
  companyName: string;
  nationalId?: string;
  economicCode?: string;
  registrationNumber?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  phoneNumber?: string;
}

export interface CreateOrderCommand {
  userId: string;
  items: CreateOrderItemInput[];
  shippingAddress: ShippingAddressInput;
  invoiceType?: 'personal' | 'legal' | string;
  legalInvoice?: LegalInvoiceInput;
  deliveryMethodId?: string;
  deliveryDate?: string;
  deliveryDateJalali?: string;
  deliveryTimeSlot?: string;
  specialDeliveryNotes?: string;
  liftRequired?: boolean;
  paymentMethodId?: string;
  selectedGatewayId?: string;
  couponCode?: string;
}

export interface OrderFinancialSummaryDto {
  subtotal: number;
  discountTotal: number;
  couponDiscount: number;
  shippingCost: number;
  vatTax: number;
  payableTotal: number;
  isFreeShipping: boolean;
}

export interface PlacedOrderOutputDto {
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  createdAt: string;
  status: string;
  statusLabel: string;
  items: Array<{
    productId?: string;
    sku: string;
    title: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
  shippingAddress: ShippingAddressInput;
  financialSummary: OrderFinancialSummaryDto;
  paymentMethod: {
    id: string;
    type: string;
    title: string;
  };
  paymentStatus: string;
}
