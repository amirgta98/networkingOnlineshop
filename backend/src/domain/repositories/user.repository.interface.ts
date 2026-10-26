import { User } from '../entities/user.entity.js';
import { UserAddressEntity } from '../entities/user-address.entity.js';
import {
  UserCartDetails,
  UserOrderDetails,
  UserWalletDetails,
  UserWalletWithdrawal,
  UserFavoriteDetails,
  UserRfqDetails,
  UserAuthenticityDetails,
  UserLoyaltyDetails,
  UserSessionDetails,
} from '../entities/user-detail.types.js';

export interface UserFilterOptions {
  role?: string;
  status?: string;
  search?: string;
}

/**
 * Port (Interface) for User persistence.
 * Defined in the Domain layer so that business logic dictates
 * the contract, while the Infrastructure layer provides the implementation.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findAll(filter?: UserFilterOptions): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;

  // User detail tabs sub-resources
  getUserAddresses(userId: string): Promise<UserAddressEntity[]>;
  getUserCart(userId: string): Promise<UserCartDetails | null>;
  getUserOrders(userId: string): Promise<UserOrderDetails[]>;
  getUserInvoices(userId: string): Promise<any[]>;
  getUserWallet(userId: string): Promise<UserWalletDetails | null>;
  creditUserWallet(
    userId: string,
    amount: number,
    trackingCode: string,
    refId: string,
  ): Promise<UserWalletDetails>;
  requestWalletWithdrawal(
    userId: string,
    data: {
      amount: number;
      cardNumber: string;
      shabaNumber: string;
      accountHolder?: string | null;
      bankName?: string | null;
    },
  ): Promise<UserWalletWithdrawal>;
  getAdminWithdrawals(query: {
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    items: any[];
    total: number;
    metrics: {
      pendingCount: number;
      pendingAmount: number;
      completedCount: number;
      completedAmount: number;
    };
  }>;
  getAdminDeposits(query: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: any[]; total: number; totalAmount: number }>;
  updateWithdrawalStatus(
    withdrawalId: string,
    status: 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED',
    payoutReference?: string,
    rejectionReason?: string,
    adminUserId?: string,
  ): Promise<UserWalletWithdrawal>;
  getUserFavorites(userId: string): Promise<UserFavoriteDetails[]>;
  addFavorite(userId: string, productId: string): Promise<UserFavoriteDetails>;
  removeFavorite(userId: string, productId: string): Promise<boolean>;
  isFavorite(userId: string, productId: string): Promise<boolean>;
  getUserRfqInquiries(userId: string): Promise<UserRfqDetails[]>;
  addRfqInquiry(userId: string, rfq: Partial<UserRfqDetails>): Promise<UserRfqDetails>;
  getAllRfqInquiries(): Promise<UserRfqDetails[]>;
  getRfqById(id: string): Promise<UserRfqDetails | null>;
  updateRfqQuote(
    id: string,
    quote: {
      finalQuotedAmount: number;
      discountPercent?: number;
      validityDays?: number;
      notes?: string;
      status?: string;
    },
  ): Promise<UserRfqDetails>;
  updateRfqStatus(id: string, status: string): Promise<UserRfqDetails>;
  deleteRfq(id: string, userId?: string): Promise<boolean>;
  getUserAuthenticityInquiries(userId: string): Promise<UserAuthenticityDetails[]>;
  addAuthenticityInquiry(inquiry: Partial<UserAuthenticityDetails>): Promise<UserAuthenticityDetails>;
  findAuthenticityBySerial(serialNumber: string): Promise<UserAuthenticityDetails | null>;
  getUserCheques(userId: string): Promise<any[]>;
  addCheque(userId: string, cheque: any): Promise<any>;
  getUserLoyalty(userId: string): Promise<UserLoyaltyDetails | null>;
  getUserSessions(userId: string): Promise<UserSessionDetails[]>;
  revokeUserSession(userId: string, sessionId: string): Promise<boolean>;
}
