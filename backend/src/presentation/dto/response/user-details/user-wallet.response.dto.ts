import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  UserWalletDetails,
  UserWalletTransaction,
  UserWalletWithdrawal,
} from '../../../../domain/entities/user-detail.types.js';

export class UserWalletTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  typeLabel: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceBefore: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  trackingCode: string;

  @ApiPropertyOptional()
  referenceType?: string;

  @ApiPropertyOptional()
  referenceId?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: string;

  static fromDomain(tx: UserWalletTransaction): UserWalletTransactionResponseDto {
    return {
      id: tx.id,
      type: tx.type,
      typeLabel: tx.typeLabel,
      amount: tx.amount,
      balanceBefore: tx.balanceBefore,
      balanceAfter: tx.balanceAfter,
      trackingCode: tx.trackingCode,
      referenceType: tx.referenceType,
      referenceId: tx.referenceId,
      description: tx.description,
      createdAt:
        tx.createdAt instanceof Date
          ? tx.createdAt.toISOString()
          : tx.createdAt
          ? new Date(tx.createdAt).toISOString()
          : new Date().toISOString(),
    };
  }
}

export class UserWalletWithdrawalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  statusLabel: string;

  @ApiPropertyOptional()
  bankAccountTitle?: string;

  @ApiPropertyOptional()
  shabaNumber?: string;

  @ApiPropertyOptional()
  cardNumber?: string;

  @ApiPropertyOptional()
  accountHolder?: string;

  @ApiPropertyOptional()
  trackingCode?: string;

  @ApiPropertyOptional()
  payoutReference?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  requestedAt: string;

  @ApiPropertyOptional()
  processedAt?: string;

  static fromDomain(w: UserWalletWithdrawal): UserWalletWithdrawalResponseDto {
    return {
      id: w.id,
      amount: w.amount,
      status: w.status,
      statusLabel: w.statusLabel,
      bankAccountTitle: w.bankAccountTitle,
      shabaNumber: w.shabaNumber,
      cardNumber: w.cardNumber,
      accountHolder: w.accountHolder,
      trackingCode: w.trackingCode,
      payoutReference: w.payoutReference,
      requestedAt:
        w.requestedAt instanceof Date
          ? w.requestedAt.toISOString()
          : w.requestedAt
          ? new Date(w.requestedAt).toISOString()
          : new Date().toISOString(),
      processedAt:
        w.processedAt instanceof Date
          ? w.processedAt.toISOString()
          : w.processedAt
          ? new Date(w.processedAt).toISOString()
          : undefined,
    };
  }
}

export class UserWalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  lockedBalance: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [UserWalletTransactionResponseDto] })
  transactions: UserWalletTransactionResponseDto[];

  @ApiProperty({ type: [UserWalletWithdrawalResponseDto] })
  withdrawals: UserWalletWithdrawalResponseDto[];

  static fromDomain(wallet: UserWalletDetails | null): UserWalletResponseDto | null {
    if (!wallet) return null;
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      lockedBalance: wallet.lockedBalance,
      currency: wallet.currency,
      isActive: wallet.isActive,
      transactions: (wallet.transactions || []).map(UserWalletTransactionResponseDto.fromDomain),
      withdrawals: (wallet.withdrawals || []).map(UserWalletWithdrawalResponseDto.fromDomain),
    };
  }
}
