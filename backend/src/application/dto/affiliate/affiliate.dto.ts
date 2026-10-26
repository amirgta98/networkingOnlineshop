import { IsNumber, IsBoolean, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import type { AffiliatePartnerStatus, AffiliateCommissionStatus } from '../../../domain/entities/affiliate.entity.js';

export class UpdateAffiliateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  defaultDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultStaticIpCommission?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultInternetCommission?: number;

  @IsOptional()
  @IsBoolean()
  isAffiliateSystemEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isProductDiscountEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isStaticIpCommissionEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isInternetCommissionEnabled?: boolean;

  @IsOptional()
  @IsArray()
  eligibleProductIds?: string[];

  @IsOptional()
  @IsArray()
  eligibleCategoryIds?: string[];
}

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  status?: AffiliatePartnerStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  customDiscountPercent?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  customStaticIpCommission?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  customInternetCommission?: number | null;

  @IsOptional()
  @IsBoolean()
  isDiscountEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isCommissionEnabled?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RegisterPartnerDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePayoutDto {
  @IsString()
  partnerId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  trackingCode?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCommissionStatusDto {
  @IsString()
  status: AffiliateCommissionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
