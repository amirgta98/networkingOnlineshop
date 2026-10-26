import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserRfqDetails } from '../../../domain/entities/user-detail.types.js';

export interface CreateRfqInput {
  userId: string;
  projectTitle: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  urgency?: 'normal' | 'urgent' | 'critical' | boolean;
  items?: Array<{
    title: string;
    sku?: string;
    brand?: string;
    quantity?: number;
    unitPrice?: number;
    notes?: string;
  }>;
  notes?: string;
  projectLocation?: string;
  attachedFileName?: string;
}

export class CreateRfqUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateRfqInput): Promise<UserRfqDetails> {
    const isUrgent =
      input.urgency === 'urgent' ||
      input.urgency === 'critical' ||
      input.urgency === true;

    const mappedItems = (input.items || []).map((it, idx) => ({
      id: `it_${Date.now()}_${idx}`,
      sku: it.sku || `SKU-${idx + 1}`,
      title: it.title,
      brand: it.brand || 'Cisco',
      category: 'تجهیزات شبکه',
      requestedQty: it.quantity || 1,
      unitPrice: it.unitPrice || 0,
      stockStatus: 'available',
      specsSummary: it.notes,
    }));

    const rfqData: Partial<UserRfqDetails> = {
      projectTitle: input.projectTitle,
      companyName: input.clientName,
      clientPhone: input.clientPhone || '۰۹۱۲۰۰۰۰۰۰۰',
      clientEmail: input.clientEmail,
      urgent: isUrgent,
      deadlineHours: input.urgency === 'critical' ? 12 : isUrgent ? 24 : 48,
      status: 'pending_quote',
      statusLabel: 'در صف بررسی مهندسی فروش',
      projectLocation: input.projectLocation,
      notes: input.notes,
      items: mappedItems,
      estimatedValue: 0,
      finalQuotedAmount: undefined,
    };

    return this.userRepository.addRfqInquiry(input.userId, rfqData);
  }
}
