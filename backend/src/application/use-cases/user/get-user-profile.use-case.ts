import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import { UserProfileResponseDto } from '../../../presentation/dto/response/user-profile.response.dto.js';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<UserProfileResponseDto> {
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
          include: {
            organization: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const org = user.organizationMemberships?.[0]?.organization;
    const bank = user.bankAccounts?.[0];
    const notif = user.notificationSettings;

    return {
      id: user.id,
      fullName: user.name || (user.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : user.name),
      firstName: user.profile?.firstName ?? undefined,
      lastName: user.profile?.lastName ?? undefined,
      nationalCode: user.profile?.nationalCode ?? undefined,
      mobileNumber: user.phone ?? '',
      email: user.email ?? '',
      avatarUrl: user.profile?.avatarUrl ?? null,
      bio: user.profile?.bio ?? null,

      // Company / B2B info
      companyName: org?.legalName || org?.brandName || null,
      economicCode: org?.economicCode ?? null,
      companyNationalId: org?.nationalCompanyId ?? null,
      registrationNumber: org?.registrationNumber ?? null,
      companyPhone: org?.officePhone ?? null,
      companyAddress: org?.officeAddress ?? null,

      // Bank account (Sheba)
      shebaNumber: bank?.iban ? (bank.iban.startsWith('IR') ? bank.iban : `IR${bank.iban}`) : '',
      bankName: bank?.bankName ?? '',
      accountHolderName: bank?.accountHolderName ?? user.name,
      isShebaVerified: bank?.isVerified ?? false,

      // Notification preferences
      preferences: {
        smsOnOrderUpdates: notif?.orderShippingSms ?? true,
        smsOnInvoiceReady: notif?.officialInvoiceSms ?? true,
        newsletterSubscribed: notif?.newsletter ?? false,
        twoFactorLoginNotify: notif?.newDeviceLoginAlert ?? true,
      },
    };
  }
}
