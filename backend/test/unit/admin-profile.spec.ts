import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserProfileUseCase } from '../../src/application/use-cases/user/get-user-profile.use-case.js';
import { UpdateUserProfileUseCase } from '../../src/application/use-cases/user/update-user-profile.use-case.js';
import { UserController } from '../../src/presentation/controllers/user.controller.js';
import { MelipayamakConsoleOtpProvider, MelipayamakConfigurationError } from '../../src/infrastructure/sms/melipayamak-console-otp.provider.js';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserProfileRequestDto } from '../../src/presentation/dto/request/update-profile.request.dto.js';

describe('Admin Profile Management & Security (Unit)', () => {
  let mockPrisma: any;
  let getUserProfileUseCase: GetUserProfileUseCase;
  let updateUserProfileUseCase: UpdateUserProfileUseCase;
  let userController: UserController;

  const mockAdminUser = {
    id: 'admin-uuid-1234',
    name: 'مدیر ارشد آزمایشی',
    phone: '09121112233',
    email: 'admin@velox.local',
    status: 'ACTIVE',
    isActive: true,
    roles: [{ role: { name: 'admin' } }],
    profile: {
      firstName: 'امیررضا',
      lastName: 'رضایی',
      nationalCode: '0079823401',
      avatarUrl: '/uploads/avatars/admin.webp',
      bio: 'مدیر زیرساخت و سرور',
    },
    bankAccounts: [
      {
        id: 'bank-1',
        iban: 'IR120170000000123456789012',
        cardNumber: '6037991122334455',
        bankName: 'بانک سامان',
        accountHolderName: 'امیررضا رضایی',
        isDefault: true,
        isVerified: true,
      },
    ],
    notificationSettings: {
      orderShippingSms: true,
      officialInvoiceSms: true,
      newsletter: false,
      newDeviceLoginAlert: true,
    },
    organizationMemberships: [
      {
        organization: {
          id: 'org-1',
          legalName: 'شرکت فناوران شبکه',
          economicCode: 'ECO-9988',
          nationalCompanyId: '10100000000',
          registrationNumber: '456789',
          officePhone: '02188776655',
          officeAddress: 'تهران',
        },
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === mockAdminUser.id) {
            return Promise.resolve(JSON.parse(JSON.stringify(mockAdminUser)));
          }
          return Promise.resolve(null);
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockImplementation(({ where, data }) => {
          Object.assign(mockAdminUser, data);
          return Promise.resolve(mockAdminUser);
        }),
      },
      userProfile: {
        findFirst: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockImplementation(({ create, update }) => {
          mockAdminUser.profile = { ...mockAdminUser.profile, ...update };
          return Promise.resolve(mockAdminUser.profile);
        }),
      },
      userBankAccount: {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      userNotificationSettings: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      organization: {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({ id: 'new-org' }),
      },
      organizationMember: {
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
    };

    getUserProfileUseCase = new GetUserProfileUseCase(mockPrisma);
    updateUserProfileUseCase = new UpdateUserProfileUseCase(mockPrisma, getUserProfileUseCase);

    const dummyUseCases = Array(23).fill({} as any);
    userController = new UserController(
      ...dummyUseCases,
      getUserProfileUseCase,
      updateUserProfileUseCase,
      {} as any,
      {} as any,
      mockPrisma,
    );
  });

  describe('Admin Profile Retrieval', () => {
    it('retrieves the authenticated admin profile using session token user ID', async () => {
      const mockReq = { user: { sub: 'admin-uuid-1234', role: 'admin', phone: '09121112233' } };
      const profile = await userController.getMyProfile(mockReq);

      expect(profile).toBeDefined();
      expect(profile.id).toBe('admin-uuid-1234');
      expect(profile.fullName).toBe('مدیر ارشد آزمایشی');
      expect(profile.firstName).toBe('امیررضا');
      expect(profile.lastName).toBe('رضایی');
      expect(profile.mobileNumber).toBe('09121112233');
      expect(profile.email).toBe('admin@velox.local');
    });

    it('rejects retrieval if authenticated user context is missing', async () => {
      const emptyReq = { user: undefined };
      await expect(userController.getMyProfile(emptyReq)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Admin Profile Update Security & Isolation', () => {
    it('updates editable fields successfully (name, phone, email, bio)', async () => {
      const mockReq = { user: { sub: 'admin-uuid-1234', role: 'admin' } };
      const dto = {
        fullName: 'امیررضا رضایی جدید',
        firstName: 'امیررضا',
        lastName: 'رضایی جدید',
        email: 'new.admin@velox.local',
        phone: '09129998877',
        bio: 'توضیحات جدید پروفایل مدیر',
      };

      const result = await userController.updateMyProfile(mockReq, dto as any);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'admin-uuid-1234' },
          data: expect.objectContaining({
            name: 'امیررضا رضایی جدید',
            email: 'new.admin@velox.local',
            phone: '09129998877',
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('never allows tampering with privileged fields like role or permissions', async () => {
      const mockReq = { user: { sub: 'admin-uuid-1234', role: 'admin' } };
      // Attacker attempts to inject privileged fields in the payload
      const maliciousDto: any = {
        fullName: 'تست نام',
        role: 'super_admin_god_mode',
        status: 'BANNED',
        isActive: false,
        permissions: ['*'],
      };

      await userController.updateMyProfile(mockReq, maliciousDto);

      // Verify that user.update only receives safe fields and NOT role, status, or permissions
      const updateCall = mockPrisma.user.update.mock.calls[0][0];
      expect(updateCall.data.role).toBeUndefined();
      expect(updateCall.data.status).toBeUndefined();
      expect(updateCall.data.isActive).toBeUndefined();
      expect(updateCall.data.permissions).toBeUndefined();
    });

    it('ignores client-supplied user ID and strictly uses the server authentication context', async () => {
      const mockReq = { user: { sub: 'admin-uuid-1234', role: 'admin' } };
      // Attempting to target another user ID
      const spoofDto: any = {
        userId: 'victim-user-id-5678',
        id: 'victim-user-id-5678',
        fullName: 'هک شده',
      };

      await userController.updateMyProfile(mockReq, spoofDto);

      // Prisma must be invoked with admin-uuid-1234 from req.user, NOT victim-user-id-5678
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'admin-uuid-1234' },
        }),
      );
    });

    it('rejects update if phone number is already registered to another account', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'other-user-uuid', phone: '09120000000' });

      const mockReq = { user: { sub: 'admin-uuid-1234', role: 'admin' } };
      const dto = {
        phone: '09120000000',
      };

      await expect(userController.updateMyProfile(mockReq, dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('UpdateUserProfileRequestDto Sheba & Optional Fields Validation', () => {
    it('accepts payload when shebaNumber is empty string without throwing validation error', async () => {
      const dto = plainToInstance(UpdateUserProfileRequestDto, {
        fullName: 'مدیر آزمایشی',
        shebaNumber: '',
      });
      const errors = await validate(dto);
      const shebaErrors = errors.filter((e) => e.property === 'shebaNumber');
      expect(shebaErrors.length).toBe(0);
    });

    it('accepts payload when shebaNumber is undefined or omitted', async () => {
      const dto = plainToInstance(UpdateUserProfileRequestDto, {
        fullName: 'مدیر آزمایشی',
      });
      const errors = await validate(dto);
      const shebaErrors = errors.filter((e) => e.property === 'shebaNumber');
      expect(shebaErrors.length).toBe(0);
    });

    it('accepts payload when valid 24-digit sheba (with or without IR) is provided', async () => {
      const dto1 = plainToInstance(UpdateUserProfileRequestDto, {
        fullName: 'همکار فروشگاه',
        shebaNumber: 'IR120170000000123456789012',
      });
      const errors1 = await validate(dto1);
      expect(errors1.filter((e) => e.property === 'shebaNumber').length).toBe(0);

      const dto2 = plainToInstance(UpdateUserProfileRequestDto, {
        fullName: 'همکار فروشگاه',
        shebaNumber: '120170000000123456789012',
      });
      const errors2 = await validate(dto2);
      expect(errors2.filter((e) => e.property === 'shebaNumber').length).toBe(0);
    });

    it('rejects payload when invalid non-empty sheba is provided', async () => {
      const dto = plainToInstance(UpdateUserProfileRequestDto, {
        fullName: 'همکار فروشگاه',
        shebaNumber: '123456',
      });
      const errors = await validate(dto);
      const shebaErrors = errors.filter((e) => e.property === 'shebaNumber');
      expect(shebaErrors.length).toBeGreaterThan(0);
      expect(shebaErrors[0].constraints?.matches).toContain('شماره شبا باید ۲۴ رقم معتبر');
    });

    it('accepts payload when empty string is provided for nationalCode, phone, or email', async () => {
      const dto = plainToInstance(UpdateUserProfileRequestDto, {
        fullName: 'مدیر آزمایشی',
        nationalCode: '',
        phone: '',
        email: '',
      });
      const errors = await validate(dto);
      expect(errors.filter((e) => e.property === 'nationalCode').length).toBe(0);
      expect(errors.filter((e) => e.property === 'phone').length).toBe(0);
      expect(errors.filter((e) => e.property === 'email').length).toBe(0);
    });
  });

  describe('SMS Configuration Verification', () => {
    it('throws MelipayamakConfigurationError if API key is missing or empty', () => {
      expect(() => new MelipayamakConsoleOtpProvider({ otpToken: '' })).toThrow(MelipayamakConfigurationError);

      const oldKey = process.env.MELIPAYAMAK_OTP_API_KEY;
      delete process.env.MELIPAYAMAK_OTP_API_KEY;
      delete process.env.MELIPAYAMAK_API_KEY;
      delete process.env.MELIPAYAMAK_OTP_TOKEN;
      try {
        expect(() => new MelipayamakConsoleOtpProvider()).toThrow(MelipayamakConfigurationError);
      } finally {
        if (oldKey) process.env.MELIPAYAMAK_OTP_API_KEY = oldKey;
      }
    });

    it('instantiates successfully when valid API key is provided', () => {
      const provider = new MelipayamakConsoleOtpProvider({ otpToken: 'dummy_safe_key_123' });
      expect(provider.isConfigured()).toBe(true);
      expect(provider.isUsingBuiltInCredentials).toBe(false);
    });
  });
});
