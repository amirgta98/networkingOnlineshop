import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserAddressRepository } from '../../src/infrastructure/database/in-memory/in-memory-user-address.repository.js';
import { GetUserAddressesUseCase } from '../../src/application/use-cases/address/get-user-addresses.use-case.js';
import { GetAddressByIdUseCase } from '../../src/application/use-cases/address/get-address-by-id.use-case.js';
import { CreateAddressUseCase } from '../../src/application/use-cases/address/create-address.use-case.js';
import { UpdateAddressUseCase } from '../../src/application/use-cases/address/update-address.use-case.js';
import { DeleteAddressUseCase } from '../../src/application/use-cases/address/delete-address.use-case.js';
import { SetDefaultAddressUseCase } from '../../src/application/use-cases/address/set-default-address.use-case.js';
import {
  AddressNotFoundException,
  AddressOwnershipException,
  InvalidAddressDataException,
} from '../../src/domain/exceptions/address.exceptions.js';

describe('Addresses Module Unit Tests', () => {
  let repository: InMemoryUserAddressRepository;
  let getUserAddressesUseCase: GetUserAddressesUseCase;
  let getAddressByIdUseCase: GetAddressByIdUseCase;
  let createAddressUseCase: CreateAddressUseCase;
  let updateAddressUseCase: UpdateAddressUseCase;
  let deleteAddressUseCase: DeleteAddressUseCase;
  let setDefaultAddressUseCase: SetDefaultAddressUseCase;

  const USER_A = '00000000-0000-4000-a000-000000000001';
  const USER_B = '00000000-0000-4000-a000-000000000002';

  beforeEach(() => {
    repository = new InMemoryUserAddressRepository();
    getUserAddressesUseCase = new GetUserAddressesUseCase(repository);
    getAddressByIdUseCase = new GetAddressByIdUseCase(repository);
    createAddressUseCase = new CreateAddressUseCase(repository);
    updateAddressUseCase = new UpdateAddressUseCase(repository);
    deleteAddressUseCase = new DeleteAddressUseCase(repository);
    setDefaultAddressUseCase = new SetDefaultAddressUseCase(repository);
  });

  it('should retrieve seeded addresses for demo user', async () => {
    const list = await getUserAddressesUseCase.execute(USER_A);
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0].isDefault).toBe(true);
    expect(list[0].title).toBe('دفتر مرکزی / اتاق سرور');
  });

  it('should create a new address successfully with valid data', async () => {
    const created = await createAddressUseCase.execute(USER_A, {
      title: 'شعبه اصفهان',
      type: 'CENTRAL_OFFICE',
      recipientName: 'مهندس محمودی',
      phoneNumber: '09131234567',
      province: 'اصفهان',
      city: 'اصفهان',
      address: 'خیابان چهارباغ بالا، ساختمان پارسیان',
      buildingNumber: '۲۲',
      unit: '۴',
      postalCode: '8145678901',
      deliveryNotes: 'تحویل تا ساعت ۱۶',
      isDefault: false,
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('شعبه اصفهان');
    expect(created.recipientFirstName).toBe('مهندس');
    expect(created.recipientLastName).toBe('محمودی');
    expect(created.recipientMobile).toBe('09131234567');
    expect(created.isDefault).toBe(false);

    const userAddrs = await getUserAddressesUseCase.execute(USER_A);
    expect(userAddrs.some((a) => a.id === created.id)).toBe(true);
  });

  it('should reject creating address with empty title or invalid mobile', async () => {
    await expect(
      createAddressUseCase.execute(USER_A, {
        title: '',
        recipientName: 'عرفان',
        phoneNumber: '09121234567',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ولیعصر',
        buildingNumber: '۱۰',
        postalCode: '1998765432',
      }),
    ).rejects.toThrow(InvalidAddressDataException);

    await expect(
      createAddressUseCase.execute(USER_A, {
        title: 'دفتر',
        recipientName: 'عرفان',
        phoneNumber: '0912123', // invalid phone
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ولیعصر',
        buildingNumber: '۱۰',
        postalCode: '1998765432',
      }),
    ).rejects.toThrow(InvalidAddressDataException);
  });

  it('should reject creating address with invalid postal code length', async () => {
    await expect(
      createAddressUseCase.execute(USER_A, {
        title: 'دفتر',
        recipientName: 'عرفان',
        phoneNumber: '09121234567',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ولیعصر',
        buildingNumber: '۱۰',
        postalCode: '12345', // shorter than 10 digits
      }),
    ).rejects.toThrow(InvalidAddressDataException);
  });

  it('should update default address and make others non-default', async () => {
    const list = await getUserAddressesUseCase.execute(USER_A);
    const nonDefaultAddr = list.find((a) => !a.isDefault);
    expect(nonDefaultAddr).toBeDefined();

    if (nonDefaultAddr) {
      const updated = await setDefaultAddressUseCase.execute(USER_A, nonDefaultAddr.id);
      expect(updated.isDefault).toBe(true);

      const updatedList = await getUserAddressesUseCase.execute(USER_A);
      const defaults = updatedList.filter((a) => a.isDefault);
      expect(defaults.length).toBe(1);
      expect(defaults[0].id).toBe(nonDefaultAddr.id);
    }
  });

  it('should update address fields correctly', async () => {
    const list = await getUserAddressesUseCase.execute(USER_A);
    const target = list[0];

    const updated = await updateAddressUseCase.execute(USER_A, target.id, {
      title: 'دفتر مرکزی به‌روز شده',
      buildingNumber: '۹۹',
    });

    expect(updated.title).toBe('دفتر مرکزی به‌روز شده');
    expect(updated.plaque).toBe('۹۹');
  });

  it('should throw AddressOwnershipException if user tries to access another user address', async () => {
    const userBAddresses = await getUserAddressesUseCase.execute(USER_B);
    const target = userBAddresses[0];

    await expect(getAddressByIdUseCase.execute(USER_A, target.id)).rejects.toThrow(
      AddressOwnershipException,
    );

    await expect(
      updateAddressUseCase.execute(USER_A, target.id, { title: 'تلاش هک' }),
    ).rejects.toThrow(AddressOwnershipException);

    await expect(setDefaultAddressUseCase.execute(USER_A, target.id)).rejects.toThrow(
      AddressOwnershipException,
    );

    await expect(deleteAddressUseCase.execute(USER_A, target.id)).rejects.toThrow(
      AddressOwnershipException,
    );
  });

  it('should throw AddressNotFoundException for non-existent address ID', async () => {
    await expect(
      getAddressByIdUseCase.execute(USER_A, 'non-existent-uuid'),
    ).rejects.toThrow(AddressNotFoundException);
  });

  it('should delete address and automatically promote remaining address to default if default deleted', async () => {
    const initialList = await getUserAddressesUseCase.execute(USER_A);
    const defaultAddr = initialList.find((a) => a.isDefault);
    expect(defaultAddr).toBeDefined();

    if (defaultAddr) {
      await deleteAddressUseCase.execute(USER_A, defaultAddr.id);

      const afterDeleteList = await getUserAddressesUseCase.execute(USER_A);
      expect(afterDeleteList.some((a) => a.id === defaultAddr.id)).toBe(false);
      expect(afterDeleteList.length).toBe(initialList.length - 1);
      expect(afterDeleteList[0].isDefault).toBe(true);
    }
  });

  it('should normalize residence and other address types correctly', async () => {
    const createdResidence = await createAddressUseCase.execute(USER_A, {
      title: 'خونه',
      type: 'residence',
      recipientName: 'علی رضایی',
      phoneNumber: '09132947221',
      province: 'خوزستان',
      city: 'اهواز',
      detailedAddress: 'کیانپارس خیابان شهید چمران پلاک ۲',
      plaque: '2',
      postalCode: '6145678901',
      isDefault: false,
    });

    expect(createdResidence.type).toBe('PERSONAL_RESIDENCE');
    expect(createdResidence.tag).toBe('residence');
    expect(createdResidence.tagLabel).toBe('سکونت');

    const createdWithTag = await createAddressUseCase.execute(USER_A, {
      title: 'انبار سایت',
      tag: 'warehouse',
      recipientName: 'رضا کمالی',
      phoneNumber: '09132947221',
      province: 'خوزستان',
      city: 'اهواز',
      detailedAddress: 'شهرک صنعتی اهواز بلوار صنعت',
      plaque: '10',
      postalCode: '6145678902',
      isDefault: false,
    });

    expect(createdWithTag.type).toBe('CENTRAL_WAREHOUSE');
    expect(createdWithTag.tag).toBe('warehouse');

    const createdPersianDigits = await createAddressUseCase.execute(USER_A, {
      title: 'منزل مادری',
      type: 'سکونت شخصی',
      recipientName: 'مریم حسینی',
      phoneNumber: '۰۹۱۳۲۹۴۷۲۲۱',
      province: 'خوزستان',
      city: 'اهواز',
      detailedAddress: 'زیتون کارمندی خیابان کمیل پلاک ۴',
      plaque: '۴',
      postalCode: '۶۱۴۵۶۷۸۹۰۳',
      isDefault: false,
    });

    expect(createdPersianDigits.type).toBe('PERSONAL_RESIDENCE');
    expect(createdPersianDigits.recipientMobile).toBe('09132947221');
    expect(createdPersianDigits.postalCode).toBe('6145678903');
    expect(createdPersianDigits.tag).toBe('residence');
  });
});
