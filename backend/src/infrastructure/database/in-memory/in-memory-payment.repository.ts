import { Injectable } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface.js';
import { PaymentTransactionEntity } from '../../../domain/entities/payment.entity.js';

@Injectable()
export class InMemoryPaymentRepository implements IPaymentRepository {
  private readonly payments = new Map<string, PaymentTransactionEntity>();

  async create(payment: PaymentTransactionEntity): Promise<PaymentTransactionEntity> {
    this.payments.set(payment.id, payment);
    return payment;
  }

  async findByAuthority(authority: string): Promise<PaymentTransactionEntity | null> {
    for (const payment of this.payments.values()) {
      if (payment.authority === authority) {
        return payment;
      }
    }
    return null;
  }

  async findById(id: string): Promise<PaymentTransactionEntity | null> {
    return this.payments.get(id) ?? null;
  }

  async findByTrackingCode(trackingCode: string): Promise<PaymentTransactionEntity | null> {
    for (const payment of this.payments.values()) {
      if (payment.trackingCode === trackingCode) {
        return payment;
      }
    }
    return null;
  }

  async findByTargetId(targetId: string): Promise<PaymentTransactionEntity[]> {
    const list: PaymentTransactionEntity[] = [];
    for (const payment of this.payments.values()) {
      if (payment.targetId === targetId) {
        list.push(payment);
      }
    }
    return list;
  }

  async update(payment: PaymentTransactionEntity): Promise<PaymentTransactionEntity> {
    this.payments.set(payment.id, payment);
    return payment;
  }
}
