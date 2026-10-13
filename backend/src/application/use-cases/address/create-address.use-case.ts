import type { IUserAddressRepository } from '../../../domain/repositories/user-address.repository.interface.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import { InvalidAddressDataException } from '../../../domain/exceptions/address.exceptions.js';
import type { CreateAddressCommand } from '../../dto/address/address.dto.js';

export class CreateAddressUseCase {
  constructor(private readonly addressRepository: IUserAddressRepository) {}

  async execute(userId: string, cmd: CreateAddressCommand): Promise<UserAddressEntity> {
    const title = (cmd.title || '').trim();
    if (!title) {
      throw new InvalidAddressDataException('عنوان نشانی الزامی است.');
    }

    // Resolve recipient names
    let firstName = (cmd.recipientFirstName || '').trim();
    let lastName = (cmd.recipientLastName || '').trim();
    if (!firstName && cmd.recipientName) {
      const parts = cmd.recipientName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '-';
    }
    if (!firstName) {
      throw new InvalidAddressDataException('نام و نام خانوادگی تحویل‌گیرنده الزامی است.');
    }
    if (!lastName) {
      lastName = '-';
    }

    // Resolve mobile
    const rawMobile = (cmd.recipientMobile || cmd.phoneNumber || '').trim().replace(/\s+/g, '');
    if (!rawMobile || !/^09\d{9}$/.test(rawMobile)) {
      throw new InvalidAddressDataException('شماره موبایل تحویل‌گیرنده باید ۱۱ رقم معتبر با پیش‌شماره ۰۹ باشد.');
    }

    const province = (cmd.province || '').trim();
    if (!province) {
      throw new InvalidAddressDataException('انتخاب استان الزامی است.');
    }

    const city = (cmd.city || '').trim();
    if (!city) {
      throw new InvalidAddressDataException('انتخاب شهر الزامی است.');
    }

    const detailedAddress = (cmd.detailedAddress || cmd.fullAddress || cmd.address || '').trim();
    if (!detailedAddress || detailedAddress.length < 5) {
      throw new InvalidAddressDataException('نشانی دقیق پستی (حداقل ۵ کاراکتر) الزامی است.');
    }

    const plaque = (cmd.plaque || cmd.buildingNumber || '').trim();
    if (!plaque) {
      throw new InvalidAddressDataException('پلاک ساختمان الزامی است.');
    }

    const postalCode = (cmd.postalCode || '').trim().replace(/\D/g, '');
    if (!postalCode || postalCode.length < 10) {
      throw new InvalidAddressDataException('کد پستی ۱۰ رقمی الزامی است.');
    }

    // Check existing addresses for user
    const existingAddresses = await this.addressRepository.findByUserId(userId);
    const shouldBeDefault = Boolean(cmd.isDefault) || existingAddresses.length === 0;

    const created = await this.addressRepository.create({
      userId,
      title,
      type: cmd.type,
      recipientFirstName: firstName,
      recipientLastName: lastName,
      recipientMobile: rawMobile,
      province,
      city,
      detailedAddress,
      plaque,
      unit: cmd.unit ?? null,
      postalCode,
      latitude: cmd.latitude ?? null,
      longitude: cmd.longitude ?? null,
      deliveryNotes: cmd.deliveryNotes ?? null,
      isDefault: shouldBeDefault,
    });

    if (shouldBeDefault) {
      await this.addressRepository.setDefault(userId, created.id);
    }

    return created;
  }
}
