export type AddressType =
  | 'CENTRAL_OFFICE'
  | 'CENTRAL_WAREHOUSE'
  | 'NETWORK_PROJECT_SITE'
  | 'PERSONAL_RESIDENCE';

export interface UserAddressProps {
  id: string;
  userId: string;
  title: string;
  type?: AddressType | string;
  recipientFirstName: string;
  recipientLastName: string;
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
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserAddressEntity {
  public readonly id: string;
  public readonly userId: string;
  public title: string;
  public type: AddressType;
  public recipientFirstName: string;
  public recipientLastName: string;
  public recipientMobile: string;
  public province: string;
  public city: string;
  public detailedAddress: string;
  public plaque: string;
  public unit?: string | null;
  public postalCode: string;
  public latitude?: number | null;
  public longitude?: number | null;
  public deliveryNotes?: string | null;
  public isDefault: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserAddressProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.type = UserAddressEntity.normalizeType(props.type);
    this.recipientFirstName = props.recipientFirstName;
    this.recipientLastName = props.recipientLastName;
    this.recipientMobile = props.recipientMobile;
    this.province = props.province;
    this.city = props.city;
    this.detailedAddress = props.detailedAddress;
    this.plaque = props.plaque;
    this.unit = props.unit ?? null;
    this.postalCode = props.postalCode;
    this.latitude = props.latitude ?? null;
    this.longitude = props.longitude ?? null;
    this.deliveryNotes = props.deliveryNotes ?? null;
    this.isDefault = Boolean(props.isDefault);
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public get recipientFullName(): string {
    return `${this.recipientFirstName} ${this.recipientLastName}`.trim();
  }

  public get tag(): 'central_office' | 'warehouse' | 'project_site' | 'residence' {
    switch (this.type) {
      case 'CENTRAL_OFFICE':
        return 'central_office';
      case 'CENTRAL_WAREHOUSE':
        return 'warehouse';
      case 'NETWORK_PROJECT_SITE':
        return 'project_site';
      case 'PERSONAL_RESIDENCE':
      default:
        return 'residence';
    }
  }

  public get tagLabel(): string {
    switch (this.type) {
      case 'CENTRAL_OFFICE':
        return 'دفتر مرکزی';
      case 'CENTRAL_WAREHOUSE':
        return 'انبار مرکزی';
      case 'NETWORK_PROJECT_SITE':
        return 'سایت پروژه';
      case 'PERSONAL_RESIDENCE':
      default:
        return 'سکونت';
    }
  }

  public setDefault(isDefault: boolean): void {
    this.isDefault = isDefault;
    this.updatedAt = new Date();
  }

  public static normalizeType(type?: string): AddressType {
    if (!type) return 'CENTRAL_OFFICE';
    const trimmed = type.trim();
    const upper = trimmed.toUpperCase().replace(/[-\s]/g, '_');
    if (upper === 'CENTRAL_OFFICE' || upper === 'OFFICE' || trimmed.includes('دفتر')) return 'CENTRAL_OFFICE';
    if (upper === 'CENTRAL_WAREHOUSE' || upper === 'WAREHOUSE' || trimmed.includes('انبار')) return 'CENTRAL_WAREHOUSE';
    if (upper === 'NETWORK_PROJECT_SITE' || upper === 'PROJECT_SITE' || upper === 'PROJECT' || trimmed.includes('پروژه')) return 'NETWORK_PROJECT_SITE';
    if (
      upper === 'PERSONAL_RESIDENCE' ||
      upper === 'RESIDENCE' ||
      upper === 'HOME' ||
      upper === 'PERSONAL' ||
      upper === 'RESIDENTIAL' ||
      trimmed.includes('سکونت') ||
      trimmed.includes('منزل') ||
      trimmed.includes('خانه')
    ) {
      return 'PERSONAL_RESIDENCE';
    }
    return 'CENTRAL_OFFICE';
  }
}
