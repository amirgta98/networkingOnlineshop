import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserAuthenticityDetails } from '../../../domain/entities/user-detail.types.js';

export class VerifySerialUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(serialNumber: string): Promise<UserAuthenticityDetails | null> {
    const clean = serialNumber.trim().toUpperCase();
    return this.userRepository.findAuthenticityBySerial(clean);
  }
}
