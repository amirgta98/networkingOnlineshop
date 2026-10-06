export type AddressTag = "central_office" | "warehouse" | "project_site" | "residence";

export interface DashboardAddress {
  id: string;
  title: string;
  tag: AddressTag;
  tagLabel: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  fullAddress: string;
  buildingNumber: string;
  unit?: string;
  deliveryNotes?: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}
