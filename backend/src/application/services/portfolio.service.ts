import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import { ContentStatus, Prisma } from '@prisma/client';

export interface PortfolioFeatureItem {
  value: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface PortfolioChallengeItem {
  title: string;
  description: string;
  solution: string;
  result: string;
  sortOrder?: number;
}

export interface PortfolioTechnologyItem {
  name: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface PortfolioAchievementItem {
  title: string;
  description: string;
  metric?: string;
  sortOrder?: number;
}

import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  client?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  projectDate?: string;

  @IsString()
  @IsOptional()
  summary!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  featuredImageAlt?: string;

  @IsArray()
  @IsOptional()
  @Type(() => Object)
  gallery?: any[];

  @IsArray()
  @IsOptional()
  @Type(() => Object)
  videos?: any[];

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsOptional()
  status?: ContentStatus;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  projectStatusLabel?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  focusKeyword?: string;

  @IsString()
  @IsOptional()
  seoKeywords?: string;

  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @IsString()
  @IsOptional()
  ogTitle?: string;

  @IsString()
  @IsOptional()
  ogDescription?: string;

  @IsString()
  @IsOptional()
  ogImage?: string;

  @IsBoolean()
  @IsOptional()
  isIndexable?: boolean;

  @IsBoolean()
  @IsOptional()
  isFollowable?: boolean;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  @Type(() => Object)
  features?: PortfolioFeatureItem[];

  @IsArray()
  @IsOptional()
  @Type(() => Object)
  challenges?: PortfolioChallengeItem[];

  @IsArray()
  @IsOptional()
  @Type(() => Object)
  technologies?: PortfolioTechnologyItem[];

  @IsArray()
  @IsOptional()
  @Type(() => Object)
  achievements?: PortfolioAchievementItem[];
}

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {}

export class PortfolioQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsOptional()
  isFeatured?: boolean | string;

  @IsString()
  @IsOptional()
  status?: string;
}

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async findAll(query: PortfolioQueryDto, isAdmin: boolean = false) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PortfolioWhereInput = {};

    // Public visitors only see PUBLISHED
    if (!isAdmin) {
      where.status = ContentStatus.PUBLISHED;
    } else if (query.status && query.status !== 'ALL') {
      where.status = query.status as ContentStatus;
    }

    if (query.isFeatured !== undefined && query.isFeatured !== '') {
      where.isFeatured = query.isFeatured === true || query.isFeatured === 'true';
    }

    if (query.category) {
      let decCategory = query.category;
      try {
        decCategory = decodeURIComponent(query.category);
      } catch {}
      where.OR = [
        { categoryId: query.category },
        { category: { slug: query.category } },
        { category: { slug: decCategory } },
      ];
    }

    if (query.tag) {
      let decTag = query.tag;
      try {
        decTag = decodeURIComponent(query.tag);
      } catch {}
      where.tags = {
        some: {
          tag: {
            OR: [
              { id: query.tag },
              { slug: query.tag },
              { slug: decTag },
              { name: query.tag },
              { name: decTag },
            ],
          },
        },
      };
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { client: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { focusKeyword: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.portfolio.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          features: {
            orderBy: { sortOrder: 'asc' },
          },
          challenges: {
            orderBy: { sortOrder: 'asc' },
          },
          technologies: {
            orderBy: { sortOrder: 'asc' },
          },
          achievements: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      this.prisma.portfolio.count({ where }),
    ]);

    const formatted = items.map((p) => this.mapPortfolioOutput(p));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findBySlugOrId(slugOrId: string, isAdmin: boolean = false) {
    let decodedSlug = slugOrId;
    for (let i = 0; i < 3; i++) {
      try {
        const next = decodeURIComponent(decodedSlug);
        if (next === decodedSlug) break;
        decodedSlug = next;
      } catch {
        break;
      }
    }
    let encodedSlug = decodedSlug;
    try {
      encodedSlug = encodeURIComponent(decodedSlug);
    } catch {}

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const hyphenated = decodedSlug.replace(/\s+/g, '-');
    const spaced = decodedSlug.replace(/-/g, ' ');
    let encodedHyphenated = hyphenated;
    try {
      encodedHyphenated = encodeURIComponent(hyphenated);
    } catch {}

    const slugCandidates = Array.from(
      new Set([slugOrId, decodedSlug, encodedSlug, hyphenated, spaced, encodedHyphenated].filter(Boolean))
    );

    const project = await this.prisma.portfolio.findFirst({
      where: isUuid
        ? { OR: [{ id: slugOrId }, ...slugCandidates.map((s) => ({ slug: s }))] }
        : { OR: slugCandidates.map((s) => ({ slug: s })) },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        features: {
          orderBy: { sortOrder: 'asc' },
        },
        challenges: {
          orderBy: { sortOrder: 'asc' },
        },
        technologies: {
          orderBy: { sortOrder: 'asc' },
        },
        achievements: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`نمونه‌کار با شناسه یا اسلاگ «${slugOrId}» یافت نشد.`);
    }

    if (!isAdmin && project.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('این نمونه‌کار هنوز منتشر نشده است یا در دسترس نیست.');
    }

    // Related projects (up to 3)
    const related = await this.prisma.portfolio.findMany({
      where: {
        id: { not: project.id },
        status: ContentStatus.PUBLISHED,
        ...(project.categoryId ? { categoryId: project.categoryId } : {}),
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        tags: { include: { tag: true } },
        features: { orderBy: { sortOrder: 'asc' } },
        challenges: { orderBy: { sortOrder: 'asc' } },
        technologies: { orderBy: { sortOrder: 'asc' } },
        achievements: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return {
      ...this.mapPortfolioOutput(project),
      relatedProjects: related.map((r) => this.mapPortfolioOutput(r)),
    };
  }

  public async create(dto: CreatePortfolioDto) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('عنوان پروژه الزامی است.');
    }

    const slug = await this.resolveUniqueSlug(dto.slug || dto.title);

    const created = await this.prisma.portfolio.create({
      data: {
        title: dto.title.trim(),
        slug,
        client: dto.client || null,
        location: dto.location || null,
        projectDate: dto.projectDate || null,
        summary: dto.summary || '',
        description: dto.description || '',
        featuredImage: dto.featuredImage || null,
        featuredImageAlt: dto.featuredImageAlt || dto.title.trim(),
        gallery: (dto.gallery || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))),
        videos: (dto.videos || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))),
        categoryId: dto.categoryId || null,
        status: dto.status || ContentStatus.DRAFT,
        isFeatured: dto.isFeatured ?? false,
        projectStatusLabel: dto.projectStatusLabel || 'تکمیل شده و تحویل نهایی',
        metaTitle: dto.metaTitle || dto.title.trim(),
        metaDescription: dto.metaDescription || dto.summary || '',
        focusKeyword: dto.focusKeyword || null,
        seoKeywords: dto.seoKeywords || null,
        canonicalUrl: dto.canonicalUrl || null,
        ogTitle: dto.ogTitle || dto.metaTitle || dto.title.trim(),
        ogDescription: dto.ogDescription || dto.metaDescription || dto.summary || '',
        ogImage: dto.ogImage || dto.featuredImage || null,
        isIndexable: dto.isIndexable ?? true,
        isFollowable: dto.isFollowable ?? true,
      },
    });

    // Save nested relations
    await Promise.all([
      this.syncTags(created.id, dto.tags || []),
      this.syncFeatures(created.id, dto.features || []),
      this.syncChallenges(created.id, dto.challenges || []),
      this.syncTechnologies(created.id, dto.technologies || []),
      this.syncAchievements(created.id, dto.achievements || []),
      this.syncMediaAttachments(
        created.id,
        dto.featuredImage,
        dto.featuredImageAlt,
        dto.gallery,
        dto.videos,
      ),
    ]);

    return this.findBySlugOrId(created.id, true);
  }

  public async update(id: string, dto: UpdatePortfolioDto) {
    const existing = await this.prisma.portfolio.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`نمونه‌کار با شناسه «${id}» یافت نشد.`);
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug.trim() !== existing.slug) {
      slug = await this.resolveUniqueSlug(dto.slug.trim(), id);
    }

    await this.prisma.portfolio.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        slug,
        ...(dto.client !== undefined ? { client: dto.client } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.projectDate !== undefined ? { projectDate: dto.projectDate } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.featuredImage !== undefined ? { featuredImage: dto.featuredImage } : {}),
        ...(dto.featuredImageAlt !== undefined ? { featuredImageAlt: dto.featuredImageAlt } : {}),
        ...(dto.gallery !== undefined ? { gallery: (dto.gallery || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))) } : {}),
        ...(dto.videos !== undefined ? { videos: (dto.videos || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))) } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId || null } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.projectStatusLabel !== undefined ? { projectStatusLabel: dto.projectStatusLabel } : {}),
        ...(dto.metaTitle !== undefined ? { metaTitle: dto.metaTitle } : {}),
        ...(dto.metaDescription !== undefined ? { metaDescription: dto.metaDescription } : {}),
        ...(dto.focusKeyword !== undefined ? { focusKeyword: dto.focusKeyword } : {}),
        ...(dto.seoKeywords !== undefined ? { seoKeywords: dto.seoKeywords } : {}),
        ...(dto.canonicalUrl !== undefined ? { canonicalUrl: dto.canonicalUrl } : {}),
        ...(dto.ogTitle !== undefined ? { ogTitle: dto.ogTitle } : {}),
        ...(dto.ogDescription !== undefined ? { ogDescription: dto.ogDescription } : {}),
        ...(dto.ogImage !== undefined ? { ogImage: dto.ogImage } : {}),
        ...(dto.isIndexable !== undefined ? { isIndexable: dto.isIndexable } : {}),
        ...(dto.isFollowable !== undefined ? { isFollowable: dto.isFollowable } : {}),
      },
    });

    if (dto.tags !== undefined) {
      await this.syncTags(id, dto.tags);
    }
    if (dto.features !== undefined) {
      await this.syncFeatures(id, dto.features);
    }
    if (dto.challenges !== undefined) {
      await this.syncChallenges(id, dto.challenges);
    }
    if (dto.technologies !== undefined) {
      await this.syncTechnologies(id, dto.technologies);
    }
    if (dto.achievements !== undefined) {
      await this.syncAchievements(id, dto.achievements);
    }
    if (
      dto.featuredImage !== undefined ||
      dto.featuredImageAlt !== undefined ||
      dto.gallery !== undefined ||
      dto.videos !== undefined
    ) {
      await this.syncMediaAttachments(
        id,
        dto.featuredImage !== undefined ? dto.featuredImage : existing.featuredImage || undefined,
        dto.featuredImageAlt !== undefined ? dto.featuredImageAlt : existing.featuredImageAlt || undefined,
        dto.gallery !== undefined ? dto.gallery : (existing.gallery as any) || [],
        dto.videos !== undefined ? dto.videos : (existing.videos as any) || [],
      );
    }

    return this.findBySlugOrId(id, true);
  }

  public async delete(id: string) {
    const existing = await this.prisma.portfolio.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`نمونه‌کار با شناسه «${id}» یافت نشد.`);
    }

    await this.prisma.portfolio.delete({ where: { id } });
    return { success: true, id };
  }

  public async updateStatus(id: string, status: ContentStatus) {
    const existing = await this.prisma.portfolio.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`نمونه‌کار با شناسه «${id}» یافت نشد.`);
    }

    const updated = await this.prisma.portfolio.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        tags: { include: { tag: true } },
        features: true,
        challenges: true,
        technologies: true,
        achievements: true,
      },
    });

    return this.mapPortfolioOutput(updated);
  }

  // Categories
  public async getCategories() {
    const categories = await this.prisma.portfolioCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { portfolios: { where: { status: ContentStatus.PUBLISHED } } },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      projectCount: c._count.portfolios,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  public async createCategory(data: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    const slug = data.slug?.trim() || data.name.trim().toLowerCase().replace(/[\s\/\\]+/g, '-');
    return this.prisma.portfolioCategory.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  public async updateCategory(id: string, data: Partial<{ name: string; slug: string; description: string; sortOrder: number; isActive: boolean }>) {
    return this.prisma.portfolioCategory.update({
      where: { id },
      data,
    });
  }

  public async deleteCategory(id: string) {
    await this.prisma.portfolioCategory.delete({ where: { id } });
    return { success: true, id };
  }

  // Tags
  public async getTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { portfolios: true },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      projectCount: t._count.portfolios,
    }));
  }

  private async syncTags(portfolioId: string, tagNames: string[]) {
    await this.prisma.portfolioTag.deleteMany({ where: { portfolioId } });

    for (const rawName of tagNames) {
      const name = rawName.trim();
      if (!name) continue;

      const slug = name.toLowerCase().replace(/[\s\/\\]+/g, '-');
      const tag = await this.prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name, slug },
      });

      await this.prisma.portfolioTag.upsert({
        where: {
          portfolioId_tagId: {
            portfolioId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          portfolioId,
          tagId: tag.id,
        },
      });
    }
  }

  private async syncFeatures(portfolioId: string, features: PortfolioFeatureItem[]) {
    await this.prisma.portfolioFeature.deleteMany({ where: { portfolioId } });
    const valid = (features || []).filter((f) => f && typeof f === 'object' && !Array.isArray(f) && (f.title || f.value));
    if (!valid.length) return;

    await this.prisma.portfolioFeature.createMany({
      data: valid.map((f, idx) => ({
        portfolioId,
        value: f.value || '',
        title: f.title || '',
        description: f.description || '',
        sortOrder: typeof f.sortOrder === 'number' ? f.sortOrder : idx + 1,
      })),
    });
  }

  private async syncChallenges(portfolioId: string, challenges: PortfolioChallengeItem[]) {
    await this.prisma.portfolioChallenge.deleteMany({ where: { portfolioId } });
    const valid = (challenges || []).filter((ch) => ch && typeof ch === 'object' && !Array.isArray(ch) && (ch.title || ch.solution || ch.description));
    if (!valid.length) return;

    await this.prisma.portfolioChallenge.createMany({
      data: valid.map((ch, idx) => ({
        portfolioId,
        title: ch.title || '',
        description: ch.description || '',
        solution: ch.solution || '',
        result: ch.result || '',
        sortOrder: typeof ch.sortOrder === 'number' ? ch.sortOrder : idx + 1,
      })),
    });
  }

  private async syncTechnologies(portfolioId: string, technologies: PortfolioTechnologyItem[]) {
    await this.prisma.portfolioTechnology.deleteMany({ where: { portfolioId } });
    const valid = (technologies || []).filter((t) => t && typeof t === 'object' && !Array.isArray(t) && t.name);
    if (!valid.length) return;

    await this.prisma.portfolioTechnology.createMany({
      data: valid.map((t, idx) => ({
        portfolioId,
        name: t.name || '',
        description: t.description || null,
        iconUrl: t.iconUrl || null,
        sortOrder: typeof t.sortOrder === 'number' ? t.sortOrder : idx + 1,
      })),
    });
  }

  private async syncAchievements(portfolioId: string, achievements: PortfolioAchievementItem[]) {
    await this.prisma.portfolioAchievement.deleteMany({ where: { portfolioId } });
    const valid = (achievements || []).filter((a) => a && typeof a === 'object' && !Array.isArray(a) && (a.title || a.description));
    if (!valid.length) return;

    await this.prisma.portfolioAchievement.createMany({
      data: valid.map((a, idx) => ({
        portfolioId,
        title: a.title || '',
        description: a.description || '',
        metric: a.metric || null,
        sortOrder: typeof a.sortOrder === 'number' ? a.sortOrder : idx + 1,
      })),
    });
  }

  private async syncMediaAttachments(
    portfolioId: string,
    featuredImage?: string,
    featuredImageAlt?: string,
    gallery?: any[],
    videos?: any[],
  ) {
    try {
      await this.prisma.mediaAttachment.deleteMany({ where: { portfolioId } });

      const records: Prisma.MediaAttachmentCreateManyInput[] = [];
      let sortOrder = 1;

      if (featuredImage && typeof featuredImage === 'string' && featuredImage.trim()) {
        const filename = featuredImage.split('/').pop() || 'featured-image';
        records.push({
          portfolioId,
          url: featuredImage,
          filename,
          originalName: filename,
          mimeType: 'image/webp',
          fileSize: 0,
          mediaType: 'FEATURED_IMAGE',
          altText: featuredImageAlt || null,
          sortOrder: sortOrder++,
        });
      }

      if (Array.isArray(gallery)) {
        for (const item of gallery) {
          const url = typeof item === 'string' ? item : item?.url;
          if (!url) continue;
          const filename = url.split('/').pop() || 'gallery-image';
          records.push({
            portfolioId,
            url,
            filename,
            originalName: filename,
            mimeType: 'image/webp',
            fileSize: 0,
            mediaType: 'GALLERY_IMAGE',
            altText: item?.alt || item?.title || null,
            caption: item?.caption || null,
            sortOrder: sortOrder++,
          });
        }
      }

      if (Array.isArray(videos)) {
        for (const item of videos) {
          const url = typeof item === 'string' ? item : item?.url;
          if (!url) continue;
          const filename = url.split('/').pop() || 'video';
          records.push({
            portfolioId,
            url,
            filename,
            originalName: filename,
            mimeType: 'video/mp4',
            fileSize: 0,
            mediaType: 'VIDEO',
            altText: item?.title || null,
            caption: item?.caption || null,
            sortOrder: sortOrder++,
          });
        }
      }

      if (records.length > 0) {
        await this.prisma.mediaAttachment.createMany({ data: records });
      }
    } catch (err) {
      this.logger.warn(`Failed to sync media attachments for portfolio ${portfolioId}:`, err);
    }
  }

  private async resolveUniqueSlug(baseText: string, currentId?: string): Promise<string> {
    let rawText = baseText;
    for (let i = 0; i < 3; i++) {
      try {
        const next = decodeURIComponent(rawText);
        if (next === rawText) break;
        rawText = next;
      } catch {
        break;
      }
    }

    let clean = rawText
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\-_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!clean) clean = `project-${Date.now()}`;

    let candidate = clean;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.portfolio.findUnique({ where: { slug: candidate } });
      if (!existing || (currentId && existing.id === currentId)) {
        return candidate;
      }
      candidate = `${clean}-${counter++}`;
    }
  }

  private mapPortfolioOutput(project: any) {
    const tags = (project.tags || []).map((t: any) => t.tag?.name || t.name);

    const rawGallery = Array.isArray(project.gallery) ? project.gallery : [];
    const rawVideos = Array.isArray(project.videos) ? project.videos : [];

    const cleanGallery = rawGallery
      .filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item) && (item.url || item.src))))
      .map((item: any, idx: number) => typeof item === 'string' ? { id: `port-img-${idx}`, type: 'image', url: item } : item);

    const cleanVideos = rawVideos
      .filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item) && (item.url || item.src))))
      .map((item: any, idx: number) => typeof item === 'string' ? { id: `port-vid-${idx}`, type: 'video', url: item } : item);

    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      client: project.client || '',
      location: project.location || '',
      projectDate: project.projectDate || '',
      year: project.projectDate || '',
      summary: project.summary,
      description: project.description,
      featuredImage: project.featuredImage,
      featuredImageAlt: project.featuredImageAlt,
      imageUrl: project.featuredImage,
      gallery: cleanGallery,
      videos: cleanVideos,
      categoryId: project.categoryId,
      categoryName: project.category?.name || 'عمومی',
      categorySlug: project.category?.slug || 'general',
      category: project.category,
      status: project.status,
      isFeatured: project.isFeatured,
      projectStatusLabel: project.projectStatusLabel || 'تکمیل شده و تحویل نهایی',
      statusLabel: project.projectStatusLabel || 'تکمیل شده و تحویل نهایی',
      metaTitle: project.metaTitle,
      metaDescription: project.metaDescription,
      focusKeyword: project.focusKeyword,
      seoKeywords: project.seoKeywords,
      canonicalUrl: project.canonicalUrl,
      ogTitle: project.ogTitle,
      ogDescription: project.ogDescription,
      ogImage: project.ogImage,
      isIndexable: project.isIndexable,
      isFollowable: project.isFollowable,
      tags,
      features: (project.features || []).map((f: any) => ({
        id: f.id,
        value: f.value,
        title: f.title,
        description: f.description,
        sortOrder: f.sortOrder,
      })),
      metrics: (project.features || []).map((f: any) => ({
        label: f.title,
        value: f.value,
        hint: f.description,
      })),
      challenges: (project.challenges || []).map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        solution: ch.solution,
        result: ch.result,
        sortOrder: ch.sortOrder,
      })),
      // backward compatibility for components reading single challenge/solution/results
      challenge: project.challenges?.[0]?.description || '',
      solution: project.challenges?.[0]?.solution || '',
      results: (project.challenges || []).map((ch: any) => ch.result).filter(Boolean),
      technologies: (project.technologies || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        iconUrl: t.iconUrl,
        sortOrder: t.sortOrder,
      })),
      hardwareUsed: (project.technologies || []).map((t: any) => ({
        name: t.name,
        brand: t.description || 'اورجینال',
      })),
      achievements: (project.achievements || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        metric: a.metric,
        sortOrder: a.sortOrder,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
