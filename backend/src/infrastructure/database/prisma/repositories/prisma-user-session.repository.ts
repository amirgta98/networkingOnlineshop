import { Injectable } from '@nestjs/common';
import { IUserSessionRepository } from '../../../../domain/repositories/user-session.repository.interface.js';
import { UserSession } from '../../../../domain/entities/user-session.entity.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaUserSessionRepository implements IUserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: UserSession): Promise<void> {
    await this.prisma.userSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        refreshTokenHash: session.refreshTokenHash,
        deviceName: session.deviceName,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        location: session.location,
        isRevoked: session.isRevoked,
        expiresAt: session.expiresAt,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt,
      },
    });
  }

  async findById(id: string): Promise<UserSession | null> {
    const raw = await this.prisma.userSession.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByRefreshTokenHash(hash: string): Promise<UserSession | null> {
    const raw = await this.prisma.userSession.findFirst({
      where: {
        refreshTokenHash: hash,
        isRevoked: false,
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async update(session: UserSession): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        isRevoked: session.isRevoked,
        lastActiveAt: session.lastActiveAt,
      },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id },
      data: {
        isRevoked: true,
      },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: {
        isRevoked: true,
      },
    });
  }

  private toDomain(raw: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    deviceName: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    location: string | null;
    isRevoked: boolean;
    expiresAt: Date;
    lastActiveAt: Date;
    createdAt: Date;
  }): UserSession {
    return new UserSession({
      id: raw.id,
      userId: raw.userId,
      refreshTokenHash: raw.refreshTokenHash,
      deviceName: raw.deviceName,
      browser: raw.browser,
      os: raw.os,
      ipAddress: raw.ipAddress,
      location: raw.location,
      isRevoked: raw.isRevoked,
      expiresAt: raw.expiresAt,
      lastActiveAt: raw.lastActiveAt,
      createdAt: raw.createdAt,
    });
  }
}
