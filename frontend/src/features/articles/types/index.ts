import { MediaItem } from "@/shared/types";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ArticleCategory =
  | "all"
  | "switching"
  | "fiber"
  | "mikrotik"
  | "passive"
  | (string & {});

export interface ArticleCategoryInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  articleCount?: number;
}

export interface ArticleAuthor {
  name: string;
  role: string;
  avatarText?: string;
  avatarUrl?: string;
}

export type ArticleMediaItem = MediaItem;

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  paragraphs?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  imageUrl: string;
  gallery?: ArticleMediaItem[];
  videos?: ArticleMediaItem[];
  categoryId?: string;
  categoryName: string;
  categorySlug?: string;
  category: ArticleCategory;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  author?: ArticleAuthor;
  publishedAt: string;
  publishedAtRaw?: string;
  status?: ContentStatus;
  isFeatured?: boolean;
  readTime: string;
  views: number | string;
  tags: string[];
  keyTakeaways?: string[];
  badgeColor?: string;
  glowColor?: string;

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  isIndexable?: boolean;
  isFollowable?: boolean;

  relatedArticles?: ArticleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleFormData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  gallery?: ArticleMediaItem[];
  videos?: ArticleMediaItem[];
  categoryId?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  publishedAt?: string;
  status?: ContentStatus;
  isFeatured?: boolean;
  readTime?: string;
  tags?: string[];

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  isIndexable?: boolean;
  isFollowable?: boolean;
}

export interface ArticleQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  isFeatured?: boolean | string;
  status?: string;
}

export interface PaginatedArticlesResponse {
  items: ArticleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
