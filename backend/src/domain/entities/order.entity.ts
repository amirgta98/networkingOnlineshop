export const OrderStatus = {
  PENDING_FINANCIAL: 'PENDING_FINANCIAL',
  PROCESSING_WAREHOUSE: 'PROCESSING_WAREHOUSE',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItemProps {
  id: string;
  orderId?: string;
  productId?: string | null;
  sku: string;
  title: string;
  brand?: string | null;
  model?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  warranty?: string | null;
  serialNumbers?: string[];
  createdAt?: Date;
}

export class OrderItemEntity {
  public readonly id: string;
  public readonly orderId?: string;
  public readonly productId?: string | null;
  public readonly sku: string;
  public readonly title: string;
  public readonly brand?: string | null;
  public readonly model?: string | null;
  public readonly unitPrice: number;
  public readonly quantity: number;
  public readonly totalPrice: number;
  public readonly warranty?: string | null;
  public readonly serialNumbers: string[];
  public readonly createdAt: Date;

  constructor(props: OrderItemProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId ?? null;
    this.sku = props.sku;
    this.title = props.title;
    this.brand = props.brand ?? null;
    this.model = props.model ?? null;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.totalPrice = props.totalPrice || props.unitPrice * props.quantity;
    this.warranty = props.warranty ?? null;
    this.serialNumbers = props.serialNumbers ? [...props.serialNumbers] : [];
    this.createdAt = props.createdAt ?? new Date();
  }
}

export interface OrderProps {
  id: string;
  orderNumber: string;
  trackingCode: string;
  userId: string;
  status: OrderStatus;
  customerType: 'retail' | 'b2b';
  customerName: string;
  companyName?: string | null;
  nationalCode?: string | null;
  phoneNumber: string;
  totalAmount: number;
  discountAmount: number;
  vatTaxAmount: number;
  payableAmount: number;
  paymentMethod: string;
  shippingCarrier?: string | null;
  shippingCost: number;
  deliveryNotes?: string | null;
  shippingAddress?: any;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemEntity[];
}

export class Order {
  private readonly _id: string;
  private readonly _orderNumber: string;
  private _trackingCode: string;
  private readonly _userId: string;
  private _status: OrderStatus;
  private _customerType: 'retail' | 'b2b';
  private _customerName: string;
  private _companyName: string | null;
  private _nationalCode: string | null;
  private _phoneNumber: string;
  private _totalAmount: number;
  private _discountAmount: number;
  private _vatTaxAmount: number;
  private _payableAmount: number;
  private _paymentMethod: string;
  private _shippingCarrier: string | null;
  private _shippingCost: number;
  private _deliveryNotes: string | null;
  private _shippingAddress: any;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _items: OrderItemEntity[];

  constructor(props: OrderProps) {
    this._id = props.id;
    this._orderNumber = props.orderNumber;
    this._trackingCode = props.trackingCode;
    this._userId = props.userId;
    this._status = props.status;
    this._customerType = props.customerType;
    this._customerName = props.customerName;
    this._companyName = props.companyName ?? null;
    this._nationalCode = props.nationalCode ?? null;
    this._phoneNumber = props.phoneNumber;
    this._totalAmount = props.totalAmount;
    this._discountAmount = props.discountAmount;
    this._vatTaxAmount = props.vatTaxAmount;
    this._payableAmount = props.payableAmount;
    this._paymentMethod = props.paymentMethod;
    this._shippingCarrier = props.shippingCarrier ?? null;
    this._shippingCost = props.shippingCost;
    this._deliveryNotes = props.deliveryNotes ?? null;
    this._shippingAddress = props.shippingAddress ?? null;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._items = props.items ? [...props.items] : [];
  }

  public get id(): string { return this._id; }
  public get orderNumber(): string { return this._orderNumber; }
  public get trackingCode(): string { return this._trackingCode; }
  public get userId(): string { return this._userId; }
  public get status(): OrderStatus { return this._status; }
  public get customerType(): 'retail' | 'b2b' { return this._customerType; }
  public get customerName(): string { return this._customerName; }
  public get companyName(): string | null { return this._companyName; }
  public get nationalCode(): string | null { return this._nationalCode; }
  public get phoneNumber(): string { return this._phoneNumber; }
  public get totalAmount(): number { return this._totalAmount; }
  public get discountAmount(): number { return this._discountAmount; }
  public get vatTaxAmount(): number { return this._vatTaxAmount; }
  public get payableAmount(): number { return this._payableAmount; }
  public get paymentMethod(): string { return this._paymentMethod; }
  public get shippingCarrier(): string | null { return this._shippingCarrier; }
  public get shippingCost(): number { return this._shippingCost; }
  public get deliveryNotes(): string | null { return this._deliveryNotes; }
  public get shippingAddress(): any { return this._shippingAddress; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }
  public get items(): OrderItemEntity[] { return [...this._items]; }

  public updateStatus(status: OrderStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  public assignCarrier(carrier: string, trackingCode?: string): void {
    this._shippingCarrier = carrier;
    if (trackingCode) {
      this._trackingCode = trackingCode;
    }
    this._status = 'SHIPPING';
    this._updatedAt = new Date();
  }

  public cancel(): void {
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
  }
}
