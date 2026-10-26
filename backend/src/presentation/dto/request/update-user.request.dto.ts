import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserRoleRequestDto {
  @ApiProperty({
    example: 'partner_b2b',
    description: 'User access role',
    enum: ['admin', 'sales_manager', 'partner_b2b', 'customer', 'partner'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'sales_manager', 'partner_b2b', 'customer', 'partner', 'super_admin', 'staff_manager'], {
    message: 'role must be one of: admin, sales_manager, partner_b2b, customer, partner',
  })
  role: string;
}

export class UpdateUserStatusRequestDto {
  @ApiProperty({
    example: 'suspended',
    description: 'User account status',
    enum: ['active', 'suspended', 'pending_verification'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'suspended', 'pending_verification'], {
    message: 'status must be one of: active, suspended, pending_verification',
  })
  status: string;
}

export class UpdateUserRequestDto {
  @ApiPropertyOptional({ example: 'رضا محمدی' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'رضا محمدی' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'reza@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '09121112233' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'partner_b2b' })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'sales_manager', 'partner_b2b', 'customer', 'partner', 'super_admin', 'staff_manager'], {
    message: 'role must be one of: admin, sales_manager, partner_b2b, customer, partner',
  })
  role?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'suspended', 'pending_verification'], {
    message: 'status must be one of: active, suspended, pending_verification',
  })
  status?: string;

  @ApiPropertyOptional({ example: '۰۰۷۸۹۲۳۴۱۱' })
  @IsOptional()
  @IsString()
  nationalCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  nationalCodeVerified?: boolean;

  @ApiPropertyOptional({ example: 'شرکت فناوران شبکه' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'gold', enum: ['gold', 'silver', 'bronze'] })
  @IsOptional()
  @IsString()
  userTier?: 'gold' | 'silver' | 'bronze';

  @ApiPropertyOptional({ example: 'توضیحات و یادداشت ادمین' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true, description: 'دسترسی خرید بسته های اینترنت' })
  @IsOptional()
  @IsBoolean()
  canBuyInternet?: boolean;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @IsNumber()
  walletBalance?: number;

  @ApiPropertyOptional({ example: 50000000 })
  @IsOptional()
  @IsNumber()
  totalSpent?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  ordersCount?: number;
}
