import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Unique email address of the user',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email cannot be empty' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 2,
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the user (alias for name)',
  })
  @IsOptional()
  @IsString({ message: 'fullName must be a string' })
  fullName?: string;

  @ApiPropertyOptional({
    example: '09123456789',
    description: 'Mobile phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'customer',
    description: 'Role assigned to user',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Initial status of user',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: '0079823401',
    description: 'Iranian national ID code',
  })
  @IsOptional()
  @IsString()
  nationalCode?: string;

  @ApiPropertyOptional({
    example: 'شرکت فناوران',
    description: 'Organization or company name',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    example: 'توضیحات و یادداشت ادمین',
    description: 'Internal admin notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
