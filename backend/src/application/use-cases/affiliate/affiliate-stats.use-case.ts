import type {
  IAffiliateRepository,
  AffiliateStats,
} from '../../../domain/repositories/affiliate.repository.interface.js';

export class GetAffiliateStatsUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(): Promise<AffiliateStats> {
    return await this.repository.getStats();
  }
}
