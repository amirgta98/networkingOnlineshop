import { User } from '../entities/user.entity.js';

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
}
