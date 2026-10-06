import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}
