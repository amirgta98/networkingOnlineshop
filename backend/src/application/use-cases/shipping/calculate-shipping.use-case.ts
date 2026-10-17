import { IShippingRepository } from '../../../domain/repositories/shipping.repository.interface.js';
import {
  CalculateShippingQuery,
  CalculateShippingResult,
} from '../../dto/shipping/shipping.dto.js';

export class CalculateShippingUseCase {
  constructor(private readonly shippingRepository: IShippingRepository) {}

  async execute(query: CalculateShippingQuery): Promise<CalculateShippingResult> {
    const method = await this.shippingRepository.findMethodById(query.methodId);
    if (!method) {
      throw new Error(`روش ارسال با شناسه ${query.methodId} یافت نشد.`);
    }

    const isFree = method.isFreeFor(query.subtotal, query.province);
    const cost = method.calculateCost(query.subtotal, query.province);
    const effectiveFreeThreshold = method.getEffectiveFreeThreshold(query.province);
    const effectiveDeliveryTime = method.getEffectiveDeliveryTime(query.province);
    const provinceRule = method.findProvinceRule(query.province);

    let amountNeededForFree = 0;
    if (
      !isFree &&
      effectiveFreeThreshold !== null &&
      query.subtotal < effectiveFreeThreshold
    ) {
      amountNeededForFree = effectiveFreeThreshold - query.subtotal;
    }

    return {
      methodId: method.id,
      cost,
      isFree,
      freeThreshold: effectiveFreeThreshold,
      amountNeededForFree,
      estimatedDeliveryTime: effectiveDeliveryTime,
      province: query.province,
      isProvinceCustomized: Boolean(provinceRule),
    };
  }
}
