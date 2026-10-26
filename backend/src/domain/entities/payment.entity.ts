export const PaymentType = {
  ORDER: 'ORDER',
  WALLET: 'WALLET',
  INVOICE: 'INVOICE',
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface PaymentTransactionProps {
  id: string;
  userId?: string | null;
  type: PaymentType;
  targetId: string;
  amount: number;
  currency?: string;
  gateway?: string;
  status?: PaymentStatus;
  authority: string;
  refId?: string | null;
  cardPan?: string | null;
  cardHash?: string | null;
  trackingCode: string;
  description?: string | null;
  callbackUrl?: string | null;
  errorMessage?: string | null;
  verifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PaymentTransactionEntity {
  public readonly id: string;
  public readonly userId: string | null;
  public readonly type: PaymentType;
  public readonly targetId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly gateway: string;
  private _status: PaymentStatus;
  private _authority: string;
  private _refId: string | null;
  private _cardPan: string | null;
  private _cardHash: string | null;
  public readonly trackingCode: string;
  public readonly description: string | null;
  public readonly callbackUrl: string | null;
  private _errorMessage: string | null;
  private _verifiedAt: Date | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PaymentTransactionProps) {
    this.id = props.id;
    this.userId = props.userId ?? null;
    this.type = props.type;
    this.targetId = props.targetId;
    this.amount = props.amount;
    this.currency = props.currency ?? 'IRT';
    this.gateway = props.gateway ?? 'ZARINPAL_SANDBOX';
    this._status = props.status ?? PaymentStatus.PENDING;
    this._authority = props.authority;
    this._refId = props.refId ?? null;
    this._cardPan = props.cardPan ?? null;
    this._cardHash = props.cardHash ?? null;
    this.trackingCode = props.trackingCode;
    this.description = props.description ?? null;
    this.callbackUrl = props.callbackUrl ?? null;
    this._errorMessage = props.errorMessage ?? null;
    this._verifiedAt = props.verifiedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get authority(): string {
    return this._authority;
  }

  get refId(): string | null {
    return this._refId;
  }

  get cardPan(): string | null {
    return this._cardPan;
  }

  get cardHash(): string | null {
    return this._cardHash;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  get verifiedAt(): Date | null {
    return this._verifiedAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public markAsSuccessful(refId: string, cardPan?: string | null, cardHash?: string | null): void {
    this._status = PaymentStatus.SUCCESS;
    this._refId = refId;
    if (cardPan) this._cardPan = cardPan;
    if (cardHash) this._cardHash = cardHash;
    this._verifiedAt = new Date();
    this._errorMessage = null;
    this._updatedAt = new Date();
  }

  public markAsFailed(errorMessage: string): void {
    this._status = PaymentStatus.FAILED;
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();
  }

  public markAsCancelled(): void {
    this._status = PaymentStatus.CANCELLED;
    this._errorMessage = 'تراکنش توسط کاربر لغو شد.';
    this._updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      targetId: this.targetId,
      amount: this.amount,
      currency: this.currency,
      gateway: this.gateway,
      status: this._status,
      authority: this._authority,
      refId: this._refId,
      cardPan: this._cardPan,
      cardHash: this._cardHash,
      trackingCode: this.trackingCode,
      description: this.description,
      callbackUrl: this.callbackUrl,
      errorMessage: this._errorMessage,
      verifiedAt: this._verifiedAt ? this._verifiedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
