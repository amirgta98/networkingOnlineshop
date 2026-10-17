import { IShippingRepository } from '../../../domain/repositories/shipping.repository.interface.js';
import { ShippingScheduleConfig } from '../../../domain/entities/shipping-config.entity.js';
import { DeliveryTimeSlot } from '../../../domain/entities/delivery-time-slot.entity.js';
import {
  UpdateShippingConfigCommand,
  CreateTimeSlotCommand,
  UpdateTimeSlotCommand,
} from '../../dto/shipping/shipping.dto.js';

export class ManageShippingConfigUseCase {
  constructor(private readonly shippingRepository: IShippingRepository) {}

  async getConfig(): Promise<ShippingScheduleConfig> {
    return this.shippingRepository.getConfig();
  }

  async updateConfig(command: UpdateShippingConfigCommand): Promise<ShippingScheduleConfig> {
    return this.shippingRepository.updateConfig(command);
  }

  async getAllTimeSlots(includeInactive = false): Promise<DeliveryTimeSlot[]> {
    return this.shippingRepository.findAllTimeSlots(includeInactive);
  }

  async createTimeSlot(command: CreateTimeSlotCommand): Promise<DeliveryTimeSlot> {
    if (!command.title?.trim()) {
      throw new Error('عنوان بازه زمانی الزامی است.');
    }
    return this.shippingRepository.createTimeSlot(command);
  }

  async updateTimeSlot(id: string, command: UpdateTimeSlotCommand): Promise<DeliveryTimeSlot> {
    return this.shippingRepository.updateTimeSlot(id, command);
  }

  async deleteTimeSlot(id: string): Promise<boolean> {
    return this.shippingRepository.deleteTimeSlot(id);
  }
}
