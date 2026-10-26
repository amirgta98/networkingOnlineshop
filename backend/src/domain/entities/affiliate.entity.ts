export interface AffiliateSettingsProps {
  id?: string;
  defaultDiscountPercent: number; // default: 8
  defaultStaticIpCommission: number; // default: 150000
  defaultInternetCommission: number; // default: 400000
  isAffiliateSystemEnabled: boolean; // default: true
  isProductDiscountEnabled: boolean; // default: true
  isStaticIpCommissionEnabled: boolean; // default: true
  isInternetCommissionEnabled: boolean; // default: true
  eligibleProductIds?: string[];
  eligibleCategoryIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class AffiliateSettingsEntity {
  constructor(public readonly props: AffiliateSettingsProps) {}

  get id(): string | undefined {
    return this.props.id;
  }
  get defaultDiscountPercent(): number {
    return this.props.defaultDiscountPercent;
  }
  get defaultStaticIpCommission(): number {
    return this.props.defaultStaticIpCommission;
  }
  get defaultInternetCommission(): number {
    return this.props.defaultInternetCommission;
  }
  get isAffiliateSystemEnabled(): boolean {
    return this.props.isAffiliateSystemEnabled;
  }
  get isProductDiscountEnabled(): boolean {
    return this.props.isProductDiscountEnabled;
  }
  get isStaticIpCommissionEnabled(): boolean {
    return this.props.isStaticIpCommissionEnabled;
  }
  get isInternetCommissionEnabled(): boolean {
    return this.props.isInternetCommissionEnabled;
  }
  get eligibleProductIds(): string[] {
    return this.props.eligibleProductIds || [];
  }
  get eligibleCategoryIds(): string[] {
    return this.props.eligibleCategoryIds || [];
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  toJSON(): AffiliateSettingsProps {
    return { ...this.props };
  }
}

export type AffiliatePartnerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';

export interface AffiliatePartnerUserProps {
  name: string;
  phone: string;
  email?: string | null;
}

export interface AffiliatePartnerProps {
  id: string;
  userId: string;
  partnerCode: string;
  status: AffiliatePartnerStatus;
  customDiscountPercent?: number | null;
  customStaticIpCommission?: number | null;
  customInternetCommission?: number | null;
  isDiscountEnabled: boolean;
  isCommissionEnabled: boolean;
  totalSales: number;
  totalOrders: number;
  totalCommission: number;
  paidCommission: number;
  approvedCommission: number;
  notes?: string | null;
  joinedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  user?: AffiliatePartnerUserProps;
}

export class AffiliatePartnerEntity {
  constructor(private props: AffiliatePartnerProps) {}

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get partnerCode(): string {
    return this.props.partnerCode;
  }
  get status(): AffiliatePartnerStatus {
    return this.props.status;
  }
  get customDiscountPercent(): number | null | undefined {
    return this.props.customDiscountPercent;
  }
  get customStaticIpCommission(): number | null | undefined {
    return this.props.customStaticIpCommission;
  }
  get customInternetCommission(): number | null | undefined {
    return this.props.customInternetCommission;
  }
  get isDiscountEnabled(): boolean {
    return this.props.isDiscountEnabled;
  }
  get isCommissionEnabled(): boolean {
    return this.props.isCommissionEnabled;
  }
  get totalSales(): number {
    return this.props.totalSales;
  }
  get totalOrders(): number {
    return this.props.totalOrders;
  }
  get totalCommission(): number {
    return this.props.totalCommission;
  }
  get paidCommission(): number {
    return this.props.paidCommission;
  }
  get approvedCommission(): number {
    return this.props.approvedCommission;
  }
  get pendingCommission(): number {
    return Math.max(0, this.props.totalCommission - this.props.paidCommission);
  }
  get notes(): string | null | undefined {
    return this.props.notes;
  }
  get joinedAt(): Date {
    return this.props.joinedAt;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
  get user(): AffiliatePartnerUserProps | undefined {
    return this.props.user;
  }

  getEffectiveDiscountPercent(defaultPercent: number): number {
    if (this.props.customDiscountPercent !== undefined && this.props.customDiscountPercent !== null) {
      return this.props.customDiscountPercent;
    }
    return defaultPercent;
  }

  getEffectiveStaticIpCommission(defaultCommission: number): number {
    if (this.props.customStaticIpCommission !== undefined && this.props.customStaticIpCommission !== null) {
      return this.props.customStaticIpCommission;
    }
    return defaultCommission;
  }

  getEffectiveInternetCommission(defaultCommission: number): number {
    if (this.props.customInternetCommission !== undefined && this.props.customInternetCommission !== null) {
      return this.props.customInternetCommission;
    }
    return defaultCommission;
  }

  updateDetails(updates: Partial<AffiliatePartnerProps>): void {
    this.props = {
      ...this.props,
      ...updates,
      id: this.props.id,
      userId: this.props.userId,
      partnerCode: this.props.partnerCode,
      updatedAt: new Date(),
    };
  }

  resetCustomDefaults(): void {
    this.props = {
      ...this.props,
      customDiscountPercent: null,
      customStaticIpCommission: null,
      customInternetCommission: null,
      updatedAt: new Date(),
    };
  }

  toJSON(): AffiliatePartnerProps & { pendingCommission: number } {
    return {
      ...this.props,
      pendingCommission: this.pendingCommission,
    };
  }
}

export type AffiliateCommissionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'READY_FOR_PAYMENT'
  | 'PAID'
  | 'CANCELLED';

export interface AffiliateCommissionProps {
  id: string;
  partnerId: string;
  orderId: string;
  orderNumber: string;
  productType: 'STATIC_IP' | 'INTERNET' | string;
  productTitle: string;
  quantity: number;
  unitCommission: number;
  totalCommission: number;
  status: AffiliateCommissionStatus;
  notes?: string | null;
  partnerName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class AffiliateCommissionEntity {
  constructor(private props: AffiliateCommissionProps) {}

  get id(): string {
    return this.props.id;
  }
  get partnerId(): string {
    return this.props.partnerId;
  }
  get orderId(): string {
    return this.props.orderId;
  }
  get orderNumber(): string {
    return this.props.orderNumber;
  }
  get productType(): string {
    return this.props.productType;
  }
  get productTitle(): string {
    return this.props.productTitle;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unitCommission(): number {
    return this.props.unitCommission;
  }
  get totalCommission(): number {
    return this.props.totalCommission;
  }
  get status(): AffiliateCommissionStatus {
    return this.props.status;
  }
  get notes(): string | null | undefined {
    return this.props.notes;
  }
  get partnerName(): string | undefined {
    return this.props.partnerName;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  updateStatus(status: AffiliateCommissionStatus, notes?: string): void {
    this.props.status = status;
    if (notes) this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  toJSON(): AffiliateCommissionProps {
    return { ...this.props };
  }
}

export interface AffiliatePayoutProps {
  id: string;
  partnerId: string;
  amount: number;
  trackingCode: string;
  paymentMethod: string;
  description?: string | null;
  status: string;
  paidAt: Date;
  createdAt?: Date;
  partnerName?: string;
}

export class AffiliatePayoutEntity {
  constructor(private props: AffiliatePayoutProps) {}

  get id(): string {
    return this.props.id;
  }
  get partnerId(): string {
    return this.props.partnerId;
  }
  get amount(): number {
    return this.props.amount;
  }
  get trackingCode(): string {
    return this.props.trackingCode;
  }
  get paymentMethod(): string {
    return this.props.paymentMethod;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get status(): string {
    return this.props.status;
  }
  get paidAt(): Date {
    return this.props.paidAt;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get partnerName(): string | undefined {
    return this.props.partnerName;
  }

  toJSON(): AffiliatePayoutProps {
    return { ...this.props };
  }
}
