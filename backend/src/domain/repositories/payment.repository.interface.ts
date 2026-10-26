import { PaymentTransactionEntity } from '../entities/payment.entity.js';

export interface IPaymentRepository {
  create(payment: PaymentTransactionEntity): Promise<PaymentTransactionEntity>;
  findByAuthority(authority: string): Promise<PaymentTransactionEntity | null>;
  findById(id: string): Promise<PaymentTransactionEntity | null>;
  findByTrackingCode(trackingCode: string): Promise<PaymentTransactionEntity | null>;
  findByTargetId(targetId: string): Promise<PaymentTransactionEntity[]>;
  update(payment: PaymentTransactionEntity): Promise<PaymentTransactionEntity>;
}
