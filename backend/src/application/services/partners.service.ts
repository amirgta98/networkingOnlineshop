import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import {
  PartnerApplicationType,
  PartnerApplicationStatus,
  PartnerTier,
  OrganizationStatus,
  OrganizationMemberRole,
  Prisma,
} from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class PartnerDocumentDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsOptional()
  fileSize?: string;

  @IsString()
  @IsOptional()
  uploadedAt?: string;
}

export class SubmitPartnerApplicationDto {
  @IsEnum(PartnerApplicationType)
  applicantType!: PartnerApplicationType;

  // Common Identity & Contact
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  landlinePhone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  // Business & Activity
  @IsString()
  @IsNotEmpty()
  fieldOfActivity!: string;

  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @IsNumber()
  @IsOptional()
  estimatedMonthlyPurchase?: number;

  @IsNumber()
  @IsOptional()
  requestedCreditLimit?: number;

  @IsString()
  @IsOptional()
  websiteOrSocial?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Individual specific (شخص حقیقی)
  @IsString()
  @IsOptional()
  nationalCode?: string;

  @IsString()
  @IsOptional()
  tradeName?: string;

  @IsString()
  @IsOptional()
  businessLicenseNumber?: string;

  // Company specific (شخص حقوقی)
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyType?: string;

  @IsString()
  @IsOptional()
  nationalCompanyId?: string;

  @IsString()
  @IsOptional()
  economicCode?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  establishedYear?: string;

  @IsString()
  @IsOptional()
  ceoOrAgentName?: string;

  @IsString()
  @IsOptional()
  agentPosition?: string;

  // Documents
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerDocumentDto)
  @IsOptional()
  documents?: PartnerDocumentDto[];

  @IsString()
  @IsOptional()
  officialGazetteFileUrl?: string;

  @IsString()
  @IsOptional()
  officialGazetteFileName?: string;

  @IsString()
  @IsOptional()
  taxClearanceFileUrl?: string;

  @IsString()
  @IsOptional()
  taxClearanceFileName?: string;
}

export class UpgradeRequestDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  nationalCompanyId!: string;

  @IsString()
  @IsNotEmpty()
  economicCode!: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsNotEmpty()
  fieldOfActivity!: string;

  @IsNumber()
  @IsOptional()
  requestedCreditLimit?: number;

  @IsString()
  @IsOptional()
  officialGazetteFileUrl?: string;

  @IsString()
  @IsOptional()
  officialGazetteFileName?: string;

  @IsString()
  @IsOptional()
  taxClearanceFileUrl?: string;

  @IsString()
  @IsOptional()
  taxClearanceFileName?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  landlinePhone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  companyType?: string;

  @IsString()
  @IsOptional()
  establishedYear?: string;

  @IsString()
  @IsOptional()
  ceoOrAgentName?: string;

  @IsString()
  @IsOptional()
  agentPosition?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerDocumentDto)
  @IsOptional()
  documents?: PartnerDocumentDto[];
}

export class UpdatePartnerStatusDto {
  @IsEnum(PartnerApplicationStatus)
  status!: PartnerApplicationStatus;

  @IsEnum(PartnerTier)
  @IsOptional()
  tier?: PartnerTier;

  @IsNumber()
  @IsOptional()
  approvedCreditLimit?: number;

  @IsString()
  @IsOptional()
  assignedAccountManager?: string;

  @IsString()
  @IsOptional()
  reviewerNotes?: string;
}

export class AdminPartnersFilterDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  applicantType?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapApplicationToDto(app: any) {
    if (!app) return null;
    // Sanitize documents
    let documents: any[] = [];
    if (Array.isArray(app.documents)) {
      documents = app.documents
        .flat()
        .filter((d: any) => d && typeof d === 'object' && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl));
    } else if (typeof app.documents === 'string') {
      try {
        const parsed = JSON.parse(app.documents);
        if (Array.isArray(parsed)) {
          documents = parsed
            .flat()
            .filter((d: any) => d && typeof d === 'object' && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl));
        }
      } catch {
        documents = [];
      }
    }

    // Ensure official gazette & tax clearance exist in documents list
    if (app.officialGazetteFileUrl && !documents.some((d: any) => d.type === 'official_gazette' || d.fileUrl === app.officialGazetteFileUrl)) {
      documents.push({
        id: 'doc-official-gazette',
        title: 'روزنامه رسمی آگهی تأسیس یا آخرین تغییرات',
        fileName: app.officialGazetteFileName || 'official_gazette.pdf',
        fileUrl: app.officialGazetteFileUrl,
        type: 'official_gazette',
        uploadedAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString('fa-IR') : undefined,
      });
    }

    if (app.taxClearanceFileUrl && !documents.some((d: any) => d.type === 'tax_certificate' || d.type === 'tax_clearance' || d.fileUrl === app.taxClearanceFileUrl)) {
      documents.push({
        id: 'doc-tax-clearance',
        title: 'گواهی ثبت‌نام ارزش افزوده یا مفاصا حساب مالیاتی',
        fileName: app.taxClearanceFileName || 'tax_clearance.pdf',
        fileUrl: app.taxClearanceFileUrl,
        type: 'tax_certificate',
        uploadedAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString('fa-IR') : undefined,
      });
    }

    return {
      id: app.id,
      userId: app.userId,
      applicantType: app.applicantType,
      fullName: app.fullName,
      phone: app.phone,
      landlinePhone: app.landlinePhone,
      email: app.email,
      province: app.province,
      city: app.city,
      address: app.address,
      postalCode: app.postalCode,
      fieldOfActivity: app.fieldOfActivity,
      experienceYears: app.experienceYears,
      estimatedMonthlyPurchase: Number(app.estimatedMonthlyPurchase ?? 0),
      requestedCreditLimit: Number(app.requestedCreditLimit ?? 0),
      websiteOrSocial: app.websiteOrSocial,
      notes: app.notes,
      nationalCode: app.nationalCode,
      tradeName: app.tradeName,
      businessLicenseNumber: app.businessLicenseNumber,
      companyName: app.companyName,
      companyType: app.companyType,
      nationalCompanyId: app.nationalCompanyId,
      economicCode: app.economicCode,
      registrationNumber: app.registrationNumber,
      establishedYear: app.establishedYear,
      ceoOrAgentName: app.ceoOrAgentName,
      agentPosition: app.agentPosition,
      officialGazetteFileUrl: app.officialGazetteFileUrl || documents.find((d: any) => d.type === 'official_gazette')?.fileUrl || null,
      officialGazetteFileName: app.officialGazetteFileName || documents.find((d: any) => d.type === 'official_gazette')?.fileName || null,
      taxClearanceFileUrl: app.taxClearanceFileUrl || documents.find((d: any) => d.type === 'tax_certificate' || d.type === 'tax_clearance')?.fileUrl || null,
      taxClearanceFileName: app.taxClearanceFileName || documents.find((d: any) => d.type === 'tax_certificate' || d.type === 'tax_clearance')?.fileName || null,
      documents,
      status: app.status,
      tier: app.tier,
      approvedCreditLimit: Number(app.approvedCreditLimit ?? 0),
      usedCredit: Number(app.usedCredit ?? 0),
      assignedAccountManager: app.assignedAccountManager,
      reviewerNotes: app.reviewerNotes,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      reviewedBy: app.reviewedBy,
      submittedAt: app.createdAt?.toISOString() || null,
      createdAt: app.createdAt?.toISOString() || null,
      updatedAt: app.updatedAt?.toISOString() || null,
      user: app.user ? {
        id: app.user.id,
        name: app.user.name,
        phone: app.user.phone,
        email: app.user.email,
      } : undefined,
    };
  }

  // ─── User API ────────────────────────────────────────────────────────

  async getMyApplication(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر مورد نظر یافت نشد.');
    }

    const application = await this.prisma.partnerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: {
        organization: true,
      },
    });

    const roleCodes = user.roles.map((r) => r.role.code.toUpperCase());
    const isPartner =
      roleCodes.includes('PARTNER_B2B') ||
      roleCodes.includes('PARTNER') ||
      application?.status === PartnerApplicationStatus.APPROVED ||
      membership?.organization?.status === OrganizationStatus.VERIFIED;

    return {
      application: this.mapApplicationToDto(application),
      organization: membership?.organization || null,
      isPartner,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        roles: roleCodes,
      },
    };
  }

  async submitApplication(userId: string, dto: SubmitPartnerApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد.');
    }

    // Check if an existing application exists
    const existing = await this.prisma.partnerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const cleanDocuments = Array.isArray(dto.documents)
      ? dto.documents
          .flat()
          .filter((d: any) => d && typeof d === 'object' && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl))
          .map((d: any) => ({
            id: d.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: String(d.title || '').trim(),
            fileName: String(d.fileName || '').trim(),
            fileUrl: String(d.fileUrl || '').trim(),
            type: String(d.type || '').trim(),
            fileSize: d.fileSize ? String(d.fileSize) : undefined,
            uploadedAt: d.uploadedAt ? String(d.uploadedAt) : new Date().toLocaleDateString('fa-IR'),
          }))
      : [];

    let officialGazetteUrl = dto.officialGazetteFileUrl?.trim() || null;
    let officialGazetteName = dto.officialGazetteFileName?.trim() || null;
    let taxClearanceUrl = dto.taxClearanceFileUrl?.trim() || null;
    let taxClearanceName = dto.taxClearanceFileName?.trim() || null;

    for (const d of cleanDocuments) {
      if (d.type === 'official_gazette') {
        officialGazetteUrl = officialGazetteUrl || d.fileUrl;
        officialGazetteName = officialGazetteName || d.fileName;
      } else if (d.type === 'tax_certificate' || d.type === 'tax_clearance') {
        taxClearanceUrl = taxClearanceUrl || d.fileUrl;
        taxClearanceName = taxClearanceName || d.fileName;
      }
    }

    const dataPayload = {
      applicantType: dto.applicantType,
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      landlinePhone: dto.landlinePhone?.trim() || null,
      email: dto.email?.trim() || null,
      province: dto.province.trim(),
      city: dto.city.trim(),
      address: dto.address.trim(),
      postalCode: dto.postalCode?.trim() || null,
      fieldOfActivity: dto.fieldOfActivity.trim(),
      experienceYears: dto.experienceYears ?? 1,
      estimatedMonthlyPurchase: BigInt(dto.estimatedMonthlyPurchase ?? 0),
      requestedCreditLimit: BigInt(dto.requestedCreditLimit ?? 0),
      websiteOrSocial: dto.websiteOrSocial?.trim() || null,
      notes: dto.notes?.trim() || null,

      // Individual
      nationalCode: dto.nationalCode?.trim() || null,
      tradeName: dto.tradeName?.trim() || null,
      businessLicenseNumber: dto.businessLicenseNumber?.trim() || null,

      // Company
      companyName: dto.companyName?.trim() || null,
      companyType: dto.companyType?.trim() || null,
      nationalCompanyId: dto.nationalCompanyId?.trim() || null,
      economicCode: dto.economicCode?.trim() || null,
      registrationNumber: dto.registrationNumber?.trim() || null,
      establishedYear: dto.establishedYear?.trim() || null,
      ceoOrAgentName: dto.ceoOrAgentName?.trim() || null,
      agentPosition: dto.agentPosition?.trim() || null,

      officialGazetteFileUrl: officialGazetteUrl,
      officialGazetteFileName: officialGazetteName,
      taxClearanceFileUrl: taxClearanceUrl,
      taxClearanceFileName: taxClearanceName,

      documents: cleanDocuments,
      status: PartnerApplicationStatus.PENDING,
    };

    let result;
    if (existing && existing.status !== PartnerApplicationStatus.APPROVED) {
      result = await this.prisma.partnerApplication.update({
        where: { id: existing.id },
        data: {
          ...dataPayload,
          reviewerNotes: null,
          reviewedAt: null,
          reviewedBy: null,
        },
      });
      this.logger.log(`Updated partner application ${existing.id} for user ${userId}`);
    } else {
      result = await this.prisma.partnerApplication.create({
        data: {
          ...dataPayload,
          userId,
        },
      });
      this.logger.log(`Created new partner application ${result.id} for user ${userId}`);
    }

    // If company application, sync with Organization
    if (dto.applicantType === PartnerApplicationType.COMPANY && (dto.companyName || dto.nationalCompanyId)) {
      try {
        await this.syncOrganization(userId, {
          companyName: dto.companyName || dto.fullName,
          nationalCompanyId: dto.nationalCompanyId,
          economicCode: dto.economicCode,
          registrationNumber: dto.registrationNumber,
          fieldOfActivity: dto.fieldOfActivity,
          requestedCreditLimit: dto.requestedCreditLimit,
          companyType: dto.companyType,
          establishedYear: dto.establishedYear,
          officeAddress: dto.address,
          officePhone: dto.landlinePhone || dto.phone,
          postalCode: dto.postalCode,
          officialGazetteFileUrl: officialGazetteUrl,
          officialGazetteFileName: officialGazetteName,
          taxClearanceFileUrl: taxClearanceUrl,
          taxClearanceFileName: taxClearanceName,
          agentPosition: dto.agentPosition,
        });
      } catch (orgErr) {
        this.logger.error(`Failed to sync organization for user ${userId}:`, orgErr);
      }
    }

    return this.mapApplicationToDto(result);
  }

  async upgradeRequest(userId: string, dto: UpgradeRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد.');
    }

    let officialGazetteUrl = dto.officialGazetteFileUrl?.trim() || null;
    let officialGazetteName = dto.officialGazetteFileName?.trim() || null;
    let taxClearanceUrl = dto.taxClearanceFileUrl?.trim() || null;
    let taxClearanceName = dto.taxClearanceFileName?.trim() || null;

    if (Array.isArray(dto.documents)) {
      for (const doc of dto.documents) {
        if (doc.type === 'official_gazette') {
          officialGazetteUrl = officialGazetteUrl || doc.fileUrl;
          officialGazetteName = officialGazetteName || doc.fileName;
        } else if (doc.type === 'tax_certificate' || doc.type === 'tax_clearance') {
          taxClearanceUrl = taxClearanceUrl || doc.fileUrl;
          taxClearanceName = taxClearanceName || doc.fileName;
        }
      }
    }

    // 1. Sync or Create Organization
    const organization = await this.syncOrganization(userId, {
      companyName: dto.companyName,
      nationalCompanyId: dto.nationalCompanyId,
      economicCode: dto.economicCode,
      registrationNumber: dto.registrationNumber,
      fieldOfActivity: dto.fieldOfActivity,
      requestedCreditLimit: dto.requestedCreditLimit,
      companyType: dto.companyType,
      establishedYear: dto.establishedYear,
      officeAddress: dto.address,
      officePhone: dto.landlinePhone || dto.phone,
      postalCode: dto.postalCode,
      officialGazetteFileUrl: officialGazetteUrl,
      officialGazetteFileName: officialGazetteName,
      taxClearanceFileUrl: taxClearanceUrl,
      taxClearanceFileName: taxClearanceName,
      agentPosition: dto.agentPosition,
    });

    // 2. Synchronize with PartnerApplication for complete admin view and workflow
    const cleanDocuments = Array.isArray(dto.documents)
      ? dto.documents
          .flat()
          .filter((d: any) => d && typeof d === 'object' && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl))
          .map((d: any) => ({
            id: d.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: String(d.title || '').trim(),
            fileName: String(d.fileName || '').trim(),
            fileUrl: String(d.fileUrl || '').trim(),
            type: String(d.type || '').trim(),
            fileSize: d.fileSize ? String(d.fileSize) : undefined,
            uploadedAt: d.uploadedAt ? String(d.uploadedAt) : new Date().toLocaleDateString('fa-IR'),
          }))
      : [];

    if (officialGazetteUrl && !cleanDocuments.some((d) => d.type === 'official_gazette')) {
      cleanDocuments.push({
        id: `doc-${Date.now()}-og`,
        title: 'روزنامه رسمی آگهی تأسیس یا آخرین تغییرات',
        fileName: officialGazetteName || 'official_gazette.pdf',
        fileUrl: officialGazetteUrl,
        type: 'official_gazette',
        fileSize: undefined,
        uploadedAt: new Date().toLocaleDateString('fa-IR'),
      });
    }

    if (taxClearanceUrl && !cleanDocuments.some((d) => d.type === 'tax_certificate' || d.type === 'tax_clearance')) {
      cleanDocuments.push({
        id: `doc-${Date.now()}-tc`,
        title: 'گواهی ثبت‌نام ارزش افزوده یا مفاصا حساب مالیاتی',
        fileName: taxClearanceName || 'tax_clearance.pdf',
        fileUrl: taxClearanceUrl,
        type: 'tax_certificate',
        fileSize: undefined,
        uploadedAt: new Date().toLocaleDateString('fa-IR'),
      });
    }

    const existingApp = await this.prisma.partnerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const partnerAppData = {
      applicantType: PartnerApplicationType.COMPANY,
      fullName: (dto.fullName || dto.ceoOrAgentName || user.name || dto.companyName).trim(),
      phone: (dto.phone || user.phone || '').trim(),
      landlinePhone: dto.landlinePhone?.trim() || null,
      email: dto.email?.trim() || user.email || null,
      province: dto.province?.trim() || 'تهران',
      city: dto.city?.trim() || 'تهران',
      address: (dto.address || 'آدرس درج نشده').trim(),
      postalCode: dto.postalCode?.trim() || null,
      fieldOfActivity: dto.fieldOfActivity.trim(),
      requestedCreditLimit: BigInt(dto.requestedCreditLimit ?? 0),
      companyName: dto.companyName.trim(),
      companyType: dto.companyType?.trim() || null,
      nationalCompanyId: dto.nationalCompanyId.trim(),
      economicCode: dto.economicCode.trim(),
      registrationNumber: dto.registrationNumber?.trim() || null,
      establishedYear: dto.establishedYear?.trim() || null,
      ceoOrAgentName: dto.ceoOrAgentName?.trim() || null,
      agentPosition: dto.agentPosition?.trim() || null,
      officialGazetteFileUrl: officialGazetteUrl,
      officialGazetteFileName: officialGazetteName,
      taxClearanceFileUrl: taxClearanceUrl,
      taxClearanceFileName: taxClearanceName,
      documents: cleanDocuments,
      status: PartnerApplicationStatus.PENDING,
    };

    let savedApp;
    if (existingApp && existingApp.status !== PartnerApplicationStatus.APPROVED) {
      savedApp = await this.prisma.partnerApplication.update({
        where: { id: existingApp.id },
        data: partnerAppData,
      });
    } else {
      savedApp = await this.prisma.partnerApplication.create({
        data: {
          ...partnerAppData,
          userId,
        },
      });
    }

    return {
      organization,
      application: this.mapApplicationToDto(savedApp),
    };
  }

  private async syncOrganization(userId: string, data: any) {
    const existingMembership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

    const requestedCredit = data.requestedCreditLimit ? new Prisma.Decimal(data.requestedCreditLimit) : new Prisma.Decimal(0);

    if (existingMembership) {
      return this.prisma.organization.update({
        where: { id: existingMembership.organizationId },
        data: {
          legalName: (data.companyName || existingMembership.organization.legalName).trim(),
          nationalCompanyId: (data.nationalCompanyId || existingMembership.organization.nationalCompanyId)?.trim() || null,
          economicCode: (data.economicCode || existingMembership.organization.economicCode)?.trim() || null,
          registrationNumber: (data.registrationNumber || existingMembership.organization.registrationNumber)?.trim() || null,
          fieldOfActivity: (data.fieldOfActivity || existingMembership.organization.fieldOfActivity)?.trim() || null,
          companyType: (data.companyType || existingMembership.organization.companyType)?.trim() || null,
          establishedYear: (data.establishedYear || existingMembership.organization.establishedYear)?.trim() || null,
          officeAddress: (data.officeAddress || existingMembership.organization.officeAddress)?.trim() || null,
          officePhone: (data.officePhone || existingMembership.organization.officePhone)?.trim() || null,
          postalCode: (data.postalCode || existingMembership.organization.postalCode)?.trim() || null,
          requestedCreditLimit: requestedCredit,
          officialGazetteFileUrl: data.officialGazetteFileUrl || existingMembership.organization.officialGazetteFileUrl,
          officialGazetteFileName: data.officialGazetteFileName || existingMembership.organization.officialGazetteFileName,
          taxClearanceFileUrl: data.taxClearanceFileUrl || existingMembership.organization.taxClearanceFileUrl,
          taxClearanceFileName: data.taxClearanceFileName || existingMembership.organization.taxClearanceFileName,
          status: OrganizationStatus.PENDING_VERIFICATION,
        },
      });
    } else {
      return this.prisma.organization.create({
        data: {
          legalName: (data.companyName || 'سازمان همکار').trim(),
          nationalCompanyId: data.nationalCompanyId?.trim() || null,
          economicCode: data.economicCode?.trim() || null,
          registrationNumber: data.registrationNumber?.trim() || null,
          fieldOfActivity: data.fieldOfActivity?.trim() || null,
          companyType: data.companyType?.trim() || null,
          establishedYear: data.establishedYear?.trim() || null,
          officeAddress: data.officeAddress?.trim() || null,
          officePhone: data.officePhone?.trim() || null,
          postalCode: data.postalCode?.trim() || null,
          requestedCreditLimit: requestedCredit,
          officialGazetteFileUrl: data.officialGazetteFileUrl || null,
          officialGazetteFileName: data.officialGazetteFileName || null,
          taxClearanceFileUrl: data.taxClearanceFileUrl || null,
          taxClearanceFileName: data.taxClearanceFileName || null,
          status: OrganizationStatus.PENDING_VERIFICATION,
          members: {
            create: {
              userId,
              role: OrganizationMemberRole.OWNER,
              title: data.agentPosition || 'مدیرعامل / نماینده رسمی',
            },
          },
        },
      });
    }
  }

  async uploadDocument(file: UploadedMulterFile) {
    if (!file) {
      throw new BadRequestException('هیچ فایلی برای آپلود ارسال نشده است.');
    }

    if (file.size > 15 * 1024 * 1024) {
      throw new BadRequestException('حجم فایل ارسالی بیش از ۱۵ مگابایت است.');
    }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const originalExt = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(originalExt)) {
      throw new BadRequestException(
        `فرمت فایل نامعتبر است. تنها فرمت‌های مجاز عبارتند از: ${allowedExtensions.join(', ')}`,
      );
    }

    const uploadsBase = fs.existsSync(path.resolve(process.cwd(), 'backend'))
      ? path.resolve(process.cwd(), 'backend', 'uploads')
      : path.resolve(process.cwd(), 'uploads');

    const partnersDir = path.join(uploadsBase, 'partners');
    if (!fs.existsSync(partnersDir)) {
      fs.mkdirSync(partnersDir, { recursive: true });
    }

    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `partner-doc-${Date.now()}-${randomString}${originalExt}`;
    const destinationPath = path.join(partnersDir, uniqueFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);

    const sizeInMB = file.size / (1024 * 1024);
    const formattedFileSize =
      sizeInMB >= 1
        ? `${sizeInMB.toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    return {
      fileUrl: `/uploads/partners/${uniqueFilename}`,
      fileName: file.originalname,
      fileSize: formattedFileSize,
      originalName: file.originalname,
      size: file.size,
    };
  }

  // ─── Admin API ───────────────────────────────────────────────────────

  async getAdminPartners(filter: AdminPartnersFilterDto) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status && filter.status !== 'all' && filter.status !== 'ALL') {
      const normalizedStatus = filter.status.toUpperCase().replace(/-/g, '_');
      if (normalizedStatus === 'PENDING') {
        where.status = { in: [PartnerApplicationStatus.PENDING, PartnerApplicationStatus.UNDER_REVIEW] };
      } else if (Object.values(PartnerApplicationStatus).includes(normalizedStatus as PartnerApplicationStatus)) {
        where.status = normalizedStatus as PartnerApplicationStatus;
      }
    }

    if (filter.applicantType && filter.applicantType !== 'all' && filter.applicantType !== 'ALL') {
      const normalizedType = filter.applicantType.toUpperCase() as PartnerApplicationType;
      if (Object.values(PartnerApplicationType).includes(normalizedType)) {
        where.applicantType = normalizedType;
      }
    }

    if (filter.search && filter.search.trim()) {
      const term = filter.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { companyName: { contains: term, mode: 'insensitive' } },
        { tradeName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { nationalCode: { contains: term, mode: 'insensitive' } },
        { nationalCompanyId: { contains: term, mode: 'insensitive' } },
        { economicCode: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total, allApps] = await Promise.all([
      this.prisma.partnerApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
        },
      }),
      this.prisma.partnerApplication.count({ where }),
      this.prisma.partnerApplication.findMany({
        select: {
          status: true,
          applicantType: true,
          approvedCreditLimit: true,
          requestedCreditLimit: true,
        },
      }),
    ]);

    // Compute stats
    let pendingCount = 0;
    let approvedCount = 0;
    let needDocsCount = 0;
    let rejectedCount = 0;
    let individualCount = 0;
    let companyCount = 0;
    let totalApprovedCredit = 0;

    for (const app of allApps) {
      if (app.status === PartnerApplicationStatus.PENDING || app.status === PartnerApplicationStatus.UNDER_REVIEW) {
        pendingCount++;
      } else if (app.status === PartnerApplicationStatus.APPROVED) {
        approvedCount++;
        totalApprovedCredit += Number(app.approvedCreditLimit || app.requestedCreditLimit || 0);
      } else if (app.status === PartnerApplicationStatus.NEED_DOCS) {
        needDocsCount++;
      } else if (app.status === PartnerApplicationStatus.REJECTED) {
        rejectedCount++;
      }

      if (app.applicantType === PartnerApplicationType.INDIVIDUAL) {
        individualCount++;
      } else if (app.applicantType === PartnerApplicationType.COMPANY) {
        companyCount++;
      }
    }

    return {
      items: items.map((it) => this.mapApplicationToDto(it)),
      total,
      page,
      limit,
      stats: {
        totalApplications: allApps.length,
        pendingCount,
        approvedCount,
        needDocsCount,
        rejectedCount,
        individualCount,
        companyCount,
        totalApprovedCredit,
      },
    };
  }

  async getAdminPartnerById(id: string) {
    const app = await this.prisma.partnerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    if (!app) {
      throw new NotFoundException(`پرونده همکار با شناسه ${id} یافت نشد.`);
    }

    return this.mapApplicationToDto(app);
  }

  async updatePartnerStatus(
    id: string,
    dto: UpdatePartnerStatusDto,
    adminUserId?: string,
  ) {
    const existing = await this.prisma.partnerApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`پرونده همکار با شناسه ${id} یافت نشد.`);
    }

    const updateData: any = {
      status: dto.status,
      reviewerNotes: dto.reviewerNotes ?? existing.reviewerNotes,
      reviewedAt: new Date(),
      reviewedBy: adminUserId || null,
    };

    if (dto.tier) {
      updateData.tier = dto.tier;
    }

    if (dto.assignedAccountManager) {
      updateData.assignedAccountManager = dto.assignedAccountManager;
    }

    if (dto.approvedCreditLimit !== undefined) {
      updateData.approvedCreditLimit = BigInt(Math.round(Number(dto.approvedCreditLimit) || 0));
    } else if (dto.status === PartnerApplicationStatus.APPROVED && existing.approvedCreditLimit === BigInt(0)) {
      updateData.approvedCreditLimit = existing.requestedCreditLimit;
    }

    const updated = await this.prisma.partnerApplication.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });

    // If approved, elevate user's role to PARTNER_B2B and update Organization
    if (dto.status === PartnerApplicationStatus.APPROVED && existing.userId) {
      await this.elevateUserToPartner(existing.userId, adminUserId);
      try {
        const membership = await this.prisma.organizationMember.findFirst({
          where: { userId: existing.userId },
        });
        if (membership) {
          const approvedCreditDecimal = updateData.approvedCreditLimit
            ? new Prisma.Decimal(updateData.approvedCreditLimit.toString())
            : new Prisma.Decimal(0);
          await this.prisma.organization.update({
            where: { id: membership.organizationId },
            data: {
              status: OrganizationStatus.VERIFIED,
              creditLimit: approvedCreditDecimal,
              verifiedAt: new Date(),
            },
          });
        }
      } catch (orgErr) {
        this.logger.error(`Failed to update organization status for user ${existing.userId}:`, orgErr);
      }
    } else if (dto.status === PartnerApplicationStatus.REJECTED && existing.userId) {
      await this.revokeUserPartnerRole(existing.userId);
      try {
        const membership = await this.prisma.organizationMember.findFirst({
          where: { userId: existing.userId },
        });
        if (membership) {
          await this.prisma.organization.update({
            where: { id: membership.organizationId },
            data: {
              status: OrganizationStatus.REJECTED,
            },
          });
        }
      } catch (orgErr) {
        this.logger.error(`Failed to set organization REJECTED for user ${existing.userId}:`, orgErr);
      }
    }

    return this.mapApplicationToDto(updated);
  }

  async createPartnerAdmin(dto: any, adminUserId?: string) {
    const phone = (dto.phone || '').trim();
    if (!phone) {
      throw new BadRequestException('شماره تماس الزامی است.');
    }

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: dto.fullName?.trim() || dto.companyName?.trim() || 'همکار سازمانی',
          phone,
          email: dto.email?.trim() || null,
          status: 'ACTIVE',
        },
      });
    }

    const status = dto.status || PartnerApplicationStatus.PENDING;
    const tier = dto.tier || PartnerTier.BRONZE;
    const approvedLimit = Number(dto.approvedCreditLimit ?? dto.requestedCreditLimit ?? 0);

    const app = await this.prisma.partnerApplication.create({
      data: {
        userId: user.id,
        applicantType: dto.applicantType || PartnerApplicationType.INDIVIDUAL,
        fullName: dto.fullName?.trim() || user.name,
        phone,
        landlinePhone: dto.landlinePhone?.trim() || null,
        email: dto.email?.trim() || user.email,
        province: dto.province?.trim() || 'تهران',
        city: dto.city?.trim() || 'تهران',
        address: dto.address?.trim() || 'ثبت دستی توسط مدیریت',
        postalCode: dto.postalCode?.trim() || null,
        fieldOfActivity: dto.fieldOfActivity?.trim() || 'تجهیزات شبکه و فناوری اطلاعات',
        experienceYears: Number(dto.experienceYears) || 1,
        estimatedMonthlyPurchase: BigInt(Math.round(Number(dto.estimatedMonthlyPurchase) || 0)),
        requestedCreditLimit: BigInt(Math.round(Number(dto.requestedCreditLimit) || 0)),
        approvedCreditLimit: BigInt(Math.round(approvedLimit)),
        websiteOrSocial: dto.websiteOrSocial?.trim() || null,
        notes: dto.notes?.trim() || null,
        nationalCode: dto.nationalCode?.trim() || null,
        tradeName: dto.tradeName?.trim() || null,
        businessLicenseNumber: dto.businessLicenseNumber?.trim() || null,
        companyName: dto.companyName?.trim() || null,
        companyType: dto.companyType?.trim() || null,
        nationalCompanyId: dto.nationalCompanyId?.trim() || null,
        economicCode: dto.economicCode?.trim() || null,
        registrationNumber: dto.registrationNumber?.trim() || null,
        establishedYear: dto.establishedYear?.trim() || null,
        ceoOrAgentName: dto.ceoOrAgentName?.trim() || null,
        agentPosition: dto.agentPosition?.trim() || null,
        documents: Array.isArray(dto.documents)
          ? dto.documents
              .flat()
              .filter((d: any) => d && typeof d === 'object' && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl))
              .map((d: any) => ({
                id: d.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                title: String(d.title || '').trim(),
                fileName: String(d.fileName || '').trim(),
                fileUrl: String(d.fileUrl || '').trim(),
                type: String(d.type || '').trim(),
                fileSize: d.fileSize ? String(d.fileSize) : undefined,
                uploadedAt: d.uploadedAt ? String(d.uploadedAt) : new Date().toLocaleDateString('fa-IR'),
              }))
          : [],
        status,
        tier,
        assignedAccountManager: dto.assignedAccountManager || null,
        reviewerNotes: dto.reviewerNotes || 'ثبت مستقیم توسط مدیر سیستم',
        reviewedAt: status === PartnerApplicationStatus.APPROVED ? new Date() : null,
        reviewedBy: adminUserId || null,
      },
      include: {
        user: true,
      },
    });

    if (status === PartnerApplicationStatus.APPROVED) {
      await this.elevateUserToPartner(user.id, adminUserId);
    }

    return this.mapApplicationToDto(app);
  }

  async updatePartnerAdmin(id: string, dto: any, adminUserId?: string) {
    const existing = await this.prisma.partnerApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`پرونده همکار با شناسه ${id} یافت نشد.`);
    }

    const data: any = {};
    if (dto.applicantType !== undefined) data.applicantType = dto.applicantType;
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone.trim();
    if (dto.landlinePhone !== undefined) data.landlinePhone = dto.landlinePhone?.trim() || null;
    if (dto.email !== undefined) data.email = dto.email?.trim() || null;
    if (dto.province !== undefined) data.province = dto.province.trim();
    if (dto.city !== undefined) data.city = dto.city.trim();
    if (dto.address !== undefined) data.address = dto.address.trim();
    if (dto.postalCode !== undefined) data.postalCode = dto.postalCode?.trim() || null;
    if (dto.fieldOfActivity !== undefined) data.fieldOfActivity = dto.fieldOfActivity.trim();
    if (dto.experienceYears !== undefined) data.experienceYears = Number(dto.experienceYears) || 0;
    if (dto.estimatedMonthlyPurchase !== undefined) {
      data.estimatedMonthlyPurchase = BigInt(Math.round(Number(dto.estimatedMonthlyPurchase) || 0));
    }
    if (dto.requestedCreditLimit !== undefined) {
      data.requestedCreditLimit = BigInt(Math.round(Number(dto.requestedCreditLimit) || 0));
    }
    if (dto.approvedCreditLimit !== undefined) {
      data.approvedCreditLimit = BigInt(Math.round(Number(dto.approvedCreditLimit) || 0));
    }
    if (dto.websiteOrSocial !== undefined) data.websiteOrSocial = dto.websiteOrSocial?.trim() || null;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() || null;
    if (dto.nationalCode !== undefined) data.nationalCode = dto.nationalCode?.trim() || null;
    if (dto.tradeName !== undefined) data.tradeName = dto.tradeName?.trim() || null;
    if (dto.businessLicenseNumber !== undefined) data.businessLicenseNumber = dto.businessLicenseNumber?.trim() || null;
    if (dto.companyName !== undefined) data.companyName = dto.companyName?.trim() || null;
    if (dto.companyType !== undefined) data.companyType = dto.companyType?.trim() || null;
    if (dto.nationalCompanyId !== undefined) data.nationalCompanyId = dto.nationalCompanyId?.trim() || null;
    if (dto.economicCode !== undefined) data.economicCode = dto.economicCode?.trim() || null;
    if (dto.registrationNumber !== undefined) data.registrationNumber = dto.registrationNumber?.trim() || null;
    if (dto.establishedYear !== undefined) data.establishedYear = dto.establishedYear?.trim() || null;
    if (dto.ceoOrAgentName !== undefined) data.ceoOrAgentName = dto.ceoOrAgentName?.trim() || null;
    if (dto.agentPosition !== undefined) data.agentPosition = dto.agentPosition?.trim() || null;
    if (dto.documents !== undefined) {
      data.documents = Array.isArray(dto.documents)
        ? dto.documents
            .flat()
            .filter((d: any) => d && typeof d === 'object' && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl))
            .map((d: any) => ({
              id: d.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              title: String(d.title || '').trim(),
              fileName: String(d.fileName || '').trim(),
              fileUrl: String(d.fileUrl || '').trim(),
              type: String(d.type || '').trim(),
              fileSize: d.fileSize ? String(d.fileSize) : undefined,
              uploadedAt: d.uploadedAt ? String(d.uploadedAt) : new Date().toLocaleDateString('fa-IR'),
            }))
        : [];
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.tier !== undefined) data.tier = dto.tier;
    if (dto.assignedAccountManager !== undefined) data.assignedAccountManager = dto.assignedAccountManager;
    if (dto.reviewerNotes !== undefined) data.reviewerNotes = dto.reviewerNotes;

    if (dto.status === PartnerApplicationStatus.APPROVED && !existing.reviewedAt) {
      data.reviewedAt = new Date();
      data.reviewedBy = adminUserId || null;
    }

    const updated = await this.prisma.partnerApplication.update({
      where: { id },
      data,
      include: { user: true },
    });

    if (dto.status === PartnerApplicationStatus.APPROVED && existing.userId) {
      await this.elevateUserToPartner(existing.userId, adminUserId);
    } else if (dto.status === PartnerApplicationStatus.REJECTED && existing.userId) {
      await this.revokeUserPartnerRole(existing.userId);
    }

    return this.mapApplicationToDto(updated);
  }

  async deletePartner(id: string, adminUserId?: string) {
    const existing = await this.prisma.partnerApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`پرونده همکار با شناسه ${id} یافت نشد.`);
    }

    await this.prisma.partnerApplication.delete({
      where: { id },
    });

    this.logger.log(`Admin ${adminUserId || 'system'} deleted partner application ${id}`);
    return { success: true, message: 'پرونده همکار با موفقیت حذف گردید.' };
  }

  private async elevateUserToPartner(userId: string, adminUserId?: string) {
    try {
      let partnerRole = await this.prisma.role.findFirst({
        where: {
          code: { in: ['PARTNER_B2B', 'PARTNER', 'partner_b2b', 'partner'] },
        },
      });

      if (!partnerRole) {
        partnerRole = await this.prisma.role.create({
          data: {
            code: 'PARTNER_B2B',
            name: 'همکار تجاری B2B',
            description: 'دسترسی همکار B2B با قیمت‌های سازمانی و خرید چکی',
            isSystem: true,
          },
        });
      }

      const existingMapping = await this.prisma.userRoleMapping.findFirst({
        where: {
          userId,
          roleId: partnerRole.id,
        },
      });

      if (!existingMapping) {
        await this.prisma.userRoleMapping.create({
          data: {
            userId,
            roleId: partnerRole.id,
            assignedBy: adminUserId || null,
          },
        });
        this.logger.log(`Promoted user ${userId} to role PARTNER_B2B`);
      }
    } catch (roleErr) {
      this.logger.error(`Failed to assign PARTNER_B2B role to user ${userId}:`, roleErr);
    }
  }

  private async revokeUserPartnerRole(userId: string) {
    try {
      const remainingApproved = await this.prisma.partnerApplication.count({
        where: {
          userId,
          status: PartnerApplicationStatus.APPROVED,
        },
      });

      if (remainingApproved === 0) {
        const partnerRole = await this.prisma.role.findFirst({
          where: {
            code: { in: ['PARTNER_B2B', 'PARTNER', 'partner_b2b', 'partner'] },
          },
        });
        if (partnerRole) {
          await this.prisma.userRoleMapping.deleteMany({
            where: {
              userId,
              roleId: partnerRole.id,
            },
          });
          this.logger.log(`Revoked PARTNER_B2B role from user ${userId}`);
        }
      }
    } catch (err) {
      this.logger.error(`Failed to revoke PARTNER_B2B role from user ${userId}:`, err);
    }
  }
}
