import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SyncCartItemDto {
  @ApiProperty({ description: 'شناسه محصول' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'تعداد در سبد خرید', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class SyncCartRequestDto {
  @ApiProperty({ type: [SyncCartItemDto], description: 'لیست اقلام سبد خرید' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items: SyncCartItemDto[];
}

export class AddCartItemRequestDto {
  @ApiProperty({ description: 'شناسه محصول' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'تعداد جهت افزودن', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemRequestDto {
  @ApiProperty({ description: 'تعداد جدید قلم کالا', default: 1 })
  @IsInt()
  @Min(0)
  quantity: number;
}
