# Database Layer Integration Guide

This directory is part of the **Infrastructure** layer in Clean Architecture.

## Switching from In-Memory to an ORM (e.g., TypeORM, Prisma, Drizzle)

In Clean Architecture, persistence is a detail that belongs to the Infrastructure layer. The Domain and Application layers only depend on the interface:

```typescript
// src/domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Example: Implementing a TypeORM Repository

1. Define the TypeORM Schema/Entity in `src/infrastructure/database/typeorm/entities/user.typeorm-entity.ts` (this is NOT the Domain entity; it is an infrastructure persistence model).
2. Create a repository adapter:
```typescript
// src/infrastructure/database/typeorm/repositories/typeorm-user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../../domain/entities/user.entity.js';
import { UserTypeOrmEntity } from '../entities/user.typeorm-entity.js';

export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly ormRepo: Repository<UserTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.ormRepo.findOneBy({ id });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.ormRepo.findOneBy({ email });
    return raw ? this.toDomain(raw) : null;
  }

  async save(user: User): Promise<void> {
    await this.ormRepo.save(this.toOrm(user));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  private toDomain(orm: UserTypeOrmEntity): User {
    // Map ORM record back to Domain Entity
    return new User({
      id: orm.id,
      email: Email.create(orm.email),
      name: orm.name,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  private toOrm(domain: User): UserTypeOrmEntity {
    // Map Domain Entity to ORM schema
  }
}
```

3. Update the provider registration in `src/users.module.ts`:
```typescript
{
  provide: USER_REPOSITORY_TOKEN,
  useClass: TypeOrmUserRepository, // Swapped seamlessly without touching Domain or Application!
}
```
