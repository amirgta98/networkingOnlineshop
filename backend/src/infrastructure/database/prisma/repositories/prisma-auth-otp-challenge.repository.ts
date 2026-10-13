import { Injectable } from '@nestjs/common';
import { IAuthOtpChallengeRepository } from '../../../../domain/repositories/auth-otp-challenge.repository.interface.js';
import { AuthOtpChallenge } from '../../../../domain/entities/auth-otp-challenge.entity.js';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number.vo.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaAuthOtpChallengeRepository implements IAuthOtpChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(challenge: AuthOtpChallenge): Promise<void> {
    await this.prisma.authOtpChallenge.create({
      data: {
        id: challenge.id,
        phone: challenge.phone.value,
        otpHash: challenge.otpHash,
        purpose: challenge.purpose,
        attempts: challenge.attempts,
        maxAttempts: challenge.maxAttempts,
        resendCooldownUntil: challenge.resendCooldownUntil,
        expiresAt: challenge.expiresAt,
        consumedAt: challenge.consumedAt,
        ipAddress: challenge.ipAddress,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<AuthOtpChallenge | null> {
    const raw = await this.prisma.authOtpChallenge.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findLatestActiveByPhone(phone: string): Promise<AuthOtpChallenge | null> {
    const normalized = PhoneNumber.normalize(phone);
    const now = new Date();
    const raw = await this.prisma.authOtpChallenge.findFirst({
      where: {
        phone: normalized,
        consumedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async update(challenge: AuthOtpChallenge): Promise<void> {
    await this.prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: challenge.attempts,
        consumedAt: challenge.consumedAt,
        updatedAt: challenge.updatedAt,
      },
    });
  }

  async countRecentRequests(phone: string, windowSeconds: number): Promise<number> {
    const threshold = new Date(Date.now() - windowSeconds * 1000);
    return await this.prisma.authOtpChallenge.count({
      where: {
        phone: PhoneNumber.normalize(phone),
        createdAt: {
          gte: threshold,
        },
      },
    });
  }

  async countRecentRequestsByIp(ipAddress: string, windowSeconds: number): Promise<number> {
    const threshold = new Date(Date.now() - windowSeconds * 1000);
    return await this.prisma.authOtpChallenge.count({
      where: {
        ipAddress,
        createdAt: {
          gte: threshold,
        },
      },
    });
  }

  private toDomain(raw: {
    id: string;
    phone: string;
    otpHash: string;
    purpose: string;
    attempts: number;
    maxAttempts: number;
    resendCooldownUntil: Date;
    expiresAt: Date;
    consumedAt: Date | null;
    ipAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthOtpChallenge {
    return new AuthOtpChallenge({
      id: raw.id,
      phone: PhoneNumber.create(raw.phone),
      otpHash: raw.otpHash,
      purpose: raw.purpose,
      attempts: raw.attempts,
      maxAttempts: raw.maxAttempts,
      resendCooldownUntil: raw.resendCooldownUntil,
      expiresAt: raw.expiresAt,
      consumedAt: raw.consumedAt,
      ipAddress: raw.ipAddress,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
