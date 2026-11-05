import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TicketDepartmentDto {
  CISCO_SWITCHING = 'CISCO_SWITCHING',
  FIBER_CABLING = 'FIBER_CABLING',
  BILLING_LEGAL = 'BILLING_LEGAL',
  WARRANTY_RMA = 'WARRANTY_RMA',
  GENERAL = 'GENERAL',
}

export enum TicketPriorityDto {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketStatusDto {
  OPEN = 'OPEN',
  ANSWERED = 'ANSWERED',
  WAITING_USER = 'WAITING_USER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class CreateTicketRequestDto {
  @ApiProperty({ example: 'مشکل در کانفیگ VLAN' })
  @IsString({ message: 'موضوع تیکت باید رشته متنی باشد.' })
  @IsNotEmpty({ message: 'موضوع تیکت الزامی است.' })
  @MaxLength(255, { message: 'موضوع تیکت نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد.' })
  subject!: string;

  @ApiProperty({ enum: TicketDepartmentDto })
  @IsEnum(TicketDepartmentDto, { message: 'دپارتمان انتخاب شده نامعتبر است.' })
  department!: TicketDepartmentDto;

  @ApiProperty({ enum: TicketPriorityDto })
  @IsEnum(TicketPriorityDto, { message: 'درجه فوریت نامعتبر است.' })
  priority!: TicketPriorityDto;

  @ApiProperty({ example: 'متن اولیه تیکت...' })
  @IsString({ message: 'متن پیام باید رشته متنی باشد.' })
  @IsNotEmpty({ message: 'متن پیام تیکت الزامی است.' })
  @MinLength(10, { message: 'متن پیام تیکت باید حداقل ۱۰ کاراکتر باشد.' })
  initialMessage!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'شناسه پیام کلاینت نامعتبر است.' })
  clientMessageId?: string;
}

export class SendMessageRequestDto {
  @ApiProperty()
  @IsString({ message: 'متن پیام باید رشته متنی باشد.' })
  @IsNotEmpty({ message: 'متن پیام الزامی است.' })
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'شناسه پیام کلاینت نامعتبر است.' })
  clientMessageId?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  attachments?: Array<{
    fileName: string;
    storageKey: string;
    mimeType: string;
    fileSize: number;
    url: string;
  }>;
}

export class UpdateTicketStatusRequestDto {
  @ApiProperty({ enum: TicketStatusDto })
  @IsEnum(TicketStatusDto, { message: 'وضعیت انتخاب شده نامعتبر است.' })
  status!: TicketStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'یادداشت باید رشته متنی باشد.' })
  note?: string;
}

export class UpdateTicketPriorityRequestDto {
  @ApiProperty({ enum: TicketPriorityDto })
  @IsEnum(TicketPriorityDto, { message: 'درجه فوریت نامعتبر است.' })
  priority!: TicketPriorityDto;
}

export class UpdateTicketDepartmentRequestDto {
  @ApiProperty({ enum: TicketDepartmentDto })
  @IsEnum(TicketDepartmentDto, { message: 'دپارتمان انتخاب شده نامعتبر است.' })
  department!: TicketDepartmentDto;
}
