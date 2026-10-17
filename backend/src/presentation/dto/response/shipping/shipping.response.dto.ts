import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ShippingMethod,
  ProvinceShippingRule,
} from '../../../../domain/entities/shipping-method.entity.js';
import { DeliveryTimeSlot } from '../../../../domain/entities/delivery-time-slot.entity.js';
import { ShippingScheduleConfig } from '../../../../domain/entities/shipping-config.entity.js';
import { DeliveryScheduleDay } from '../../../../domain/repositories/shipping.repository.interface.js';

export class ShippingMethodResponseDto {
  @ApiProperty({ example: 'express_courier' })
  id!: string;

  @ApiProperty({ example: 'پیک اختصاصی ققنوس آکادمی (تهران و حومه)' })
  title!: string;

  @ApiProperty({ example: 'ارسال سریع با بسته‌بندی ضدضربه قطعات حساس شبکه' })
  subtitle!: string;

  @ApiProperty({ example: 'تحویل در بازه زمانی انتخابی...' })
  description!: string;

  @ApiProperty({ example: 45000 })
  cost!: number;

  @ApiPropertyOptional({ example: 5000000 })
  freeThreshold!: number | null;

  @ApiProperty({ example: 'امروز یا ۲۴ ساعت کاری' })
  estimatedDeliveryTime!: string;

  @ApiProperty({ example: 'zap' })
  iconName!: string;

  @ApiPropertyOptional({ example: '/uploads/icons/icon-tipax.png' })
  iconUrl!: string | null;

  @ApiProperty({ example: true })
  isExpress!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  minOrderAmount!: number;

  @ApiPropertyOptional({ example: 30 })
  maxWeightKg!: number | null;

  @ApiProperty({ example: ['تهران', 'البرز'] })
  allowedProvinces!: string[];

  @ApiPropertyOptional({ description: 'قوانین اختصاصی استان‌ها' })
  provinceRules!: ProvinceShippingRule[];

  @ApiPropertyOptional({ example: 45000 })
  baseCost?: number;

  @ApiPropertyOptional({ example: 5000000 })
  baseFreeThreshold?: number | null;

  @ApiPropertyOptional({ example: 'امروز یا ۲۴ ساعت کاری' })
  baseEstimatedDeliveryTime?: string;

  @ApiPropertyOptional({ example: false })
  isProvinceCustomized?: boolean;

  @ApiProperty({ example: 1 })
  displayOrder!: number;

  static fromDomain(m: ShippingMethod, province?: string): ShippingMethodResponseDto {
    const dto = new ShippingMethodResponseDto();
    dto.id = m.id;
    dto.title = m.title;
    dto.subtitle = m.subtitle;
    dto.description = m.description;
    dto.baseCost = m.cost;
    dto.baseFreeThreshold = m.freeThreshold;
    dto.baseEstimatedDeliveryTime = m.estimatedDeliveryTime;

    const rule = m.findProvinceRule(province);
    dto.isProvinceCustomized = Boolean(rule);

    dto.cost = province ? m.getEffectiveCost(province) : m.cost;
    dto.freeThreshold = province ? m.getEffectiveFreeThreshold(province) : m.freeThreshold;
    dto.estimatedDeliveryTime = province ? m.getEffectiveDeliveryTime(province) : m.estimatedDeliveryTime;

    dto.iconName = m.iconName;
    dto.iconUrl = m.iconUrl ?? null;
    dto.isExpress = m.isExpress;
    dto.isActive = m.isActive;
    dto.minOrderAmount = m.minOrderAmount;
    dto.maxWeightKg = m.maxWeightKg;
    dto.allowedProvinces = m.allowedProvinces;
    dto.provinceRules = m.provinceRules || [];
    dto.displayOrder = m.displayOrder;
    return dto;
  }
}

export class DeliveryTimeSlotResponseDto {
  @ApiProperty({ example: 'morning' })
  id!: string;

  @ApiProperty({ example: 'صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)' })
  title!: string;

  @ApiProperty({ example: '09:00' })
  startTime!: string;

  @ApiProperty({ example: '13:00' })
  endTime!: string;

  @ApiProperty({ example: 'تحویل در ساعات اداری رسمی' })
  description!: string;

  @ApiProperty({ example: 40 })
  maxCapacity!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 1 })
  displayOrder!: number;

  static fromDomain(s: DeliveryTimeSlot): DeliveryTimeSlotResponseDto {
    const dto = new DeliveryTimeSlotResponseDto();
    dto.id = s.id;
    dto.title = s.title;
    dto.startTime = s.startTime;
    dto.endTime = s.endTime;
    dto.description = s.description;
    dto.maxCapacity = s.maxCapacity;
    dto.isActive = s.isActive;
    dto.displayOrder = s.displayOrder;
    return dto;
  }
}

export class DeliveryScheduleDayResponseDto {
  @ApiProperty({ example: '2026-10-18' })
  date!: string;

  @ApiProperty({ example: 'شنبه ۲۶ مهر' })
  jalaliDate!: string;

  @ApiProperty({ example: 'شنبه' })
  dayName!: string;

  @ApiProperty({ example: false })
  isToday!: boolean;

  @ApiProperty({ example: true })
  isTomorrow!: boolean;

  @ApiProperty({ type: [DeliveryTimeSlotResponseDto] })
  slots!: DeliveryTimeSlotResponseDto[];

  static fromDomain(day: DeliveryScheduleDay): DeliveryScheduleDayResponseDto {
    const dto = new DeliveryScheduleDayResponseDto();
    dto.date = day.date;
    dto.jalaliDate = day.jalaliDate;
    dto.dayName = day.dayName;
    dto.isToday = day.isToday;
    dto.isTomorrow = day.isTomorrow;
    dto.slots = day.slots.map(DeliveryTimeSlotResponseDto.fromDomain);
    return dto;
  }
}

export class ShippingConfigResponseDto {
  @ApiProperty({ example: 14 })
  sameDayCutoffHour!: number;

  @ApiProperty({ example: 0 })
  leadTimeDays!: number;

  @ApiProperty({ example: [0, 1, 2, 3, 4, 5] })
  workingDays!: number[];

  @ApiProperty({ example: 7 })
  daysInAdvance!: number;

  @ApiProperty({ example: [] })
  holidayDates!: string[];

  static fromDomain(cfg: ShippingScheduleConfig): ShippingConfigResponseDto {
    const dto = new ShippingConfigResponseDto();
    dto.sameDayCutoffHour = cfg.sameDayCutoffHour;
    dto.leadTimeDays = cfg.leadTimeDays;
    dto.workingDays = cfg.workingDays;
    dto.daysInAdvance = cfg.daysInAdvance;
    dto.holidayDates = cfg.holidayDates;
    return dto;
  }
}
