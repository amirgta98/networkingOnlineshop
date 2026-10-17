import {
  IShippingRepository,
  DeliveryScheduleDay,
} from '../../../domain/repositories/shipping.repository.interface.js';

export class GetDeliveryScheduleUseCase {
  constructor(private readonly shippingRepository: IShippingRepository) {}

  async execute(province?: string): Promise<DeliveryScheduleDay[]> {
    return this.shippingRepository.getSchedule(province);
  }
}
