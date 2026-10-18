import { IUserRepository, UserFilterOptions } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import type {
  UserCartDetails,
  UserOrderDetails,
  UserWalletDetails,
  UserFavoriteDetails,
  UserRfqDetails,
  UserAuthenticityDetails,
  UserLoyaltyDetails,
  UserSessionDetails,
} from '../../../domain/entities/user-detail.types.js';

/**
 * In-Memory implementation of IUserRepository.
 * Pure in-memory storage with zero hardcoded mock/demo data.
 * Used for isolated testing and unit test suites.
 */
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();
  private readonly addresses = new Map<string, UserAddressEntity[]>();
  private readonly carts = new Map<string, UserCartDetails>();
  private readonly orders = new Map<string, UserOrderDetails[]>();
  private readonly invoices = new Map<string, any[]>();
  private readonly wallets = new Map<string, UserWalletDetails>();
  private readonly favorites = new Map<string, UserFavoriteDetails[]>();
  private readonly rfqInquiries = new Map<string, UserRfqDetails[]>();
  private readonly authenticityInquiries = new Map<string, UserAuthenticityDetails[]>();
  private readonly loyaltyAccounts = new Map<string, UserLoyaltyDetails>();
  private readonly sessions = new Map<string, UserSessionDetails[]>();

  constructor() {
    // Initialized completely empty — zero mock data
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? this.clone(user) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.value === normalized) {
        return this.clone(user);
      }
    }
    return null;
  }

  public async findByPhone(phone: string): Promise<User | null> {
    const normalized = PhoneNumber.normalize(phone);
    for (const user of this.users.values()) {
      if (user.phone && user.phone.value === normalized) {
        return this.clone(user);
      }
    }
    return null;
  }

  public async findAll(filter?: UserFilterOptions): Promise<User[]> {
    let result = Array.from(this.users.values()).map((u) => this.clone(u));

    if (filter?.role && filter.role !== 'all') {
      const targetRole = filter.role.toLowerCase();
      result = result.filter((u) => {
        const uRole = u.role.toLowerCase();
        if (targetRole === 'admin') {
          return uRole === 'admin' || uRole === 'super_admin';
        }
        if (targetRole === 'sales_manager') {
          return uRole === 'sales_manager';
        }
        if (targetRole === 'partner_b2b' || targetRole === 'partner') {
          return uRole === 'partner_b2b' || uRole === 'partner';
        }
        if (targetRole === 'customer') {
          return uRole === 'customer';
        }
        return uRole === targetRole;
      });
    }

    if (filter?.status && filter.status !== 'all') {
      const targetStatus = filter.status.toLowerCase();
      result = result.filter((u) => {
        const uStatus = u.status.toLowerCase();
        return uStatus === targetStatus;
      });
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const phoneMatch = u.phone?.value.includes(q) ?? false;
        const emailMatch = u.email.value.toLowerCase().includes(q);
        const nationalMatch = u.nationalCode?.includes(q) ?? false;
        const companyMatch = u.companyName?.toLowerCase().includes(q) ?? false;
        return nameMatch || phoneMatch || emailMatch || nationalMatch || companyMatch;
      });
    }

    // Sort by createdAt descending
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }

  public async save(user: User): Promise<void> {
    this.users.set(user.id, this.clone(user));
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
    this.addresses.delete(id);
    this.carts.delete(id);
    this.orders.delete(id);
    this.invoices.delete(id);
    this.wallets.delete(id);
    this.favorites.delete(id);
    this.rfqInquiries.delete(id);
    this.authenticityInquiries.delete(id);
    this.loyaltyAccounts.delete(id);
    this.sessions.delete(id);
  }

  public clear(): void {
    this.users.clear();
    this.addresses.clear();
    this.carts.clear();
    this.orders.clear();
    this.invoices.clear();
    this.wallets.clear();
    this.favorites.clear();
    this.rfqInquiries.clear();
    this.authenticityInquiries.clear();
    this.loyaltyAccounts.clear();
    this.sessions.clear();
  }

  private clone(user: User): User {
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt.getTime()),
      updatedAt: new Date(user.updatedAt.getTime()),
      phone: user.phone ? PhoneNumber.create(user.phone.value) : null,
      phoneVerifiedAt: user.phoneVerifiedAt ? new Date(user.phoneVerifiedAt.getTime()) : null,
      status: user.status,
      role: user.role,
      security: user.security
        ? {
            ...user.security,
            pinLockedUntil: user.security.pinLockedUntil
              ? new Date(user.security.pinLockedUntil.getTime())
              : null,
          }
        : null,
      nationalCode: user.nationalCode,
      nationalCodeVerified: user.nationalCodeVerified,
      companyName: user.companyName,
      userTier: user.userTier,
      notes: user.notes,
      walletBalance: user.walletBalance,
      totalSpent: user.totalSpent,
      ordersCount: user.ordersCount,
      lastLogin: user.lastLogin,
      activities: user.activities ? [...user.activities] : [],
    });
  }

  // --- Subsystem Query Methods (Zero Mock Data) ---

  public async getUserAddresses(userId: string): Promise<UserAddressEntity[]> {
    return this.addresses.get(userId) || [];
  }

  public async getUserCart(userId: string): Promise<UserCartDetails | null> {
    return this.carts.get(userId) || null;
  }

  public async getUserOrders(userId: string): Promise<UserOrderDetails[]> {
    return this.orders.get(userId) || [];
  }

  public async getUserInvoices(userId: string): Promise<any[]> {
    return this.invoices.get(userId) || [];
  }

  public async getUserWallet(userId: string): Promise<UserWalletDetails | null> {
    return this.wallets.get(userId) || null;
  }

  public async getUserFavorites(userId: string): Promise<UserFavoriteDetails[]> {
    return this.favorites.get(userId) || [];
  }

  public async getUserRfqInquiries(userId: string): Promise<UserRfqDetails[]> {
    return this.rfqInquiries.get(userId) || [];
  }

  public async getUserAuthenticityInquiries(userId: string): Promise<UserAuthenticityDetails[]> {
    return this.authenticityInquiries.get(userId) || [];
  }

  public async getUserLoyalty(userId: string): Promise<UserLoyaltyDetails | null> {
    return this.loyaltyAccounts.get(userId) || null;
  }

  public async getUserSessions(userId: string): Promise<UserSessionDetails[]> {
    return this.sessions.get(userId) || [];
  }

  public async revokeUserSession(userId: string, sessionId: string): Promise<boolean> {
    const list = this.sessions.get(userId);
    if (!list) return false;
    const sess = list.find((s) => s.id === sessionId);
    if (sess) {
      sess.isRevoked = true;
      return true;
    }
    return false;
  }

  // --- Test Fixture Setters (For Unit Tests Only) ---

  public setAddresses(userId: string, addresses: UserAddressEntity[]): void {
    this.addresses.set(userId, addresses);
  }

  public setCart(userId: string, cart: UserCartDetails): void {
    this.carts.set(userId, cart);
  }

  public setOrders(userId: string, orders: UserOrderDetails[]): void {
    this.orders.set(userId, orders);
  }

  public setInvoices(userId: string, invoices: any[]): void {
    this.invoices.set(userId, invoices);
  }

  public setWallet(userId: string, wallet: UserWalletDetails): void {
    this.wallets.set(userId, wallet);
  }

  public setFavorites(userId: string, favorites: UserFavoriteDetails[]): void {
    this.favorites.set(userId, favorites);
  }

  public setRfqInquiries(userId: string, inquiries: UserRfqDetails[]): void {
    this.rfqInquiries.set(userId, inquiries);
  }

  public setAuthenticityInquiries(userId: string, inquiries: UserAuthenticityDetails[]): void {
    this.authenticityInquiries.set(userId, inquiries);
  }

  public setLoyalty(userId: string, loyalty: UserLoyaltyDetails): void {
    this.loyaltyAccounts.set(userId, loyalty);
  }

  public setSessions(userId: string, sessions: UserSessionDetails[]): void {
    this.sessions.set(userId, sessions);
  }
}
