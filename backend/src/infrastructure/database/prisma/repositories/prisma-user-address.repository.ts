import { Injectable } from '@nestjs/common';
import type {
  IUserAddressRepository,
  CreateUserAddressData,
  UpdateUserAddressData,
} from '../../../../domain/repositories/user-address.repository.interface.js';
import {
  UserAddressEntity,
  AddressType,
} from '../../../../domain/entities/user-address.entity.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaUserAddressRepository implements IUserAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserAddressEntity[]> {
    const rawList = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return rawList.map((raw) => this.toDomain(raw));
  }

  async findById(id: string): Promise<UserAddressEntity | null> {
    const raw = await this.prisma.userAddress.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async create(data: CreateUserAddressData): Promise<UserAddressEntity> {
    const raw = await this.prisma.userAddress.create({
      data: {
        userId: data.userId,
        title: data.title,
        type: UserAddressEntity.normalizeType(data.type),
        recipientFirstName: data.recipientFirstName,
        recipientLastName: data.recipientLastName,
        recipientMobile: data.recipientMobile,
        province: data.province,
        city: data.city,
        detailedAddress: data.detailedAddress,
        plaque: data.plaque,
        unit: data.unit ?? null,
        postalCode: data.postalCode,
        latitude: data.latitude !== undefined && data.latitude !== null ? data.latitude : null,
        longitude: data.longitude !== undefined && data.longitude !== null ? data.longitude : null,
        deliveryNotes: data.deliveryNotes ?? null,
        isDefault: Boolean(data.isDefault),
      },
    });
    return this.toDomain(raw);
  }

  async update(id: string, data: UpdateUserAddressData): Promise<UserAddressEntity> {
    const raw = await this.prisma.userAddress.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && { type: UserAddressEntity.normalizeType(data.type) }),
        ...(data.recipientFirstName !== undefined && { recipientFirstName: data.recipientFirstName }),
        ...(data.recipientLastName !== undefined && { recipientLastName: data.recipientLastName }),
        ...(data.recipientMobile !== undefined && { recipientMobile: data.recipientMobile }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.detailedAddress !== undefined && { detailedAddress: data.detailedAddress }),
        ...(data.plaque !== undefined && { plaque: data.plaque }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.deliveryNotes !== undefined && { deliveryNotes: data.deliveryNotes }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.userAddress.delete({
      where: { id },
    });
    return true;
  }

  async setDefault(userId: string, addressId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.userAddress.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      }),
      this.prisma.userAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);
  }

  private toDomain(raw: {
    id: string;
    userId: string;
    title: string;
    type: string;
    recipientFirstName: string;
    recipientLastName: string;
    recipientMobile: string;
    province: string;
    city: string;
    detailedAddress: string;
    plaque: string;
    unit: string | null;
    postalCode: string;
    latitude: unknown;
    longitude: unknown;
    deliveryNotes: string | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserAddressEntity {
    return new UserAddressEntity({
      id: raw.id,
      userId: raw.userId,
      title: raw.title,
      type: raw.type as AddressType,
      recipientFirstName: raw.recipientFirstName,
      recipientLastName: raw.recipientLastName,
      recipientMobile: raw.recipientMobile,
      province: raw.province,
      city: raw.city,
      detailedAddress: raw.detailedAddress,
      plaque: raw.plaque,
      unit: raw.unit,
      postalCode: raw.postalCode,
      latitude: raw.latitude !== null && raw.latitude !== undefined ? Number(raw.latitude) : null,
      longitude: raw.longitude !== null && raw.longitude !== undefined ? Number(raw.longitude) : null,
      deliveryNotes: raw.deliveryNotes,
      isDefault: raw.isDefault,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
