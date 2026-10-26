import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import { InstallationStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInstallationDto {
  @IsString()
  @IsNotEmpty()
  serviceType!: string;

  @IsArray()
  @IsOptional()
  secondaryServices?: string[];

  @IsString()
  @IsOptional()
  projectScale?: string;

  @IsString()
  @IsOptional()
  buildingType?: string;

  @IsNumber()
  @IsOptional()
  approximateArea?: number;

  @IsNumber()
  @IsOptional()
  nodeCount?: number;

  @IsNumber()
  @IsOptional()
  cctvCount?: number;

  @IsNumber()
  @IsOptional()
  rackCount?: number;

  @IsNumber()
  @IsOptional()
  fiberCoreCount?: number;

  @IsString()
  @IsOptional()
  equipmentStatus?: string;

  @IsBoolean()
  @IsOptional()
  needsFlukeTest?: boolean;

  @IsBoolean()
  @IsOptional()
  needsOnsiteSurvey?: boolean;

  @IsString()
  @IsOptional()
  preferredTimeline?: string;

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
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  hasAttachment?: boolean;

  @IsString()
  @IsOptional()
  attachmentName?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}

export class TrackingStepDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateInstallationDto {
  @IsEnum(InstallationStatus)
  @IsOptional()
  status?: InstallationStatus;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsArray()
  @IsOptional()
  secondaryServices?: string[];

  @IsString()
  @IsOptional()
  projectScale?: string;

  @IsString()
  @IsOptional()
  buildingType?: string;

  @IsNumber()
  @IsOptional()
  approximateArea?: number;

  @IsNumber()
  @IsOptional()
  nodeCount?: number;

  @IsNumber()
  @IsOptional()
  cctvCount?: number;

  @IsNumber()
  @IsOptional()
  rackCount?: number;

  @IsNumber()
  @IsOptional()
  fiberCoreCount?: number;

  @IsString()
  @IsOptional()
  equipmentStatus?: string;

  @IsBoolean()
  @IsOptional()
  needsFlukeTest?: boolean;

  @IsBoolean()
  @IsOptional()
  needsOnsiteSurvey?: boolean;

  @IsString()
  @IsOptional()
  preferredTimeline?: string;

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
  fullName?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedTeamLead?: string;

  @IsString()
  @IsOptional()
  assignedTeamRole?: string;

  @IsString()
  @IsOptional()
  assignedTeamPhone?: string;

  @IsNumber()
  @IsOptional()
  statusPercent?: number;

  @IsNumber()
  @IsOptional()
  currentStepIndex?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TrackingStepDto)
  trackingSteps?: TrackingStepDto[];

  @IsNumber()
  @IsOptional()
  minEstimatedCost?: number;

  @IsNumber()
  @IsOptional()
  maxEstimatedCost?: number;

  @IsNumber()
  @IsOptional()
  finalQuotationAmount?: number;

  @IsString()
  @IsOptional()
  adminNotes?: string;

  @IsString()
  @IsOptional()
  estimatedDays?: string;
}

export class InstallationQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  province?: string;
}

const SERVICE_TITLES: Record<string, string> = {
  cabling: 'کابل‌کشی ساختاریافته و پسیو شبکه',
  datacenter: 'آرایش رک و راه‌اندازی دیتاسنتر و اتاق سرور',
  cctv: 'نصب و راه‌اندازی دوربین‌های مداربسته تحت شبکه (CCTV)',
  wireless: 'شبکه بی‌سیم سازمانی و اکسس‌پوینت‌های Wi-Fi 6',
  switching: 'پیکربندی سوئیچینگ، روتینگ و امنیت شبکه',
  fiber: 'فیوژن، مفصل‌بندی و تست OTDR فیبر نوری',
  'ups-power': 'سیستم‌های برق اضطراری، یو‌پی‌اس و تابلو برق',
  other: 'مشاوره، نظارت و خدمات اختصاصی زیرساخت شبکه',
};

@Injectable()
export class InstallationService {
  private readonly logger = new Logger(InstallationService.name);

  constructor(private readonly prisma: PrismaService) {}

  private sanitizeTrackingSteps(steps: any, createdAt: Date | string) {
    const formattedDate = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(createdAt || Date.now()));
    const defaults = this.generateDefaultSteps(formattedDate);

    if (!Array.isArray(steps) || steps.length === 0) {
      return defaults;
    }

    const isValid = steps.every(
      (s) => s && typeof s === 'object' && !Array.isArray(s) && typeof s.title === 'string' && s.title.trim().length > 0
    );

    if (!isValid) {
      return defaults;
    }

    return steps;
  }

  private serializeRecord(r: any) {
    if (!r) return null;
    const trackingSteps = this.sanitizeTrackingSteps(r.trackingSteps, r.createdAt);
    return {
      ...r,
      minEstimatedCost: r.minEstimatedCost != null ? Number(r.minEstimatedCost) : 0,
      maxEstimatedCost: r.maxEstimatedCost != null ? Number(r.maxEstimatedCost) : 0,
      finalQuotationAmount: r.finalQuotationAmount != null ? Number(r.finalQuotationAmount) : null,
      serviceTitle: SERVICE_TITLES[r.serviceType] || r.serviceType,
      trackingSteps,
    };
  }

  private generateDefaultSteps(createdAtFa: string) {
    return [
      {
        title: 'ثبت آنلاین درخواست و مشاوره اولیه',
        description: 'درخواست آنلاین دریافت شد و کد رهگیری یکتا صادر گردید.',
        date: `${createdAtFa}`,
        status: 'completed',
      },
      {
        title: 'کارشناسی، هماهنگی و بازدید از محل',
        description: 'کارشناس ارشد زیرساخت جهت تأیید فنی و زمان‌بندی بازدید با شما تماس خواهد گرفت.',
        date: 'در دست اقدام',
        status: 'current',
      },
      {
        title: 'صدور پیش‌فاکتور شفاف و زمان‌بندی دقیق',
        description: 'متره‌کشی محل پروژه و ارائه چک‌لیست دقیق متریال (BOM) و برآورد زمان اجرا.',
        date: 'مرحله بعد',
        status: 'upcoming',
      },
      {
        title: 'عملیات اجرایی و کابل‌کشی مهندسی',
        description: 'استقرار تیم فنی، ترانکینگ، آرایش رک‌ها و کابل‌کشی طبق استانداردهای TIA-568-D.',
        date: 'مرحله بعد',
        status: 'upcoming',
      },
      {
        title: 'تست فلوک ۱۰۰٪ و تحویل گارانتی کتبی',
        description: 'آنالیز کامل تمام نودها با Fluke DSX-8000 و تحویل گواهی ۱۸ ماهه.',
        date: 'تخمین مرحله نهایی',
        status: 'upcoming',
      },
    ];
  }

  async createRequest(dto: CreateInstallationDto, userId?: string) {
    if (!dto.fullName?.trim()) {
      throw new BadRequestException('نام و نام خانوادگی مسئول هماهنگی الزامی است.');
    }
    if (!dto.phoneNumber?.trim()) {
      throw new BadRequestException('شماره تماس الزامی است.');
    }
    if (!dto.serviceType?.trim()) {
      throw new BadRequestException('نوع خدمت اصلی الزامی است.');
    }

    // Generate unique tracking code NET-INST-XXXX
    let trackingCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 15) {
      attempts++;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      trackingCode = `NET-INST-${randomNum}`;
      const existing = await this.prisma.installationRequest.findUnique({
        where: { trackingCode },
        select: { id: true },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      trackingCode = `NET-INST-${Date.now().toString().slice(-6)}`;
    }

    const nodeCount = Number(dto.nodeCount || 0);
    const cctvCount = Number(dto.cctvCount || 0);
    const rackCount = Number(dto.rackCount || 0);
    const area = Number(dto.approximateArea || 0);

    // Calculate realistic baseline estimates
    let baseMinCost = 1500000;
    if (dto.serviceType === 'cabling') {
      baseMinCost = Math.max(2500000, nodeCount * 145000 + (dto.needsFlukeTest ? nodeCount * 45000 : 0) + 1200000);
    } else if (dto.serviceType === 'datacenter') {
      baseMinCost = Math.max(5000000, rackCount * 3800000 + 2000000);
    } else if (dto.serviceType === 'cctv') {
      baseMinCost = Math.max(3000000, cctvCount * 290000 + 1800000);
    } else if (dto.serviceType === 'wireless') {
      baseMinCost = Math.max(2000000, (nodeCount || 4) * 420000 + 1000000);
    } else if (dto.serviceType === 'switching') {
      baseMinCost = Math.max(3000000, (rackCount || 1) * 1650000 + 1500000);
    } else if (dto.serviceType === 'fiber') {
      baseMinCost = Math.max(3500000, (nodeCount || 8) * 180000 + 2000000);
    } else {
      baseMinCost = Math.max(2000000, area * 25000 + 1000000);
    }

    const minEstimated = Math.round(baseMinCost / 100000) * 100000;
    const maxEstimated = Math.round((baseMinCost * 1.3) / 100000) * 100000;

    let estimatedDays = '۱ الی ۲ روز کاری';
    if (nodeCount > 60 || rackCount > 2 || area > 500) {
      estimatedDays = '۴ الی ۷ روز کاری';
    } else if (nodeCount > 24 || cctvCount > 8) {
      estimatedDays = '۲ الی ۳ روز کاری';
    }

    const now = new Date();
    const formattedNowFa = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(now);

    const defaultSteps = this.generateDefaultSteps(formattedNowFa);

    const record = await this.prisma.installationRequest.create({
      data: {
        trackingCode,
        serviceType: dto.serviceType,
        secondaryServices: dto.secondaryServices || [],
        projectScale: dto.projectScale || 'medium',
        buildingType: dto.buildingType || 'office',
        approximateArea: area,
        nodeCount,
        cctvCount,
        rackCount,
        fiberCoreCount: Number(dto.fiberCoreCount || 0),
        equipmentStatus: dto.equipmentStatus || 'need_purchase_from_netmarket',
        needsFlukeTest: dto.needsFlukeTest ?? true,
        needsOnsiteSurvey: dto.needsOnsiteSurvey ?? true,
        preferredTimeline: dto.preferredTimeline || 'this_week',
        province: dto.province || 'تهران',
        city: dto.city || 'تهران',
        address: dto.address || '',
        fullName: dto.fullName.trim(),
        companyName: dto.companyName?.trim() || null,
        phoneNumber: dto.phoneNumber.trim(),
        email: dto.email?.trim() || null,
        notes: dto.notes?.trim() || null,
        hasAttachment: !!dto.hasAttachment,
        attachmentName: dto.attachmentName || null,
        attachmentUrl: dto.attachmentUrl || null,
        status: InstallationStatus.PENDING_REVIEW,
        estimatedDays,
        minEstimatedCost: BigInt(minEstimated),
        maxEstimatedCost: BigInt(maxEstimated),
        assignedTeamLead: 'مهندس شریفی',
        assignedTeamRole: 'سرپرست ارشد پروژه‌های پسیو و فیبر نوری',
        assignedTeamPhone: '۰۹۱۳۴۷۶۱۰۹۷',
        statusPercent: 20,
        currentStepIndex: 1,
        trackingSteps: defaultSteps,
        userId: userId || null,
      },
    });

    return this.serializeRecord(record);
  }

  async trackByCode(code: string) {
    if (!code?.trim()) {
      throw new BadRequestException('کد رهگیری الزامی است.');
    }
    const clean = code.trim().toUpperCase();

    const record = await this.prisma.installationRequest.findFirst({
      where: {
        trackingCode: {
          equals: clean,
          mode: 'insensitive',
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`درخواستی با کد رهگیری «${clean}» یافت نشد.`);
    }

    const serialized = this.serializeRecord(record);

    const steps = Array.isArray(record.trackingSteps)
      ? record.trackingSteps
      : this.generateDefaultSteps(new Intl.DateTimeFormat('fa-IR').format(record.createdAt));

    return {
      trackingCode: record.trackingCode,
      clientName: record.fullName,
      companyName: record.companyName || 'شخصی / بدون نام شرکت',
      serviceTitle: SERVICE_TITLES[record.serviceType] || record.serviceType,
      registeredDate: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(record.createdAt),
      estimatedCompletion: record.estimatedDays || 'ظرف ۳ روز کاری آینده',
      technicianName: record.assignedTeamLead
        ? `${record.assignedTeamLead} (${record.assignedTeamRole || 'کارشناس اعزامی'})`
        : 'در حال تخصیص کارشناس',
      technicianPhone: record.assignedTeamPhone,
      status: record.status,
      statusPercent: record.statusPercent,
      currentStepIndex: record.currentStepIndex,
      steps,
      details: {
        province: record.province,
        city: record.city,
        address: record.address,
        nodeCount: record.nodeCount,
        cctvCount: record.cctvCount,
        rackCount: record.rackCount,
        approximateArea: record.approximateArea,
        needsFlukeTest: record.needsFlukeTest,
        minEstimatedCost: serialized.minEstimatedCost,
        maxEstimatedCost: serialized.maxEstimatedCost,
        finalQuotationAmount: serialized.finalQuotationAmount,
      },
    };
  }

  async findAll(query: InstallationQueryDto) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 15)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'all') {
      const upperStatus = query.status.toUpperCase();
      if (Object.values(InstallationStatus).includes(upperStatus as InstallationStatus)) {
        where.status = upperStatus as InstallationStatus;
      }
    }

    if (query.serviceType && query.serviceType !== 'all') {
      where.serviceType = query.serviceType;
    }

    if (query.province && query.province !== 'all') {
      where.province = query.province;
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { trackingCode: { contains: s, mode: 'insensitive' } },
        { fullName: { contains: s, mode: 'insensitive' } },
        { companyName: { contains: s, mode: 'insensitive' } },
        { phoneNumber: { contains: s } },
        { city: { contains: s, mode: 'insensitive' } },
        { address: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, items, statsGroup] = await Promise.all([
      this.prisma.installationRequest.count({ where }),
      this.prisma.installationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.installationRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      all: 0,
      PENDING_REVIEW: 0,
      ASSIGNED: 0,
      SURVEY_SCHEDULED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    let totalAll = 0;
    for (const g of statsGroup) {
      statusCounts[g.status] = g._count.id;
      totalAll += g._count.id;
    }
    statusCounts.all = totalAll;

    return {
      items: items.map((item) => this.serializeRecord(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      statusCounts,
    };
  }

  async findById(id: string) {
    const record = await this.prisma.installationRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`درخواست نصب با شناسه «${id}» یافت نشد.`);
    }

    return this.serializeRecord(record);
  }

  async updateRequest(id: string, dto: UpdateInstallationDto) {
    const existing = await this.prisma.installationRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`درخواست نصب با شناسه «${id}» یافت نشد.`);
    }

    const dataToUpdate: any = {};

    if (dto.status !== undefined) {
      dataToUpdate.status = dto.status;
      // Auto-adjust statusPercent and currentStepIndex if status changed and not explicitly overridden
      if (dto.statusPercent === undefined) {
        if (dto.status === InstallationStatus.PENDING_REVIEW) {
          dataToUpdate.statusPercent = 20;
          dataToUpdate.currentStepIndex = 1;
        } else if (dto.status === InstallationStatus.ASSIGNED) {
          dataToUpdate.statusPercent = 40;
          dataToUpdate.currentStepIndex = 2;
        } else if (dto.status === InstallationStatus.SURVEY_SCHEDULED) {
          dataToUpdate.statusPercent = 60;
          dataToUpdate.currentStepIndex = 3;
        } else if (dto.status === InstallationStatus.IN_PROGRESS) {
          dataToUpdate.statusPercent = 80;
          dataToUpdate.currentStepIndex = 3;
        } else if (dto.status === InstallationStatus.COMPLETED) {
          dataToUpdate.statusPercent = 100;
          dataToUpdate.currentStepIndex = 4;
        } else if (dto.status === InstallationStatus.CANCELLED) {
          dataToUpdate.statusPercent = 0;
        }
      }
    }

    if (dto.serviceType !== undefined) dataToUpdate.serviceType = dto.serviceType;
    if (dto.secondaryServices !== undefined) dataToUpdate.secondaryServices = dto.secondaryServices;
    if (dto.projectScale !== undefined) dataToUpdate.projectScale = dto.projectScale;
    if (dto.buildingType !== undefined) dataToUpdate.buildingType = dto.buildingType;
    if (dto.approximateArea !== undefined) dataToUpdate.approximateArea = Number(dto.approximateArea);
    if (dto.nodeCount !== undefined) dataToUpdate.nodeCount = Number(dto.nodeCount);
    if (dto.cctvCount !== undefined) dataToUpdate.cctvCount = Number(dto.cctvCount);
    if (dto.rackCount !== undefined) dataToUpdate.rackCount = Number(dto.rackCount);
    if (dto.fiberCoreCount !== undefined) dataToUpdate.fiberCoreCount = Number(dto.fiberCoreCount);
    if (dto.equipmentStatus !== undefined) dataToUpdate.equipmentStatus = dto.equipmentStatus;
    if (dto.needsFlukeTest !== undefined) dataToUpdate.needsFlukeTest = dto.needsFlukeTest;
    if (dto.needsOnsiteSurvey !== undefined) dataToUpdate.needsOnsiteSurvey = dto.needsOnsiteSurvey;
    if (dto.preferredTimeline !== undefined) dataToUpdate.preferredTimeline = dto.preferredTimeline;
    if (dto.province !== undefined) dataToUpdate.province = dto.province;
    if (dto.city !== undefined) dataToUpdate.city = dto.city;
    if (dto.address !== undefined) dataToUpdate.address = dto.address;
    if (dto.fullName !== undefined) dataToUpdate.fullName = dto.fullName;
    if (dto.companyName !== undefined) dataToUpdate.companyName = dto.companyName;
    if (dto.phoneNumber !== undefined) dataToUpdate.phoneNumber = dto.phoneNumber;
    if (dto.email !== undefined) dataToUpdate.email = dto.email;
    if (dto.notes !== undefined) dataToUpdate.notes = dto.notes;

    if (dto.assignedTeamLead !== undefined) dataToUpdate.assignedTeamLead = dto.assignedTeamLead;
    if (dto.assignedTeamRole !== undefined) dataToUpdate.assignedTeamRole = dto.assignedTeamRole;
    if (dto.assignedTeamPhone !== undefined) dataToUpdate.assignedTeamPhone = dto.assignedTeamPhone;

    if (dto.trackingSteps !== undefined && Array.isArray(dto.trackingSteps)) {
      dataToUpdate.trackingSteps = dto.trackingSteps.map((st: any, idx: number) => ({
        title: st.title || `مرحله ${idx + 1}`,
        description: st.description || '',
        status: st.status || 'upcoming',
        date: st.date || '',
      }));

      if (dto.statusPercent === undefined) {
        const completedCount = dataToUpdate.trackingSteps.filter((s: any) => s.status === 'completed').length;
        dataToUpdate.statusPercent = Math.round((completedCount / dataToUpdate.trackingSteps.length) * 100);
      }
      if (dto.currentStepIndex === undefined) {
        const currentIdx = dataToUpdate.trackingSteps.findIndex((s: any) => s.status === 'current');
        dataToUpdate.currentStepIndex = currentIdx !== -1 ? currentIdx : 0;
      }
    } else if (dto.status !== undefined && dto.trackingSteps === undefined && Array.isArray(existing.trackingSteps)) {
      const sanitized = this.sanitizeTrackingSteps(existing.trackingSteps, existing.createdAt);
      let targetCurrent = 1;
      if (dto.status === InstallationStatus.PENDING_REVIEW) targetCurrent = 1;
      else if (dto.status === InstallationStatus.ASSIGNED) targetCurrent = 2;
      else if (dto.status === InstallationStatus.SURVEY_SCHEDULED) targetCurrent = 3;
      else if (dto.status === InstallationStatus.IN_PROGRESS) targetCurrent = 4;
      else if (dto.status === InstallationStatus.COMPLETED) targetCurrent = 6;

      dataToUpdate.trackingSteps = sanitized.map((s: any, idx: number) => {
        if (idx < targetCurrent - 1) return { ...s, status: 'completed' };
        if (idx === targetCurrent - 1) return { ...s, status: targetCurrent > 5 ? 'completed' : 'current' };
        return { ...s, status: 'upcoming' };
      });
    }

    if (dto.statusPercent !== undefined) dataToUpdate.statusPercent = Number(dto.statusPercent);
    if (dto.currentStepIndex !== undefined) dataToUpdate.currentStepIndex = Number(dto.currentStepIndex);

    if (dto.minEstimatedCost !== undefined) dataToUpdate.minEstimatedCost = BigInt(Math.round(dto.minEstimatedCost));
    if (dto.maxEstimatedCost !== undefined) dataToUpdate.maxEstimatedCost = BigInt(Math.round(dto.maxEstimatedCost));
    if (dto.finalQuotationAmount !== undefined) {
      dataToUpdate.finalQuotationAmount = dto.finalQuotationAmount ? BigInt(Math.round(dto.finalQuotationAmount)) : null;
    }

    if (dto.adminNotes !== undefined) dataToUpdate.adminNotes = dto.adminNotes;
    if (dto.estimatedDays !== undefined) dataToUpdate.estimatedDays = dto.estimatedDays;

    const updated = await this.prisma.installationRequest.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.serializeRecord(updated);
  }

  async deleteRequest(id: string) {
    const existing = await this.prisma.installationRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`درخواست نصب با شناسه «${id}» یافت نشد.`);
    }

    await this.prisma.installationRequest.delete({
      where: { id },
    });

    return { success: true, id };
  }

  async getUserRequests(userId?: string | null, phone?: string) {
    const whereConditions: any[] = [];
    if (userId) {
      whereConditions.push({ userId });
    }
    if (phone?.trim()) {
      whereConditions.push({ phoneNumber: phone.trim() });
    }

    let records: any[] = [];
    if (whereConditions.length > 0) {
      records = await this.prisma.installationRequest.findMany({
        where: {
          OR: whereConditions,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      records = await this.prisma.installationRequest.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    }

    return records.map((r) => this.serializeRecord(r));
  }

  async getAdminStats() {
    const [allCount, pendingCount, inProgressCount, completedCount, cancelledCount, allRecords] =
      await Promise.all([
        this.prisma.installationRequest.count(),
        this.prisma.installationRequest.count({
          where: { status: { in: [InstallationStatus.PENDING_REVIEW, InstallationStatus.ASSIGNED] } },
        }),
        this.prisma.installationRequest.count({
          where: { status: { in: [InstallationStatus.SURVEY_SCHEDULED, InstallationStatus.IN_PROGRESS] } },
        }),
        this.prisma.installationRequest.count({
          where: { status: InstallationStatus.COMPLETED },
        }),
        this.prisma.installationRequest.count({
          where: { status: InstallationStatus.CANCELLED },
        }),
        this.prisma.installationRequest.findMany({
          select: {
            serviceType: true,
            minEstimatedCost: true,
            maxEstimatedCost: true,
            finalQuotationAmount: true,
            province: true,
            needsFlukeTest: true,
          },
        }),
      ]);

    let totalEstimatedValue = 0;
    const serviceDistribution: Record<string, number> = {};
    const provinceDistribution: Record<string, number> = {};
    let flukeTestCount = 0;

    for (const r of allRecords) {
      const val = r.finalQuotationAmount
        ? Number(r.finalQuotationAmount)
        : Number(r.minEstimatedCost || 0);
      totalEstimatedValue += val;

      serviceDistribution[r.serviceType] = (serviceDistribution[r.serviceType] || 0) + 1;
      provinceDistribution[r.province] = (provinceDistribution[r.province] || 0) + 1;
      if (r.needsFlukeTest) flukeTestCount++;
    }

    return {
      total: allCount,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      cancelled: cancelledCount,
      totalEstimatedValue,
      flukeAdoptionRate: allCount > 0 ? Math.round((flukeTestCount / allCount) * 100) : 0,
      serviceDistribution,
      provinceDistribution,
    };
  }

  async seedInitialDemoDataIfEmpty() {
    const count = await this.prisma.installationRequest.count();
    if (count > 0) return;

    this.logger.log('Seeding initial installation requests demo data...');

    const demoRecords = [
      {
        trackingCode: 'NET-INST-4921',
        serviceType: 'datacenter',
        secondaryServices: ['switching', 'fiber'],
        projectScale: 'enterprise',
        buildingType: 'industrial',
        approximateArea: 480,
        nodeCount: 160,
        cctvCount: 12,
        rackCount: 12,
        fiberCoreCount: 96,
        equipmentStatus: 'need_purchase_from_netmarket',
        needsFlukeTest: true,
        needsOnsiteSurvey: true,
        preferredTimeline: 'urgent',
        province: 'بوشهر',
        city: 'عسلویه',
        address: 'منطقه ویژه اقتصادی پارس جنوبی، فاز ۱۲، ساختمان مهندسی پتروشیمی',
        fullName: 'مهندس علیرضا رضایی',
        companyName: 'مجتمع پتروشیمی زاگرس',
        phoneNumber: '09121112233',
        email: 'rezaei@zagros-petro.ir',
        notes: 'طراحی راهروی سرد و گرم، آرایش رک‌های سرور HP و کابل‌کشی فیبر نوری OM4 به سویچ‌های Nexus سیسکو.',
        status: InstallationStatus.IN_PROGRESS,
        estimatedDays: '۱۴۰۳/۰۷/۱۰',
        minEstimatedCost: BigInt(48000000),
        maxEstimatedCost: BigInt(56000000),
        finalQuotationAmount: BigInt(52500000),
        assignedTeamLead: 'مهندس حسینی',
        assignedTeamRole: 'سرپرست تیم مهندسی دیتاسنتر و اتاق سرور',
        assignedTeamPhone: '۰۹۱۲۳۴۵۶۷۸۹',
        statusPercent: 80,
        currentStepIndex: 3,
        trackingSteps: [
          {
            title: 'ثبت درخواست و تماس کارشناس',
            description: 'درخواست ثبت شد و هماهنگی اولیه انجام گرفت.',
            date: '۱۴۰۳/۰۶/۱۵ - ۱۰:۳۰',
            status: 'completed',
          },
          {
            title: 'بازدید حضوری و تأیید پیش‌فاکتور',
            description: 'بازدید از محل سایت عسلویه انجام شد و نقشه نهایی تایید گردید.',
            date: '۱۴۰۳/۰۶/۱۸ - ۱۴:۰۰',
            status: 'completed',
          },
          {
            title: 'ارسال تجهیزات و استقرار تیم',
            description: 'رک‌ها، کابل‌ها و متعلقات به محل سایت رسید و مونتاژ آغاز شد.',
            date: '۱۴۰۳/۰۶/۲۲ - ۰۹:۰۰',
            status: 'completed',
          },
          {
            title: 'اجرای کابل‌کشی و آرایش رک‌ها',
            description: 'سربندی پچ‌پنل‌ها و ترانک فیبر نوری OM4 در حال انجام است.',
            date: 'در حال اجرا',
            status: 'current',
          },
          {
            title: 'تست فلوک و تحویل سرتیفیکیت',
            description: 'آنالیز با دستگاه Fluke DSX-8000 و تحویل نهایی همراه با گارانتی.',
            date: 'تخمین: ۱۴۰۳/۰۷/۱۰',
            status: 'upcoming',
          },
        ],
      },
      {
        trackingCode: 'NET-INST-7810',
        serviceType: 'cabling',
        secondaryServices: ['wireless'],
        projectScale: 'medium',
        buildingType: 'medical',
        approximateArea: 320,
        nodeCount: 48,
        cctvCount: 8,
        rackCount: 2,
        fiberCoreCount: 0,
        equipmentStatus: 'need_consultation',
        needsFlukeTest: true,
        needsOnsiteSurvey: true,
        preferredTimeline: 'this_week',
        province: 'تهران',
        city: 'تهران',
        address: 'سعادت‌آباد، میدان کاج، خیابان مروارید، پلاک ۱۸',
        fullName: 'دکتر سهرابی',
        companyName: 'کلینیک تخصصی مهراد',
        phoneNumber: '09124445566',
        email: 'sohrabi@mehrad-clinic.ir',
        notes: 'کابل‌کشی شبکه ساختاریافته Cat6A تمام مس بدون دود LSZH و اکسس‌پوینت‌های سقفی رویکرد پزشکی.',
        status: InstallationStatus.COMPLETED,
        estimatedDays: '۱۴۰۳/۰۷/۰۵',
        minEstimatedCost: BigInt(18500000),
        maxEstimatedCost: BigInt(22000000),
        finalQuotationAmount: BigInt(19800000),
        assignedTeamLead: 'مهندس احمدی',
        assignedTeamRole: 'کارشناس ارشد پسیو و ارتباطات',
        assignedTeamPhone: '۰۹۳۵۱۲۳۴۵۶۷',
        statusPercent: 100,
        currentStepIndex: 4,
        trackingSteps: [
          {
            title: 'ثبت آنلاین درخواست',
            description: 'درخواست آنلاین دریافت شد.',
            date: '۱۴۰۳/۰۷/۰۱ - ۱۱:۱۵',
            status: 'completed',
          },
          {
            title: 'بازدید و نقشه‌برداری',
            description: 'بررسی طبقات و تعیین محل ۴۸ نود شبکه.',
            date: '۱۴۰۳/۰۷/۰۲ - ۱۰:۰۰',
            status: 'completed',
          },
          {
            title: 'پیش‌فاکتور و تایید',
            description: 'پیش‌فاکتور مصوب شد.',
            date: '۱۴۰۳/۰۷/۰۲ - ۱۵:۳۰',
            status: 'completed',
          },
          {
            title: 'اجرای کابل‌کشی و نصب اکسس‌پوینت‌ها',
            description: 'کابل‌کشی Cat6A لگراند و ترانکینگ بدون وقفه اداری.',
            date: '۱۴۰۳/۰۷/۰۴ - ۱۸:۰۰',
            status: 'completed',
          },
          {
            title: 'تست فلوک ۱۰۰٪ و تحویل سرتیفیکیت',
            description: 'تمام ۴۸ نود با وضعیت Pass و گزارش فلوک تحویل شد.',
            date: '۱۴۰۳/۰۷/۰۵ - ۱۶:۴۵',
            status: 'completed',
          },
        ],
      },
      {
        trackingCode: 'NET-INST-8834',
        serviceType: 'cctv',
        secondaryServices: ['cabling'],
        projectScale: 'large',
        buildingType: 'warehouse',
        approximateArea: 1200,
        nodeCount: 24,
        cctvCount: 32,
        rackCount: 3,
        fiberCoreCount: 16,
        equipmentStatus: 'already_purchased',
        needsFlukeTest: false,
        needsOnsiteSurvey: true,
        preferredTimeline: 'next_two_weeks',
        province: 'البرز',
        city: 'کرج',
        address: 'شهرک صنعتی سیمین‌دشت، خیابان هفتم شرقی، انبار مرکزی',
        fullName: 'مهندس کامران رستگار',
        companyName: 'شرکت لجستیک آریا پخش',
        phoneNumber: '09127778899',
        email: 'rastegar@aryapakhsh.com',
        notes: 'نصب دوربین‌های مداربسته دید در شب IP و لوله‌کشی فلکسیبل ضد ضربه در محیط انبار با دکل‌های مرتفع.',
        status: InstallationStatus.ASSIGNED,
        estimatedDays: '۳ الی ۵ روز کاری',
        minEstimatedCost: BigInt(26000000),
        maxEstimatedCost: BigInt(31000000),
        finalQuotationAmount: null,
        assignedTeamLead: 'مهندس اکبری',
        assignedTeamRole: 'کارشناس نظارت تصویری و دوربین تحت شبکه',
        assignedTeamPhone: '۰۹۱۹۹۸۸۷۷۶۶',
        statusPercent: 40,
        currentStepIndex: 2,
        trackingSteps: [
          {
            title: 'ثبت درخواست در پرتال',
            description: 'درخواست آنلاین ثبت گردید.',
            date: '۱۴۰۳/۰۷/۱۰ - ۰۹:۲۰',
            status: 'completed',
          },
          {
            title: 'تماس و هماهنگی کارشناس ارشد',
            description: 'تأیید نیازمندی‌ها انجام شد و تکنسین مشخص گردید.',
            date: '۱۴۰۳/۰۷/۱۰ - ۱۱:۴۵',
            status: 'completed',
          },
          {
            title: 'بازدید حضوری و پیش‌فاکتور مصوب',
            description: 'هماهنگی اعزام کارشناس جهت نقشه کابل‌کشی دکل‌ها در دست اقدام است.',
            date: 'امروز',
            status: 'current',
          },
          {
            title: 'عملیات اجرایی و کابل‌کشی',
            description: 'استقرار تیم فنی در سیمین‌دشت.',
            date: 'مرحله بعد',
            status: 'upcoming',
          },
          {
            title: 'تنظیم NVR و انتقال تصویر پایدار',
            description: 'راه‌اندازی انتقال تصویر P2P و تحویل به حراست انبار.',
            date: 'مرحله نهایی',
            status: 'upcoming',
          },
        ],
      },
    ];

    for (const rec of demoRecords) {
      await this.prisma.installationRequest.create({
        data: rec,
      });
    }

    this.logger.log('Initial installation requests demo data seeded successfully.');
  }
}
