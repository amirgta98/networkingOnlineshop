import { randomUUID } from 'node:crypto';
import type {
  IUserAddressRepository,
  CreateUserAddressData,
  UpdateUserAddressData,
} from '../../../domain/repositories/user-address.repository.interface.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';

export class InMemoryUserAddressRepository implements IUserAddressRepository {
  private readonly addresses = new Map<string, UserAddressEntity>();

  constructor() {
    this.seedDemoAddresses();
  }

  public async findByUserId(userId: string): Promise<UserAddressEntity[]> {
    const list: UserAddressEntity[] = [];
    for (const addr of this.addresses.values()) {
      if (addr.userId === userId) {
        list.push(this.clone(addr));
      }
    }
    // Return default first, then newest
    return list.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  public async findById(id: string): Promise<UserAddressEntity | null> {
    const addr = this.addresses.get(id);
    return addr ? this.clone(addr) : null;
  }

  public async findAll(type?: string): Promise<UserAddressEntity[]> {
    const list: UserAddressEntity[] = [];
    for (const addr of this.addresses.values()) {
      if (!type || addr.type === type) {
        list.push(this.clone(addr));
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async create(data: CreateUserAddressData): Promise<UserAddressEntity> {
    const id = randomUUID();
    const entity = new UserAddressEntity({
      id,
      userId: data.userId,
      title: data.title,
      type: data.type,
      recipientFirstName: data.recipientFirstName,
      recipientLastName: data.recipientLastName,
      recipientMobile: data.recipientMobile,
      province: data.province,
      city: data.city,
      detailedAddress: data.detailedAddress,
      plaque: data.plaque,
      unit: data.unit ?? null,
      postalCode: data.postalCode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      deliveryNotes: data.deliveryNotes ?? null,
      isDefault: Boolean(data.isDefault),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.addresses.set(id, entity);
    return this.clone(entity);
  }

  public async update(id: string, data: UpdateUserAddressData): Promise<UserAddressEntity> {
    const existing = this.addresses.get(id);
    if (!existing) {
      throw new Error(`Address with id ${id} not found`);
    }

    const updated = new UserAddressEntity({
      id: existing.id,
      userId: existing.userId,
      title: data.title ?? existing.title,
      type: data.type ?? existing.type,
      recipientFirstName: data.recipientFirstName ?? existing.recipientFirstName,
      recipientLastName: data.recipientLastName ?? existing.recipientLastName,
      recipientMobile: data.recipientMobile ?? existing.recipientMobile,
      province: data.province ?? existing.province,
      city: data.city ?? existing.city,
      detailedAddress: data.detailedAddress ?? existing.detailedAddress,
      plaque: data.plaque ?? existing.plaque,
      unit: data.unit !== undefined ? data.unit : existing.unit,
      postalCode: data.postalCode ?? existing.postalCode,
      latitude: data.latitude !== undefined ? data.latitude : existing.latitude,
      longitude: data.longitude !== undefined ? data.longitude : existing.longitude,
      deliveryNotes: data.deliveryNotes !== undefined ? data.deliveryNotes : existing.deliveryNotes,
      isDefault: data.isDefault !== undefined ? data.isDefault : existing.isDefault,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    this.addresses.set(id, updated);
    return this.clone(updated);
  }

  public async delete(id: string): Promise<boolean> {
    return this.addresses.delete(id);
  }

  public async setDefault(userId: string, addressId: string): Promise<void> {
    for (const [key, addr] of this.addresses.entries()) {
      if (addr.userId === userId) {
        addr.setDefault(key === addressId);
      }
    }
  }

  public clear(): void {
    this.addresses.clear();
  }

  private clone(entity: UserAddressEntity): UserAddressEntity {
    return new UserAddressEntity({
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      type: entity.type,
      recipientFirstName: entity.recipientFirstName,
      recipientLastName: entity.recipientLastName,
      recipientMobile: entity.recipientMobile,
      province: entity.province,
      city: entity.city,
      detailedAddress: entity.detailedAddress,
      plaque: entity.plaque,
      unit: entity.unit,
      postalCode: entity.postalCode,
      latitude: entity.latitude,
      longitude: entity.longitude,
      deliveryNotes: entity.deliveryNotes,
      isDefault: entity.isDefault,
      createdAt: new Date(entity.createdAt.getTime()),
      updatedAt: new Date(entity.updatedAt.getTime()),
    });
  }

  private seedDemoAddresses(): void {
    const users = [
      '00000000-0000-4000-a000-000000000001', // Admin
      '00000000-0000-4000-a000-000000000002', // Partner
      '00000000-0000-4000-a000-000000000003', // Customer
    ];

    for (const uId of users) {
      const addr1 = new UserAddressEntity({
        id: `00000000-0000-4000-b000-${uId.slice(-12).replace(/^[0-9]/, '1')}`,
        userId: uId,
        title: 'دفتر مرکزی / اتاق سرور',
        type: 'CENTRAL_OFFICE',
        recipientFirstName: 'مهندس عرفان',
        recipientLastName: 'رضایی',
        recipientMobile: '09121234567',
        province: 'تهران',
        city: 'تهران',
        detailedAddress: 'خیابان ولیعصر، نرسیده به میدان ونک، خیابان دامن‌افشار، پلاک ۳۴، طبقه ۵، واحد ۱۰ (دیتاسنتر)',
        plaque: '۳۴',
        unit: '۱۰',
        postalCode: '1998765432',
        deliveryNotes: 'لطفاً تحویل حراست و مهندسی شبکه داده شود.',
        isDefault: true,
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(),
      });
      this.addresses.set(addr1.id, addr1);

      const addr2 = new UserAddressEntity({
        id: `00000000-0000-4000-b000-${uId.slice(-12).replace(/^[0-9]/, '2')}`,
        userId: uId,
        title: 'سایت پروژه شهرک صنعتی',
        type: 'NETWORK_PROJECT_SITE',
        recipientFirstName: 'مهندس علی',
        recipientLastName: 'حسینی',
        recipientMobile: '09129876543',
        province: 'البرز',
        city: 'کرج',
        detailedAddress: 'شهرک صنعتی بهارستان، خیابان گلستان چهارم، پلاک ۱۲، سوله تجهیزات زیرساخت',
        plaque: '۱۲',
        unit: 'سوله اصلی',
        postalCode: '3134567890',
        deliveryNotes: 'نیاز به بالابر جهت انتقال رک‌های 42U به طبقه دوم',
        isDefault: false,
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(),
      });
      this.addresses.set(addr2.id, addr2);
    }
  }
}
