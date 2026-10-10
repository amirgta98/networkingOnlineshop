import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../../domain/entities/user.entity.js';
import { Email } from '../../../../domain/value-objects/email.vo.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        email: user.email.value,
        name: user.name,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private toDomain(raw: {
    id: string;
    email: string | null;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: raw.id,
      email: Email.create(raw.email || `user-${raw.id}@fonix-accademic.ir`),
      name: raw.name,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
