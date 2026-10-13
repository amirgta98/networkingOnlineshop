import { UserAddressEntity } from '../entities/user-address.entity.js';

export interface CreateUserAddressData {
  userId: string;
  title: string;
  type?: string;
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
}

export interface UpdateUserAddressData {
  title?: string;
  type?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientMobile?: string;
  province?: string;
  city?: string;
  detailedAddress?: string;
  plaque?: string;
  unit?: string | null;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryNotes?: string | null;
  isDefault?: boolean;
}

export interface IUserAddressRepository {
  findByUserId(userId: string): Promise<UserAddressEntity[]>;
  findById(id: string): Promise<UserAddressEntity | null>;
  create(data: CreateUserAddressData): Promise<UserAddressEntity>;
  update(id: string, data: UpdateUserAddressData): Promise<UserAddressEntity>;
  delete(id: string): Promise<boolean>;
  setDefault(userId: string, addressId: string): Promise<void>;
}
