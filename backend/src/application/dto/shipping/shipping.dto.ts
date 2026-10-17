import {
  ShippingIconType,
  ProvinceShippingRule,
} from '../../../domain/entities/shipping-method.entity.js';

export interface CreateShippingMethodCommand {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  cost: number;
  freeThreshold?: number | null;
  estimatedDeliveryTime: string;
  iconName: ShippingIconType;
  iconUrl?: string | null;
  isExpress?: boolean;
  isActive?: boolean;
  minOrderAmount?: number;
  maxWeightKg?: number | null;
  allowedProvinces?: string[];
  provinceRules?: ProvinceShippingRule[];
  displayOrder?: number;
}

export interface UpdateShippingMethodCommand {
  title?: string;
  subtitle?: string;
  description?: string;
  cost?: number;
  freeThreshold?: number | null;
  estimatedDeliveryTime?: string;
  iconName?: ShippingIconType;
  iconUrl?: string | null;
  isExpress?: boolean;
  isActive?: boolean;
  minOrderAmount?: number;
  maxWeightKg?: number | null;
  allowedProvinces?: string[];
  provinceRules?: ProvinceShippingRule[];
  displayOrder?: number;
}

export interface CreateTimeSlotCommand {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  maxCapacity?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateTimeSlotCommand {
  title?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  maxCapacity?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateShippingConfigCommand {
  sameDayCutoffHour?: number;
  leadTimeDays?: number;
  workingDays?: number[];
  daysInAdvance?: number;
  holidayDates?: string[];
}

export interface CalculateShippingQuery {
  methodId: string;
  subtotal: number;
  province?: string;
}

export interface CalculateShippingResult {
  methodId: string;
  cost: number;
  isFree: boolean;
  freeThreshold: number | null;
  amountNeededForFree: number;
  estimatedDeliveryTime?: string;
  province?: string;
  isProvinceCustomized?: boolean;
}
