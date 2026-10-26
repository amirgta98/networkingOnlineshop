import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface.js';
import {
  PaymentTransactionEntity,
  PaymentType,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity.js';
import { InMemoryPaymentRepository } from '../../in-memory/in-memory-payment.repository.js';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  private readonly logger = new Logger(PrismaPaymentRepository.name);
  private readonly inMemoryFallback = new InMemoryPaymentRepository();

  constructor(private readonly prisma: PrismaService) {}

  private isPrismaError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const name = (err as any).name;
    const code = (err as any).code;
    const message = String((err as any).message || '');
    return (
      name === 'PrismaClientInitializationError' ||
      name === 'PrismaClientRustPanicError' ||
      name === 'PrismaClientUnknownRequestError' ||
      code === 'P1000' ||
      code === 'P1001' ||
      code === 'P1002' ||
      code === 'P1003' ||
      code === 'P2021' ||
      code === 'P2022' ||
      message.includes("Can't reach database server") ||
      message.includes('does not exist in the current database')
    );
  }

  private toDomain(record: any): PaymentTransactionEntity {
    return new PaymentTransactionEntity({
      id: record.id,
      userId: record.userId,
      type: record.type as PaymentType,
      targetId: record.targetId,
      amount: Number(record.amount),
      currency: record.currency,
      gateway: record.gateway,
      status: record.status as PaymentStatus,
      authority: record.authority,
      refId: record.refId,
      cardPan: record.cardPan,
      cardHash: record.cardHash,
      trackingCode: record.trackingCode,
      description: record.description,
      callbackUrl: record.callbackUrl,
      errorMessage: record.errorMessage,
      verifiedAt: record.verifiedAt ? new Date(record.verifiedAt) : null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(payment: PaymentTransactionEntity): Promise<PaymentTransactionEntity> {
    try {
      const record = await (this.prisma as any).paymentTransaction.create({
        data: {
          id: payment.id,
          userId: payment.userId || undefined,
          type: payment.type,
          targetId: payment.targetId,
          amount: BigInt(payment.amount),
          currency: payment.currency,
          gateway: payment.gateway,
          status: payment.status,
          authority: payment.authority,
          refId: payment.refId,
          cardPan: payment.cardPan,
          cardHash: payment.cardHash,
          trackingCode: payment.trackingCode,
          description: payment.description,
          callbackUrl: payment.callbackUrl,
          errorMessage: payment.errorMessage,
          verifiedAt: payment.verifiedAt,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
      });
      return this.toDomain(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        this.logger.warn(`Prisma error, using in-memory payment repository: ${(err as any).message}`);
        return this.inMemoryFallback.create(payment);
      }
      throw err;
    }
  }

  async findByAuthority(authority: string): Promise<PaymentTransactionEntity | null> {
    try {
      const record = await (this.prisma as any).paymentTransaction.findUnique({
        where: { authority },
      });
      if (!record) {
        return this.inMemoryFallback.findByAuthority(authority);
      }
      return this.toDomain(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findByAuthority(authority);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<PaymentTransactionEntity | null> {
    try {
      const record = await (this.prisma as any).paymentTransaction.findUnique({
        where: { id },
      });
      if (!record) {
        return this.inMemoryFallback.findById(id);
      }
      return this.toDomain(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findById(id);
      }
      throw err;
    }
  }

  async findByTrackingCode(trackingCode: string): Promise<PaymentTransactionEntity | null> {
    try {
      const record = await (this.prisma as any).paymentTransaction.findUnique({
        where: { trackingCode },
      });
      if (!record) {
        return this.inMemoryFallback.findByTrackingCode(trackingCode);
      }
      return this.toDomain(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findByTrackingCode(trackingCode);
      }
      throw err;
    }
  }

  async findByTargetId(targetId: string): Promise<PaymentTransactionEntity[]> {
    try {
      const records = await (this.prisma as any).paymentTransaction.findMany({
        where: { targetId },
        orderBy: { createdAt: 'desc' },
      });
      if (!records || records.length === 0) {
        return this.inMemoryFallback.findByTargetId(targetId);
      }
      return records.map((r: any) => this.toDomain(r));
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.findByTargetId(targetId);
      }
      throw err;
    }
  }

  async update(payment: PaymentTransactionEntity): Promise<PaymentTransactionEntity> {
    try {
      const record = await (this.prisma as any).paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: payment.status,
          refId: payment.refId,
          cardPan: payment.cardPan,
          cardHash: payment.cardHash,
          errorMessage: payment.errorMessage,
          verifiedAt: payment.verifiedAt,
          updatedAt: payment.updatedAt,
        },
      });
      return this.toDomain(record);
    } catch (err) {
      if (this.isPrismaError(err)) {
        return this.inMemoryFallback.update(payment);
      }
      throw err;
    }
  }
}
