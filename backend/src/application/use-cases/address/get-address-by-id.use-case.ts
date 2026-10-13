import type { IUserAddressRepository } from '../../../domain/repositories/user-address.repository.interface.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import {
  AddressNotFoundException,
  AddressOwnershipException,
} from '../../../domain/exceptions/address.exceptions.js';

export class GetAddressByIdUseCase {
  constructor(private readonly addressRepository: IUserAddressRepository) {}

  async execute(userId: string, addressId: string): Promise<UserAddressEntity> {
    const address = await this.addressRepository.findById(addressId);
    if (!address) {
      throw new AddressNotFoundException(addressId);
    }
    if (address.userId !== userId) {
      throw new AddressOwnershipException();
    }
    return address;
  }
}
