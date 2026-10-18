import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  UserLoyaltyDetails,
  UserLoyaltyTransaction,
} from '../../../../domain/entities/user-detail.types.js';

export class UserLoyaltyTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  typeLabel: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  pointsBefore: number;

  @ApiProperty()
  pointsAfter: number;

  @ApiPropertyOptional()
  referenceType?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: string;

  static fromDomain(tx: UserLoyaltyTransaction): UserLoyaltyTransactionResponseDto {
    return {
      id: tx.id,
      type: tx.type,
      typeLabel: tx.typeLabel,
      points: tx.points,
      pointsBefore: tx.pointsBefore,
      pointsAfter: tx.pointsAfter,
      referenceType: tx.referenceType,
      description: tx.description,
      createdAt: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fa-IR') : 'نامشخص',
    };
  }
}

export class UserLoyaltyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  pointsBalance: number;

  @ApiProperty()
  lifetimePoints: number;

  @ApiProperty()
  tierCode: string;

  @ApiProperty()
  tierTitle: string;

  @ApiProperty()
  cashbackPercent: number;

  @ApiPropertyOptional()
  minPointsForNextTier?: number;

  @ApiProperty({ type: [UserLoyaltyTransactionResponseDto] })
  transactions: UserLoyaltyTransactionResponseDto[];

  static fromDomain(loyalty: UserLoyaltyDetails | null): UserLoyaltyResponseDto | null {
    if (!loyalty) return null;
    return {
      id: loyalty.id,
      userId: loyalty.userId,
      pointsBalance: loyalty.pointsBalance,
      lifetimePoints: loyalty.lifetimePoints,
      tierCode: loyalty.tierCode,
      tierTitle: loyalty.tierTitle,
      cashbackPercent: loyalty.cashbackPercent,
      minPointsForNextTier: loyalty.minPointsForNextTier,
      transactions: (loyalty.transactions || []).map(UserLoyaltyTransactionResponseDto.fromDomain),
    };
  }
}
