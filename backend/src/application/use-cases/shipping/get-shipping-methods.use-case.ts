import { IShippingRepository } from '../../../domain/repositories/shipping.repository.interface.js';
import { ShippingMethod } from '../../../domain/entities/shipping-method.entity.js';

export interface GetShippingMethodsFilter {
  province?: string;
  subtotal?: number;
  includeInactive?: boolean;
  includeRestricted?: boolean;
}

export class GetShippingMethodsUseCase {
  constructor(private readonly shippingRepository: IShippingRepository) {}

  async execute(filter?: GetShippingMethodsFilter): Promise<ShippingMethod[]> {
    const all = await this.shippingRepository.findAllMethods(filter?.includeInactive ?? false);

    if (!filter?.province || filter?.includeRestricted) {
      return all;
    }

    return all.filter((method) => method.isAvailableFor(filter.province));
  }
}
