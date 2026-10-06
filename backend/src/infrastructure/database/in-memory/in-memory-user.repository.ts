import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';

/**
 * In-Memory implementation of IUserRepository.
 * Used for development, testing, and demonstrating architecture without
 * coupling the application to a running database instance.
 *
 * To switch to TypeORM, Prisma, or MongoDB:
 * Simply create e.g. TypeOrmUserRepository that implements IUserRepository
 * and update the provider binding in UsersModule.
 */
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

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

  public async save(user: User): Promise<void> {
    this.users.set(user.id, this.clone(user));
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  /**
   * Helper to clone an entity and prevent unintended reference mutations.
   */
  private clone(user: User): User {
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt.getTime()),
      updatedAt: new Date(user.updatedAt.getTime()),
    });
  }
}
