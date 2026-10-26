import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import { ContentStatus, Prisma } from '@prisma/client';

import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt!: string;

  @IsString()
  @IsOptional()
  content!: string;

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

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsString()
  @IsOptional()
  authorRole?: string;

  @IsString()
  @IsOptional()
  authorAvatar?: string;

  @IsOptional()
  publishedAt?: string | Date;

  @IsOptional()
  status?: ContentStatus;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  readTime?: string;

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
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class ArticleQueryDto {
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
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async findAll(query: ArticleQueryDto, isAdmin: boolean = false) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    // Status filtering: public visitors only see PUBLISHED articles
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
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { focusKeyword: { contains: q, mode: 'insensitive' } },
        { authorName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    const formatted = items.map((art) => this.mapArticleOutput(art));

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

    const article = await this.prisma.article.findFirst({
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
      },
    });

    if (!article) {
      throw new NotFoundException(`مقاله مورد نظر با شناسه یا اسلاگ «${slugOrId}» یافت نشد.`);
    }

    if (!isAdmin && article.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('این مقاله هنوز منتشر نشده است یا در دسترس نیست.');
    }

    // Increment views for published articles if public lookup
    if (!isAdmin && article.status === ContentStatus.PUBLISHED) {
      this.prisma.article
        .update({
          where: { id: article.id },
          data: { views: { increment: 1 } },
        })
        .catch((err) => this.logger.warn(`Could not increment views for article ${article.id}`, err));
    }

    // Fetch related articles (up to 3) in same category or with common tags
    const related = await this.prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: ContentStatus.PUBLISHED,
        ...(article.categoryId ? { categoryId: article.categoryId } : {}),
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return {
      ...this.mapArticleOutput(article),
      relatedArticles: related.map((r) => this.mapArticleOutput(r)),
    };
  }

  public async create(dto: CreateArticleDto, userId?: string) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('عنوان مقاله الزامی است.');
    }

    const slug = await this.resolveUniqueSlug(dto.slug || dto.title);

    let publishedAt: Date | null = null;
    if (dto.status === ContentStatus.PUBLISHED) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : new Date();
    } else if (dto.publishedAt) {
      publishedAt = new Date(dto.publishedAt);
    }

    const created = await this.prisma.article.create({
      data: {
        title: dto.title.trim(),
        slug,
        excerpt: dto.excerpt || '',
        content: dto.content || '',
        featuredImage: dto.featuredImage || null,
        featuredImageAlt: dto.featuredImageAlt || dto.title.trim(),
        gallery: (dto.gallery || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))),
        videos: (dto.videos || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))),
        categoryId: dto.categoryId || null,
        authorName: dto.authorName || 'تیم فنی ققنوس آکادمی',
        authorRole: dto.authorRole || 'کارشناس ارشد زیرساخت شبکه',
        authorAvatar: dto.authorAvatar || 'ق‌آ',
        authorId: userId || null,
        publishedAt,
        status: dto.status || ContentStatus.DRAFT,
        isFeatured: dto.isFeatured ?? false,
        readTime: dto.readTime || '۵ دقیقه',
        metaTitle: dto.metaTitle || dto.title.trim(),
        metaDescription: dto.metaDescription || dto.excerpt || '',
        focusKeyword: dto.focusKeyword || null,
        seoKeywords: dto.seoKeywords || null,
        canonicalUrl: dto.canonicalUrl || null,
        ogTitle: dto.ogTitle || dto.metaTitle || dto.title.trim(),
        ogDescription: dto.ogDescription || dto.metaDescription || dto.excerpt || '',
        ogImage: dto.ogImage || dto.featuredImage || null,
        isIndexable: dto.isIndexable ?? true,
        isFollowable: dto.isFollowable ?? true,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (dto.tags && Array.isArray(dto.tags) && dto.tags.length > 0) {
      await this.syncTags(created.id, dto.tags);
    }

    await this.syncMediaAttachments(
      created.id,
      dto.featuredImage,
      dto.featuredImageAlt,
      dto.gallery,
      dto.videos,
    );

    return this.findBySlugOrId(created.id, true);
  }

  public async update(id: string, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`مقاله با شناسه «${id}» یافت نشد.`);
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug.trim() !== existing.slug) {
      slug = await this.resolveUniqueSlug(dto.slug.trim(), id);
    }

    let publishedAt = existing.publishedAt;
    if (dto.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (dto.publishedAt !== undefined) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    await this.prisma.article.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        slug,
        ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.featuredImage !== undefined ? { featuredImage: dto.featuredImage } : {}),
        ...(dto.featuredImageAlt !== undefined ? { featuredImageAlt: dto.featuredImageAlt } : {}),
        ...(dto.gallery !== undefined ? { gallery: (dto.gallery || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))) } : {}),
        ...(dto.videos !== undefined ? { videos: (dto.videos || []).filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item)))) } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId || null } : {}),
        ...(dto.authorName !== undefined ? { authorName: dto.authorName } : {}),
        ...(dto.authorRole !== undefined ? { authorRole: dto.authorRole } : {}),
        ...(dto.authorAvatar !== undefined ? { authorAvatar: dto.authorAvatar } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        publishedAt,
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.readTime !== undefined ? { readTime: dto.readTime } : {}),
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

    if (dto.tags !== undefined && Array.isArray(dto.tags)) {
      await this.syncTags(id, dto.tags);
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
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`مقاله با شناسه «${id}» یافت نشد.`);
    }

    await this.prisma.article.delete({ where: { id } });
    return { success: true, id };
  }

  public async updateStatus(id: string, status: ContentStatus) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`مقاله با شناسه «${id}» یافت نشد.`);
    }

    const publishedAt =
      status === ContentStatus.PUBLISHED && !existing.publishedAt ? new Date() : existing.publishedAt;

    const updated = await this.prisma.article.update({
      where: { id },
      data: { status, publishedAt },
      include: { category: true, tags: { include: { tag: true } } },
    });

    return this.mapArticleOutput(updated);
  }

  // Categories
  public async getCategories() {
    const categories = await this.prisma.articleCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { articles: { where: { status: ContentStatus.PUBLISHED } } },
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
      articleCount: c._count.articles,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  public async createCategory(data: { name: string; slug?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    const slug = data.slug?.trim() || data.name.trim().toLowerCase().replace(/[\s\/\\]+/g, '-');
    return this.prisma.articleCategory.create({
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
    return this.prisma.articleCategory.update({
      where: { id },
      data,
    });
  }

  public async deleteCategory(id: string) {
    await this.prisma.articleCategory.delete({ where: { id } });
    return { success: true, id };
  }

  // Tags
  public async getTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      articleCount: t._count.articles,
    }));
  }

  private async syncTags(articleId: string, tagNames: string[]) {
    await this.prisma.articleTag.deleteMany({ where: { articleId } });

    for (const rawName of tagNames) {
      const name = rawName.trim();
      if (!name) continue;

      const slug = name.toLowerCase().replace(/[\s\/\\]+/g, '-');
      const tag = await this.prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name, slug },
      });

      await this.prisma.articleTag.upsert({
        where: {
          articleId_tagId: {
            articleId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          articleId,
          tagId: tag.id,
        },
      });
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

    if (!clean) clean = `article-${Date.now()}`;

    let candidate = clean;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.article.findUnique({ where: { slug: candidate } });
      if (!existing || (currentId && existing.id === currentId)) {
        return candidate;
      }
      candidate = `${clean}-${counter++}`;
    }
  }

  private async syncMediaAttachments(
    articleId: string,
    featuredImage?: string,
    featuredImageAlt?: string,
    gallery?: any[],
    videos?: any[],
  ) {
    try {
      await this.prisma.mediaAttachment.deleteMany({ where: { articleId } });

      const records: Prisma.MediaAttachmentCreateManyInput[] = [];
      let sortOrder = 1;

      if (featuredImage && typeof featuredImage === 'string' && featuredImage.trim()) {
        const filename = featuredImage.split('/').pop() || 'featured-image';
        records.push({
          articleId,
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
            articleId,
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
            articleId,
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
      this.logger.warn(`Failed to sync media attachments for article ${articleId}:`, err);
    }
  }

  private mapArticleOutput(article: any) {
    const tags = (article.tags || []).map((t: any) => t.tag?.name || t.name);

    const rawGallery = Array.isArray(article.gallery) ? article.gallery : [];
    const rawVideos = Array.isArray(article.videos) ? article.videos : [];

    const cleanGallery = rawGallery
      .filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item) && (item.url || item.src))))
      .map((item: any, idx: number) => typeof item === 'string' ? { id: `art-img-${idx}`, type: 'image', url: item } : item);

    const cleanVideos = rawVideos
      .filter((item: any) => item && (typeof item === 'string' || (typeof item === 'object' && !Array.isArray(item) && (item.url || item.src))))
      .map((item: any, idx: number) => typeof item === 'string' ? { id: `art-vid-${idx}`, type: 'video', url: item } : item);

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      featuredImage: article.featuredImage,
      featuredImageAlt: article.featuredImageAlt,
      imageUrl: article.featuredImage, // backward compatibility
      gallery: cleanGallery,
      videos: cleanVideos,
      categoryId: article.categoryId,
      categoryName: article.category?.name || 'عمومی',
      categorySlug: article.category?.slug || 'general',
      category: article.category,
      authorName: article.authorName,
      authorRole: article.authorRole,
      authorAvatar: article.authorAvatar,
      author: {
        name: article.authorName,
        role: article.authorRole,
        avatarText: article.authorAvatar,
      },
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : null,
      publishedAtRaw: article.publishedAt,
      status: article.status,
      isFeatured: article.isFeatured,
      readTime: article.readTime || '۵ دقیقه',
      views: article.views,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      focusKeyword: article.focusKeyword,
      seoKeywords: article.seoKeywords,
      canonicalUrl: article.canonicalUrl,
      ogTitle: article.ogTitle,
      ogDescription: article.ogDescription,
      ogImage: article.ogImage,
      isIndexable: article.isIndexable,
      isFollowable: article.isFollowable,
      tags,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
