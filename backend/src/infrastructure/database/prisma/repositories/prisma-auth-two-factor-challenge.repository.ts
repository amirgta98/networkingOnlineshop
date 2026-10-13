import { Injectable } from '@nestjs/common';
import { IAuthTwoFactorChallengeRepository } from '../../../../domain/repositories/auth-two-factor-challenge.repository.interface.js';
import { AuthTwoFactorChallenge } from '../../../../domain/entities/auth-two-factor-challenge.entity.js';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number.vo.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaAuthTwoFactorChallengeRepository
  implements IAuthTwoFactorChallengeRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(challenge: AuthTwoFactorChallenge): Promise<void> {
    await this.prisma.authTwoFactorChallenge.create({
      data: {
        id: challenge.id,
        userId: challenge.userId,
        phone: challenge.phone.value,
        attempts: challenge.attempts,
        maxAttempts: challenge.maxAttempts,
        expiresAt: challenge.expiresAt,
        consumedAt: challenge.consumedAt,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<AuthTwoFactorChallenge | null> {
    const raw = await this.prisma.authTwoFactorChallenge.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async update(challenge: AuthTwoFactorChallenge): Promise<void> {
    await this.prisma.authTwoFactorChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: challenge.attempts,
        consumedAt: challenge.consumedAt,
        updatedAt: challenge.updatedAt,
      },
    });
  }

  private toDomain(raw: {
    id: string;
    userId: string;
    phone: string;
    attempts: number;
    maxAttempts: number;
    expiresAt: Date;
    consumedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthTwoFactorChallenge {
    return new AuthTwoFactorChallenge({
      id: raw.id,
      userId: raw.userId,
      phone: PhoneNumber.create(raw.phone),
      attempts: raw.attempts,
      maxAttempts: raw.maxAttempts,
      expiresAt: raw.expiresAt,
      consumedAt: raw.consumedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
