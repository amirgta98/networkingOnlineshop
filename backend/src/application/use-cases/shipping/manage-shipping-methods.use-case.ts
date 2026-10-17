import { IShippingRepository } from '../../../domain/repositories/shipping.repository.interface.js';
import { ShippingMethod } from '../../../domain/entities/shipping-method.entity.js';
import {
  CreateShippingMethodCommand,
  UpdateShippingMethodCommand,
} from '../../dto/shipping/shipping.dto.js';

export class ManageShippingMethodsUseCase {
  constructor(private readonly shippingRepository: IShippingRepository) {}

  async create(command: CreateShippingMethodCommand): Promise<ShippingMethod> {
    if (!command.title?.trim()) {
      throw new Error('عنوان روش ارسال الزامی است.');
    }
    return this.shippingRepository.createMethod(command);
  }

  async update(id: string, command: UpdateShippingMethodCommand): Promise<ShippingMethod> {
    return this.shippingRepository.updateMethod(id, command);
  }

  async delete(id: string): Promise<boolean> {
    return this.shippingRepository.deleteMethod(id);
  }

  async toggle(id: string): Promise<ShippingMethod> {
    return this.shippingRepository.toggleMethod(id);
  }

  async getById(id: string): Promise<ShippingMethod | null> {
    return this.shippingRepository.findMethodById(id);
  }
}
