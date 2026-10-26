import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import { UpdateUserProfileRequestDto } from '../../../presentation/dto/request/update-profile.request.dto.js';
import { UserProfileResponseDto } from '../../../presentation/dto/response/user-profile.response.dto.js';
import { GetUserProfileUseCase } from './get-user-profile.use-case.js';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getProfileUseCase: GetUserProfileUseCase,
  ) {}

  async execute(userId: string, dto: UpdateUserProfileRequestDto): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        bankAccounts: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        notificationSettings: true,
        organizationMemberships: {
          include: { organization: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 1. If nationalCode provided, ensure uniqueness if changed
    if (dto.nationalCode) {
      const existingWithNational = await this.prisma.userProfile.findFirst({
        where: {
          nationalCode: dto.nationalCode,
          userId: { not: userId },
        },
      });
      if (existingWithNational) {
        throw new BadRequestException('این کد ملی قبلاً برای حساب کاربری دیگری ثبت شده است.');
      }
    }

    // 2. If email provided, ensure uniqueness if changed
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          id: { not: userId },
        },
      });
      if (existingEmail) {
        throw new BadRequestException('این ایمیل قبلاً برای حساب کاربری دیگری ثبت شده است.');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // 3. Update User basic info
      const updateUserData: any = { updatedAt: new Date() };
      if (dto.fullName) updateUserData.name = dto.fullName.trim();
      if (dto.email) updateUserData.email = dto.email.trim();

      await tx.user.update({
        where: { id: userId },
        data: updateUserData,
      });

      // 4. Upsert UserProfile
      let first = dto.firstName;
      let last = dto.lastName;
      if (!first && !last && dto.fullName) {
        const parts = dto.fullName.trim().split(/\s+/);
        first = parts[0];
        last = parts.slice(1).join(' ');
      }

      const profileUpdateData: any = {
        updatedAt: new Date(),
      };
      if (first !== undefined) profileUpdateData.firstName = first;
      if (last !== undefined) profileUpdateData.lastName = last;
      if (dto.nationalCode !== undefined) profileUpdateData.nationalCode = dto.nationalCode;
      if (dto.bio !== undefined) profileUpdateData.bio = dto.bio;

      await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          firstName: first || null,
          lastName: last || null,
          nationalCode: dto.nationalCode || null,
          bio: dto.bio || null,
        },
        update: profileUpdateData,
      });

      // 5. Upsert UserBankAccount if Sheba or Card provided
      if (dto.shebaNumber || dto.cardNumber) {
        let cleanIban = dto.shebaNumber ? dto.shebaNumber.trim().toUpperCase() : undefined;
        if (cleanIban && !cleanIban.startsWith('IR')) cleanIban = `IR${cleanIban}`;

        let cleanCard = dto.cardNumber
          ? dto.cardNumber.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776)).replace(/[\s-]/g, '').replace(/\D/g, '')
          : undefined;

        const existingBank = user.bankAccounts?.[0];
        if (existingBank) {
          const updateData: any = {
            updatedAt: new Date(),
          };
          if (cleanIban) updateData.iban = cleanIban;
          if (cleanCard) updateData.cardNumber = cleanCard;
          if (dto.bankName) updateData.bankName = dto.bankName;
          if (dto.accountHolderName || dto.fullName) {
            updateData.accountHolderName = dto.accountHolderName || dto.fullName;
          }

          await tx.userBankAccount.update({
            where: { id: existingBank.id },
            data: updateData,
          });
        } else {
          await tx.userBankAccount.create({
            data: {
              userId,
              iban: cleanIban || 'IR000000000000000000000000',
              cardNumber: cleanCard || null,
              bankName: dto.bankName || 'بانک مقصد',
              accountHolderName: dto.accountHolderName || dto.fullName || user.name,
              isDefault: true,
            },
          });
        }
      }

      // 6. Upsert NotificationSettings
      if (dto.preferences) {
        const prefs = dto.preferences;
        await tx.userNotificationSettings.upsert({
          where: { userId },
          create: {
            userId,
            orderShippingSms: prefs.smsOnOrderUpdates ?? true,
            officialInvoiceSms: prefs.smsOnInvoiceReady ?? true,
            newsletter: prefs.newsletterSubscribed ?? false,
            newDeviceLoginAlert: prefs.twoFactorLoginNotify ?? true,
          },
          update: {
            orderShippingSms: prefs.smsOnOrderUpdates,
            officialInvoiceSms: prefs.smsOnInvoiceReady,
            newsletter: prefs.newsletterSubscribed,
            newDeviceLoginAlert: prefs.twoFactorLoginNotify,
            updatedAt: new Date(),
          },
        });
      }

      // 7. Upsert Organization if corporate info provided
      if (dto.companyName || dto.economicCode || dto.companyNationalId) {
        const existingOrg = user.organizationMemberships?.[0]?.organization;
        const legalName = dto.companyName || existingOrg?.legalName || 'شرکت ثبت شده';
        const economicCode = dto.economicCode || existingOrg?.economicCode || `ECO-${Date.now()}`;
        const nationalCompanyId = dto.companyNationalId || existingOrg?.nationalCompanyId || '10100000000';

        if (existingOrg) {
          await tx.organization.update({
            where: { id: existingOrg.id },
            data: {
              legalName,
              economicCode,
              nationalCompanyId,
              registrationNumber: dto.registrationNumber || existingOrg.registrationNumber,
              officePhone: dto.companyPhone || existingOrg.officePhone,
              officeAddress: dto.companyAddress || existingOrg.officeAddress,
            },
          });
        } else {
          const newOrg = await tx.organization.create({
            data: {
              legalName,
              economicCode,
              nationalCompanyId,
              registrationNumber: dto.registrationNumber || '0',
              officePhone: dto.companyPhone || '02100000000',
              officeAddress: dto.companyAddress || 'تهران',
            },
          });

          await tx.organizationMember.create({
            data: {
              organizationId: newOrg.id,
              userId,
              role: 'OWNER',
            },
          });
        }
      }
    });

    return this.getProfileUseCase.execute(userId);
  }
}
