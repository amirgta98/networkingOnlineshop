export type AdminUserRole = "admin" | "partner_b2b" | "customer";
export type AdminUserStatus = "active" | "suspended" | "pending_verification";

export interface AdminUserActivity {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device?: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  nationalCode: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  nationalCodeVerified: boolean;
  twoFactorActive: boolean;
  ordersCount: number;
  totalSpent: number;
  walletBalance: number;
  registeredAt: string;
  lastLogin: string;
  companyName?: string;
  userTier?: "gold" | "silver" | "bronze";
  notes?: string;
  activities: AdminUserActivity[];
}

export interface AdminUserAddress {
  id: string;
  title: string;
  tag?: string;
  tagLabel?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientFullName?: string;
  recipientMobile: string;
  province: string;
  city: string;
  detailedAddress: string;
  plaque: string;
  unit?: string | null;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryNotes?: string | null;
  isDefault: boolean;
}

export interface AdminUserCartItem {
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

export interface AdminUserCart {
  id: string;
  userId: string;
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
  items: AdminUserCartItem[];
}

export interface AdminUserOrderItem {
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

export interface AdminUserOrder {
  id: string;
  orderNumber: string;
  trackingCode: string;
  userId: string;
  status: string;
  statusLabel: string;
  customerType: string;
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
  createdAt: string;
  items: AdminUserOrderItem[];
}

export interface AdminUserInvoiceItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
}

export interface AdminUserInvoice {
  id: string;
  invoiceNumber: string;
  trackingCode: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  companyName?: string;
  createdAt: string;
  items: AdminUserInvoiceItem[];
}

export interface AdminUserWalletTransaction {
  id: string;
  type: string;
  typeLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  trackingCode: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface AdminUserWalletWithdrawal {
  id: string;
  amount: number;
  status: string;
  statusLabel: string;
  bankAccountTitle?: string;
  shabaNumber?: string;
  payoutReference?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface AdminUserWallet {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  currency: string;
  isActive: boolean;
  transactions: AdminUserWalletTransaction[];
  withdrawals: AdminUserWalletWithdrawal[];
}

export interface AdminUserFavorite {
  id: string;
  productId: string;
  title: string;
  slug: string;
  sku?: string;
  brand?: string;
  category?: string;
  basePrice: number;
  ratingAvg: number;
  inStock: boolean;
  imageUrl?: string;
  addedAt: string;
}

export interface AdminUserRfqItem {
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

export interface AdminUserRfq {
  id: string;
  rfqNumber: string;
  userId: string;
  projectTitle: string;
  companyName?: string;
  clientPhone: string;
  clientEmail?: string;
  status: string;
  statusLabel: string;
  urgent: boolean;
  deadlineHours: number;
  discountPercent: number;
  validityDays: number;
  estimatedValue: number;
  finalQuotedAmount?: number;
  quotationIssuedAt?: string;
  projectLocation?: string;
  notes?: string;
  createdAt: string;
  items: AdminUserRfqItem[];
}

export interface AdminUserAuthenticity {
  id: string;
  userId?: string;
  serialNumber: string;
  hologramCode?: string;
  productName: string;
  brand: string;
  model?: string;
  warrantyType: string;
  status: string;
  statusLabel: string;
  isAuthentic: boolean;
  startDate?: string;
  endDate?: string;
  daysRemaining: number;
  inquiryIp?: string;
  notes?: string;
  createdAt: string;
}

export interface AdminUserLoyaltyTransaction {
  id: string;
  type: string;
  typeLabel: string;
  points: number;
  pointsBefore: number;
  pointsAfter: number;
  referenceType?: string;
  description?: string;
  createdAt: string;
}

export interface AdminUserLoyalty {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tierCode: string;
  tierTitle: string;
  cashbackPercent: number;
  minPointsForNextTier?: number;
  transactions: AdminUserLoyaltyTransaction[];
}

export interface AdminUserSession {
  id: string;
  userId: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  isCurrent?: boolean;
  isRevoked: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}
