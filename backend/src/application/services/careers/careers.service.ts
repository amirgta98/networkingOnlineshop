import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import {
  JobPosition,
  JobApplicationStatus,
  JobPositionType,
  Prisma,
} from '@prisma/client';

export interface JobPositionListItem {
  id: string;
  title: string;
  slug: string;
  department: string;
  type: string;
  experience?: string | null;
  location?: string | null;
  badge?: string | null;
  skills: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { applications: number };
}

export interface JobPositionDetail extends JobPositionListItem {
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  publishedAt?: Date | null;
  applications?: JobApplicationListItem[];
}

export interface JobApplicationListItem {
  id: string;
  positionId: string;
  positionTitle: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  about?: string | null;
  resumeFileName: string;
  resumeFileUrl: string;
  trackingCode: string;
  status: JobApplicationStatus;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateJobPositionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsOptional()
  type?: JobPositionType;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  skills?: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  sortOrder?: number;
}

export class UpdateJobPositionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  type?: JobPositionType;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  skills?: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  sortOrder?: number;
}

export class JobPositionQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  type?: JobPositionType;
}

export interface PaginatedJobPositionsResponse {
  items: JobPositionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CreateJobApplicationDto {
  @IsOptional()
  @IsString()
  positionId?: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  resumeFileName?: string;

  @IsOptional()
  @IsString()
  resumeFileUrl?: string;
}

export class UpdateJobApplicationStatusDto {
  @IsNotEmpty()
  status!: JobApplicationStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

@Injectable()
export class CareersService {
  private readonly logger = new Logger(CareersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllPositions(
    query: JobPositionQueryDto,
    includeInactive = false,
  ): Promise<PaginatedJobPositionsResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.JobPositionWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.department) {
      where.department = { contains: query.department, mode: 'insensitive' };
    }

    if (query.isActive !== undefined) {
      where.isActive = String(query.isActive) === 'true' || query.isActive === true;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobPosition.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          department: true,
          type: true,
          experience: true,
          location: true,
          badge: true,
          skills: true,
          isActive: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { applications: true } },
        },
      }),
      this.prisma.jobPosition.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        skills: Array.isArray(item.skills) ? (item.skills as unknown as string[]) : [],
        type: item.type,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPositionById(id: string): Promise<JobPositionDetail> {
    const position = await this.prisma.jobPosition.findUnique({
      where: { id },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            positionId: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            about: true,
            resumeFileName: true,
            resumeFileUrl: true,
            trackingCode: true,
            status: true,
            adminNotes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('موقعیت شغلی یافت نشد.');
    }

    return this.mapToDetail(position);
  }

  async findPositionBySlug(slug: string): Promise<JobPositionDetail> {
    const position = await this.prisma.jobPosition.findUnique({
      where: { slug },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            positionId: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            about: true,
            resumeFileName: true,
            resumeFileUrl: true,
            trackingCode: true,
            status: true,
            adminNotes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('موقعیت شغلی یافت نشد.');
    }

    return this.mapToDetail(position);
  }

  async createPosition(dto: CreateJobPositionDto): Promise<JobPositionListItem> {
    const slug = dto.slug || this.generateSlug(dto.title);

    const existing = await this.prisma.jobPosition.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new BadRequestException(
        'اسلاگ تکراری است. لطفاً عنوان دیگری انتخاب کنید.',
      );
    }

    const position = await this.prisma.jobPosition.create({
      data: {
        title: dto.title.trim(),
        slug,
        department: dto.department.trim(),
        type: dto.type ?? JobPositionType.FULL_TIME,
        experience: dto.experience ?? null,
        location: dto.location ?? null,
        badge: dto.badge ?? null,
        skills: this.normalizeSkills(dto.skills),
        description: dto.description ?? null,
        requirements: dto.requirements ?? null,
        benefits: dto.benefits ?? null,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder !== undefined ? Number(dto.sortOrder) : 0,
        publishedAt: dto.isActive !== false ? new Date() : null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        department: true,
        type: true,
        experience: true,
        location: true,
        badge: true,
        skills: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...position,
      skills: Array.isArray(position.skills) ? (position.skills as unknown as string[]) : [],
      type: position.type,
    };
  }

  async updatePosition(
    id: string,
    dto: UpdateJobPositionDto,
  ): Promise<JobPositionListItem> {
    const existing = await this.prisma.jobPosition.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('موقعیت شغلی یافت نشد.');
    }

    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      slug = dto.slug || this.generateSlug(dto.title);
      const conflict = await this.prisma.jobPosition.findUnique({
        where: { slug },
      });
      if (conflict && conflict.id !== id) {
        throw new BadRequestException('اسلاگ تکراری است.');
      }
    }

    const shouldPublish =
      dto.isActive !== undefined && dto.isActive === true && !existing.isActive;

    const position = await this.prisma.jobPosition.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        slug,
        department: dto.department ?? existing.department,
        type: dto.type ?? existing.type,
        experience:
          dto.experience !== undefined ? dto.experience : existing.experience,
        location:
          dto.location !== undefined ? dto.location : existing.location,
        badge: dto.badge !== undefined ? dto.badge : existing.badge,
        skills: dto.skills !== undefined ? this.normalizeSkills(dto.skills) : (existing.skills as any),
        description:
          dto.description !== undefined
            ? dto.description
            : existing.description,
        requirements:
          dto.requirements !== undefined
            ? dto.requirements
            : existing.requirements,
        benefits: dto.benefits !== undefined ? dto.benefits : existing.benefits,
        isActive:
          dto.isActive !== undefined ? dto.isActive : existing.isActive,
        sortOrder:
          dto.sortOrder !== undefined ? Number(dto.sortOrder) : existing.sortOrder,
        publishedAt: shouldPublish
          ? new Date()
          : existing.publishedAt,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        department: true,
        type: true,
        experience: true,
        location: true,
        badge: true,
        skills: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...position,
      skills: Array.isArray(position.skills) ? (position.skills as unknown as string[]) : [],
      type: position.type,
    };
  }

  async deletePosition(
    id: string,
    force = false,
  ): Promise<{ success: boolean; id: string }> {
    const existing = await this.prisma.jobPosition.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });
    if (!existing) {
      throw new NotFoundException('موقعیت شغلی یافت نشد.');
    }

    if (existing._count.applications > 0 && !force) {
      throw new BadRequestException(
        `امکان حذف این موقعیت وجود ندارد چون ${existing._count.applications} درخواست استخدامی مرتبط ثبت شده است. ابتدا می‌توانید آن را غیرفعال کنید یا گزینه حذف اجباری را تایید نمایید.`,
      );
    }

    await this.prisma.jobPosition.delete({ where: { id } });
    return { success: true, id };
  }

  async togglePositionActive(
    id: string,
    isActive: boolean,
  ): Promise<JobPositionListItem> {
    const existing = await this.prisma.jobPosition.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('موقعیت شغلی یافت نشد.');
    }

    const position = await this.prisma.jobPosition.update({
      where: { id },
      data: {
        isActive,
        publishedAt:
          isActive && !existing.isActive
            ? new Date()
            : existing.publishedAt,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        department: true,
        type: true,
        experience: true,
        location: true,
        badge: true,
        skills: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...position,
      skills: Array.isArray(position.skills) ? (position.skills as unknown as string[]) : [],
      type: position.type,
    };
  }

  // ─── Job Applications ──────────────────────────────────────────

  async createApplication(
    dto: CreateJobApplicationDto,
  ): Promise<JobApplicationListItem> {
    if (!dto.fullName || !dto.fullName.trim()) {
      throw new BadRequestException('نام و نام خانوادگی الزامی است.');
    }
    if (!dto.phoneNumber || !dto.phoneNumber.trim()) {
      throw new BadRequestException('شماره تماس الزامی است.');
    }
    if (!dto.email || !dto.email.trim()) {
      throw new BadRequestException('آدرس ایمیل الزامی است.');
    }

    let position = null;
    const isUuid =
      dto.positionId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        dto.positionId,
      );

    if (isUuid) {
      position = await this.prisma.jobPosition.findUnique({
        where: { id: dto.positionId },
        select: { id: true, title: true, isActive: true },
      });
    } else if (
      dto.positionId &&
      dto.positionId !== 'general' &&
      dto.positionId !== 'other' &&
      dto.positionId !== 'null' &&
      dto.positionId !== 'undefined'
    ) {
      position = await this.prisma.jobPosition.findFirst({
        where: { slug: dto.positionId },
        select: { id: true, title: true, isActive: true },
      });
    }

    if (!position) {
      position = await this.prisma.jobPosition.findFirst({
        where: { slug: 'general-application' },
        select: { id: true, title: true, isActive: true },
      });
      if (!position) {
        position = await this.prisma.jobPosition.create({
          data: {
            title: 'سایر تخصص‌ها و رزومه آزاد',
            slug: 'general-application',
            department: 'منابع انسانی',
            type: JobPositionType.FULL_TIME,
            location: 'تهران',
            badge: 'رزومه آزاد',
            skills: ['همکاری آزاد', 'سایر تخصص‌ها'],
            description: 'ارسال رزومه آزاد برای موقعیت‌های آینده ققنوس آکادمی',
            isActive: true,
            sortOrder: 999,
          },
          select: { id: true, title: true, isActive: true },
        });
      }
    }

    const trackingCode = this.generateTrackingCode();

    const application = await this.prisma.jobApplication.create({
      data: {
        positionId: position.id,
        fullName: dto.fullName.trim(),
        phoneNumber: dto.phoneNumber.trim(),
        email: dto.email.trim(),
        about: dto.about?.trim() || null,
        resumeFileName: dto.resumeFileName || 'resume.pdf',
        resumeFileUrl: dto.resumeFileUrl || '',
        trackingCode,
        status: JobApplicationStatus.PENDING,
      },
      select: {
        id: true,
        positionId: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        about: true,
        resumeFileName: true,
        resumeFileUrl: true,
        trackingCode: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapApplicationToItem(application, position.title);
  }

  async findAllApplications(
    page = 1,
    limit = 20,
    search?: string,
    status?: JobApplicationStatus,
    positionId?: string,
  ): Promise<{
    items: JobApplicationListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const cleanPage = Math.max(1, Number(page) || 1);
    const cleanLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (cleanPage - 1) * cleanLimit;

    const where: Prisma.JobApplicationWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { trackingCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        skip,
        take: cleanLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          position: {
            select: { title: true },
          },
        },
      }),
      this.prisma.jobApplication.count({ where }),
    ]);

    return {
      items: items.map((item) =>
        this.mapApplicationToItem(item, item.position.title),
      ),
      total,
      page: cleanPage,
      limit: cleanLimit,
      totalPages: Math.ceil(total / cleanLimit),
    };
  }

  async findApplicationById(id: string): Promise<JobApplicationListItem> {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id },
      include: { position: { select: { title: true } } },
    });
    if (!application) {
      throw new NotFoundException('درخواست استخدامی یافت نشد.');
    }
    return this.mapApplicationToItem(application, application.position.title);
  }

  async findApplicationByTrackingCode(
    trackingCode: string,
  ): Promise<JobApplicationListItem> {
    const application = await this.prisma.jobApplication.findUnique({
      where: { trackingCode },
      include: { position: { select: { title: true } } },
    });
    if (!application) {
      throw new NotFoundException('درخواست استخدامی با این کد رهگیری یافت نشد.');
    }
    return this.mapApplicationToItem(application, application.position.title);
  }

  async updateApplicationStatus(
    id: string,
    dto: UpdateJobApplicationStatusDto,
  ): Promise<JobApplicationListItem> {
    const existing = await this.prisma.jobApplication.findUnique({
      where: { id },
      include: { position: { select: { title: true } } },
    });
    if (!existing) {
      throw new NotFoundException('درخواست استخدامی یافت نشد.');
    }

    const updated = await this.prisma.jobApplication.update({
      where: { id },
      data: {
        status: dto.status,
        adminNotes:
          dto.adminNotes !== undefined ? dto.adminNotes : existing.adminNotes,
      },
      include: { position: { select: { title: true } } },
    });

    return this.mapApplicationToItem(updated, updated.position.title);
  }

  async deleteApplication(id: string): Promise<{ success: boolean; id: string }> {
    const existing = await this.prisma.jobApplication.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('درخواست استخدامی یافت نشد.');
    }

    await this.prisma.jobApplication.delete({ where: { id } });
    return { success: true, id };
  }

  async getStats(): Promise<{
    totalPositions: number;
    activePositions: number;
    totalApplications: number;
    pendingApplications: number;
    reviewedApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
  }> {
    const [
      totalPositions,
      activePositions,
      totalApplications,
      pendingApplications,
      reviewedApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      this.prisma.jobPosition.count(),
      this.prisma.jobPosition.count({ where: { isActive: true } }),
      this.prisma.jobApplication.count(),
      this.prisma.jobApplication.count({
        where: { status: JobApplicationStatus.PENDING },
      }),
      this.prisma.jobApplication.count({
        where: { status: JobApplicationStatus.REVIEWED },
      }),
      this.prisma.jobApplication.count({
        where: { status: JobApplicationStatus.ACCEPTED },
      }),
      this.prisma.jobApplication.count({
        where: { status: JobApplicationStatus.REJECTED },
      }),
    ]);

    return {
      totalPositions,
      activePositions,
      totalApplications,
      pendingApplications,
      reviewedApplications,
      acceptedApplications,
      rejectedApplications,
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────

  private normalizeSkills(skills: any): string[] {
    if (Array.isArray(skills)) {
      return skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {
        return skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  }

  private generateSlug(title: string): string {
    const random = randomUUID().substring(0, 8);
    return (
      title
        .toLowerCase()
        .replace(/[^\w\s-]/gi, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') +
      '-' +
      random
    );
  }

  private generateTrackingCode(): string {
    const prefix = 'JOB';
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  }

  private mapToDetail(
    position: JobPosition & {
      applications?: Array<{
        id: string;
        positionId: string;
        fullName: string;
        phoneNumber: string;
        email: string;
        about: string | null;
        resumeFileName: string;
        resumeFileUrl: string;
        trackingCode: string;
        status: JobApplicationStatus;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>;
    },
  ): JobPositionDetail {
    return {
      id: position.id,
      title: position.title,
      slug: position.slug,
      department: position.department,
      type: position.type,
      experience: position.experience ?? '',
      location: position.location ?? '',
      badge: position.badge ?? '',
      skills: Array.isArray(position.skills) ? (position.skills as unknown as string[]) : [],
      description: position.description ?? '',
      requirements: position.requirements ?? '',
      benefits: position.benefits ?? '',
      isActive: position.isActive,
      sortOrder: position.sortOrder,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
      publishedAt: position.publishedAt ?? null,
      applications: position.applications?.map((app) => ({
        id: app.id,
        positionId: app.positionId,
        positionTitle: position.title,
        fullName: app.fullName,
        phoneNumber: app.phoneNumber,
        email: app.email,
        about: app.about ?? '',
        resumeFileName: app.resumeFileName,
        resumeFileUrl: app.resumeFileUrl,
        trackingCode: app.trackingCode,
        status: app.status,
        adminNotes: app.adminNotes ?? '',
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      })),
    };
  }

  private mapApplicationToItem(
    application: {
      id: string;
      positionId: string;
      fullName: string;
      phoneNumber: string;
      email: string;
      about: string | null;
      resumeFileName: string;
      resumeFileUrl: string;
      trackingCode: string;
      status: JobApplicationStatus;
      adminNotes: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    positionTitle?: string,
  ): JobApplicationListItem {
    return {
      id: application.id,
      positionId: application.positionId,
      positionTitle: positionTitle ?? '',
      fullName: application.fullName,
      phoneNumber: application.phoneNumber,
      email: application.email,
      about: application.about ?? '',
      resumeFileName: application.resumeFileName,
      resumeFileUrl: application.resumeFileUrl,
      trackingCode: application.trackingCode,
      status: application.status,
      adminNotes: application.adminNotes ?? '',
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
