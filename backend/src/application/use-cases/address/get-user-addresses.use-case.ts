import type { IUserAddressRepository } from '../../../domain/repositories/user-address.repository.interface.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';

export class GetUserAddressesUseCase {
  constructor(private readonly addressRepository: IUserAddressRepository) {}

  async execute(userId: string): Promise<UserAddressEntity[]> {
    return await this.addressRepository.findByUserId(userId);
  }
}
