import type { IUserAddressRepository } from '../../../domain/repositories/user-address.repository.interface.js';
import {
  AddressNotFoundException,
  AddressOwnershipException,
} from '../../../domain/exceptions/address.exceptions.js';

export class DeleteAddressUseCase {
  constructor(private readonly addressRepository: IUserAddressRepository) {}

  async execute(userId: string, addressId: string): Promise<boolean> {
    const existing = await this.addressRepository.findById(addressId);
    if (!existing) {
      throw new AddressNotFoundException(addressId);
    }
    if (existing.userId !== userId) {
      throw new AddressOwnershipException();
    }

    const wasDefault = existing.isDefault;
    await this.addressRepository.delete(addressId);

    if (wasDefault) {
      const remaining = await this.addressRepository.findByUserId(userId);
      if (remaining.length > 0) {
        await this.addressRepository.setDefault(userId, remaining[0].id);
      }
    }

    return true;
  }
}
