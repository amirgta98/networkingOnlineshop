import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserSessionDetails } from '../../../../domain/entities/user-detail.types.js';

export class UserSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional()
  deviceName?: string;

  @ApiPropertyOptional()
  browser?: string;

  @ApiPropertyOptional()
  os?: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  isCurrent?: boolean;

  @ApiProperty()
  isRevoked: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  lastActiveAt: string;

  @ApiProperty()
  expiresAt: string;

  static fromDomain(session: UserSessionDetails): UserSessionResponseDto {
    return {
      id: session.id,
      userId: session.userId,
      deviceName: session.deviceName,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      isCurrent: session.isCurrent,
      isRevoked: session.isRevoked,
      createdAt: session.createdAt ? new Date(session.createdAt).toLocaleDateString('fa-IR') : 'نامشخص',
      lastActiveAt: session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString('fa-IR') : 'نامشخص',
      expiresAt: session.expiresAt ? new Date(session.expiresAt).toLocaleDateString('fa-IR') : 'نامشخص',
    };
  }
}
