import { ShippingMethod } from '../entities/shipping-method.entity.js';
import { DeliveryTimeSlot } from '../entities/delivery-time-slot.entity.js';
import { ShippingScheduleConfig } from '../entities/shipping-config.entity.js';

export interface DeliveryScheduleDay {
  date: string;         // ISO YYYY-MM-DD
  jalaliDate: string;   // e.g. "شنبه ۲۶ مهر"
  dayName: string;      // e.g. "شنبه"
  isToday: boolean;
  isTomorrow: boolean;
  slots: DeliveryTimeSlot[];
}

export interface IShippingRepository {
  // Shipping Methods
  findAllMethods(includeInactive?: boolean): Promise<ShippingMethod[]>;
  findMethodById(id: string): Promise<ShippingMethod | null>;
  createMethod(data: Partial<ShippingMethod>): Promise<ShippingMethod>;
  updateMethod(id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod>;
  deleteMethod(id: string): Promise<boolean>;
  toggleMethod(id: string): Promise<ShippingMethod>;

  // Time Slots
  findAllTimeSlots(includeInactive?: boolean): Promise<DeliveryTimeSlot[]>;
  findTimeSlotById(id: string): Promise<DeliveryTimeSlot | null>;
  createTimeSlot(data: Partial<DeliveryTimeSlot>): Promise<DeliveryTimeSlot>;
  updateTimeSlot(id: string, data: Partial<DeliveryTimeSlot>): Promise<DeliveryTimeSlot>;
  deleteTimeSlot(id: string): Promise<boolean>;

  // Configuration & Dynamic Schedule
  getConfig(): Promise<ShippingScheduleConfig>;
  updateConfig(data: Partial<ShippingScheduleConfig>): Promise<ShippingScheduleConfig>;
  getSchedule(province?: string): Promise<DeliveryScheduleDay[]>;
}
