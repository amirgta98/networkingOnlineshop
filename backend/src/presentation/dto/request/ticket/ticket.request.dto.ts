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
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({ enum: TicketDepartmentDto })
  @IsEnum(TicketDepartmentDto)
  department!: TicketDepartmentDto;

  @ApiProperty({ enum: TicketPriorityDto })
  @IsEnum(TicketPriorityDto)
  priority!: TicketPriorityDto;

  @ApiProperty({ example: 'متن اولیه تیکت...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  initialMessage!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientMessageId?: string;
}

export class SendMessageRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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
  @IsEnum(TicketStatusDto)
  status!: TicketStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTicketPriorityRequestDto {
  @ApiProperty({ enum: TicketPriorityDto })
  @IsEnum(TicketPriorityDto)
  priority!: TicketPriorityDto;
}

export class UpdateTicketDepartmentRequestDto {
  @ApiProperty({ enum: TicketDepartmentDto })
  @IsEnum(TicketDepartmentDto)
  department!: TicketDepartmentDto;
}
