export interface CreateAddressCommand {
  title: string;
  type?: string;
  tag?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientName?: string;
  recipientMobile?: string;
  phoneNumber?: string;
  province: string;
  city: string;
  detailedAddress?: string;
  fullAddress?: string;
  address?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string | null;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryNotes?: string | null;
  isDefault?: boolean;
}

export interface UpdateAddressCommand {
  title?: string;
  type?: string;
  tag?: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientName?: string;
  recipientMobile?: string;
  phoneNumber?: string;
  province?: string;
  city?: string;
  detailedAddress?: string;
  fullAddress?: string;
  address?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string | null;
  postalCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  deliveryNotes?: string | null;
  isDefault?: boolean;
}
