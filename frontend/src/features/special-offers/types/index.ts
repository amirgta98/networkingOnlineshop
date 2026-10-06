import { Product } from "@/features/catalog/types";

export interface SpecialOfferProduct extends Product {
  discountPercent: number;        // e.g. 25 (%)
  originalPrice: number;          // pre-discount price
  stockTotal: number;             // total quantity in special sale
  stockRemaining: number;         // current remaining quantity in special sale
  brand?: string;                 // brand name e.g. "Cisco", "MikroTik", "Ubiquiti"
  specs?: string[];               // key technical specs
  saleEndsAt?: string;            // ISO date string for when offer ends
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}
