import type { IUserAddressRepository } from '../../../domain/repositories/user-address.repository.interface.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import {
  AddressNotFoundException,
  AddressOwnershipException,
  InvalidAddressDataException,
} from '../../../domain/exceptions/address.exceptions.js';
import type { UpdateAddressCommand } from '../../dto/address/address.dto.js';

function toEnglishDigits(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export class UpdateAddressUseCase {
  constructor(private readonly addressRepository: IUserAddressRepository) {}

  async execute(
    userId: string,
    addressId: string,
    cmd: UpdateAddressCommand,
  ): Promise<UserAddressEntity> {
    const existing = await this.addressRepository.findById(addressId);
    if (!existing) {
      throw new AddressNotFoundException(addressId);
    }
    if (existing.userId !== userId) {
      throw new AddressOwnershipException();
    }

    let firstName = cmd.recipientFirstName !== undefined ? cmd.recipientFirstName.trim() : undefined;
    let lastName = cmd.recipientLastName !== undefined ? cmd.recipientLastName.trim() : undefined;
    if (cmd.recipientName !== undefined && !firstName) {
      const parts = cmd.recipientName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '-';
    }

    const rawMobile =
      cmd.recipientMobile !== undefined
        ? toEnglishDigits(cmd.recipientMobile).trim().replace(/\s+/g, '')
        : cmd.phoneNumber !== undefined
        ? toEnglishDigits(cmd.phoneNumber).trim().replace(/\s+/g, '')
        : undefined;

    if (rawMobile !== undefined && (!rawMobile || !/^09\d{9}$/.test(rawMobile))) {
      throw new InvalidAddressDataException('شماره موبایل تحویل‌گیرنده باید ۱۱ رقم معتبر با پیش‌شماره ۰۹ باشد.');
    }

    const detailedAddress =
      cmd.detailedAddress !== undefined
        ? cmd.detailedAddress.trim()
        : cmd.fullAddress !== undefined
        ? cmd.fullAddress.trim()
        : cmd.address !== undefined
        ? cmd.address.trim()
        : undefined;

    const plaque =
      cmd.plaque !== undefined
        ? cmd.plaque.trim()
        : cmd.buildingNumber !== undefined
        ? cmd.buildingNumber.trim()
        : undefined;

    const postalCode =
      cmd.postalCode !== undefined
        ? toEnglishDigits(cmd.postalCode).trim().replace(/\D/g, '')
        : undefined;

    if (postalCode !== undefined && (!postalCode || postalCode.length < 10)) {
      throw new InvalidAddressDataException('کد پستی ۱۰ رقمی الزامی است.');
    }

    const updated = await this.addressRepository.update(addressId, {
      title: cmd.title !== undefined ? cmd.title.trim() : undefined,
      type: cmd.type || cmd.tag,
      recipientFirstName: firstName,
      recipientLastName: lastName,
      recipientMobile: rawMobile,
      province: cmd.province !== undefined ? cmd.province.trim() : undefined,
      city: cmd.city !== undefined ? cmd.city.trim() : undefined,
      detailedAddress,
      plaque,
      unit: cmd.unit !== undefined ? cmd.unit : undefined,
      postalCode,
      latitude: cmd.latitude,
      longitude: cmd.longitude,
      deliveryNotes: cmd.deliveryNotes,
      isDefault: cmd.isDefault,
    });

    if (cmd.isDefault === true) {
      await this.addressRepository.setDefault(userId, addressId);
      updated.setDefault(true);
    }

    return updated;
  }
}
