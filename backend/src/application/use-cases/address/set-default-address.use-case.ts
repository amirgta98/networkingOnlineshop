import type { IUserAddressRepository } from '../../../domain/repositories/user-address.repository.interface.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import {
  AddressNotFoundException,
  AddressOwnershipException,
} from '../../../domain/exceptions/address.exceptions.js';

export class SetDefaultAddressUseCase {
  constructor(private readonly addressRepository: IUserAddressRepository) {}

  async execute(userId: string, addressId: string): Promise<UserAddressEntity> {
    const existing = await this.addressRepository.findById(addressId);
    if (!existing) {
      throw new AddressNotFoundException(addressId);
    }
    if (existing.userId !== userId) {
      throw new AddressOwnershipException();
    }

    await this.addressRepository.setDefault(userId, addressId);
    existing.setDefault(true);
    return existing;
  }
}
