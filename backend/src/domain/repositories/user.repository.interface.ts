import { User } from '../entities/user.entity.js';
import { UserAddressEntity } from '../entities/user-address.entity.js';
import {
  UserCartDetails,
  UserOrderDetails,
  UserWalletDetails,
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
  getUserFavorites(userId: string): Promise<UserFavoriteDetails[]>;
  getUserRfqInquiries(userId: string): Promise<UserRfqDetails[]>;
  getUserAuthenticityInquiries(userId: string): Promise<UserAuthenticityDetails[]>;
  getUserLoyalty(userId: string): Promise<UserLoyaltyDetails | null>;
  getUserSessions(userId: string): Promise<UserSessionDetails[]>;
  revokeUserSession(userId: string, sessionId: string): Promise<boolean>;
}
