import { ApiProperty } from '@nestjs/swagger';
import { UserOutputDto } from '../../../application/dto/user/user-output.dto.js';

export class UserResponseDto implements UserOutputDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  name: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the user account is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2026-10-04T12:00:00.000Z',
    description: 'Creation timestamp in ISO-8601 format',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-10-04T12:00:00.000Z',
    description: 'Last update timestamp in ISO-8601 format',
  })
  updatedAt: string;
}
