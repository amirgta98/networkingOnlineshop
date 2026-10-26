import { UserAddressEntity } from './user-address.entity.js';

export interface UserCartItem {
  id: string;
  productId: string;
  title: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
  inStock: boolean;
}

export interface UserCartDetails {
  id: string;
  userId: string;
  totalItems: number;
  totalAmount: number;
  updatedAt: Date;
  items: UserCartItem[];
}

export interface UserOrderItem {
  id: string;
  productId?: string;
  title: string;
  sku: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  warranty?: string;
  serialNumbers?: string[];
}

export interface UserOrderDetails {
  id: string;
  orderNumber: string;
  trackingCode: string;
  userId: string;
  status: 'pending_financial' | 'processing_warehouse' | 'shipping' | 'delivered' | 'cancelled';
  statusLabel: string;
  customerType: 'b2b' | 'retail';
  customerName: string;
  phoneNumber: string;
  companyName?: string;
  totalAmount: number;
  discountAmount: number;
  vatTaxAmount: number;
  payableAmount: number;
  paymentMethod: string;
  shippingCarrier?: string;
  shippingCost: number;
  deliveryNotes?: string;
  createdAt: Date;
  items: UserOrderItem[];
}

export interface UserWalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'WITHDRAWAL' | 'CASHBACK' | 'ADJUSTMENT';
  typeLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  trackingCode: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: Date;
}

export interface UserWalletWithdrawal {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  statusLabel: string;
  bankAccountTitle?: string;
  shabaNumber?: string;
  cardNumber?: string;
  accountHolder?: string;
  trackingCode?: string;
  payoutReference?: string;
  rejectionReason?: string;
  requestedAt: Date;
  processedAt?: Date;
}

export interface UserWalletDetails {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  currency: string;
  isActive: boolean;
  transactions: UserWalletTransaction[];
  withdrawals: UserWalletWithdrawal[];
}

export interface UserFavoriteDetails {
  id: string;
  productId: string;
  title: string;
  slug: string;
  sku?: string;
  brand?: string;
  category?: string;
  basePrice: number;
  originalPrice?: number;
  discountPercent?: number;
  ratingAvg: number;
  inStock: boolean;
  imageUrl?: string;
  images?: string[];
  addedAt: Date;
}

export interface UserRfqItem {
  id: string;
  sku: string;
  title: string;
  brand?: string;
  category?: string;
  requestedQty: number;
  unitPrice: number;
  stockStatus: string;
  suggestedAlternative?: string;
  specsSummary?: string;
}

export interface UserRfqDetails {
  id: string;
  rfqNumber: string;
  userId: string;
  projectTitle: string;
  companyName?: string;
  clientPhone: string;
  clientEmail?: string;
  status: 'pending_quote' | 'quoted' | 'expired' | 'converted';
  statusLabel: string;
  urgent: boolean;
  deadlineHours: number;
  discountPercent: number;
  validityDays: number;
  estimatedValue: number;
  finalQuotedAmount?: number;
  quotationIssuedAt?: Date;
  projectLocation?: string;
  notes?: string;
  createdAt: Date;
  items: UserRfqItem[];
}

export interface UserAuthenticityDetails {
  id: string;
  userId?: string;
  serialNumber: string;
  hologramCode?: string;
  productName: string;
  brand: string;
  model?: string;
  warrantyType: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'invalid';
  statusLabel: string;
  isAuthentic: boolean;
  startDate?: Date;
  endDate?: Date;
  daysRemaining: number;
  inquiryIp?: string;
  notes?: string;
  createdAt: Date;
}

export interface UserLoyaltyTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'REFUND' | 'EXPIRE' | 'ADJUSTMENT';
  typeLabel: string;
  points: number;
  pointsBefore: number;
  pointsAfter: number;
  referenceType?: string;
  description?: string;
  createdAt: Date;
}

export interface UserLoyaltyDetails {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tierCode: string;
  tierTitle: string;
  cashbackPercent: number;
  minPointsForNextTier?: number;
  transactions: UserLoyaltyTransaction[];
}

export interface UserSessionDetails {
  id: string;
  userId: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  isCurrent?: boolean;
  isRevoked: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}
