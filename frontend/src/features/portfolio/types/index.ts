import { MediaItem } from "@/shared/types";
import { ContentStatus } from "@/features/articles/types";

export type { ContentStatus };
export type ProjectCategory = string;

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  projectCount?: number;
}

export interface PortfolioFeatureItem {
  id?: string;
  value: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface PortfolioChallengeItem {
  id?: string;
  title: string;
  description: string;
  solution: string;
  result: string;
  sortOrder?: number;
}

export interface PortfolioTechnologyItem {
  id?: string;
  name: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface PortfolioAchievementItem {
  id?: string;
  title: string;
  description: string;
  metric?: string;
  sortOrder?: number;
}

export type PortfolioMediaItem = MediaItem;

// Backward compatibility interfaces
export interface ProjectMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface HardwareItem {
  name: string;
  brand: string;
  count?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: any;
  categoryName: string;
  categorySlug?: string;
  categoryId?: string;
  year: string;
  projectDate?: string;
  location: string;
  summary: string;
  description: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  imageUrl: string;
  gallery?: PortfolioMediaItem[];
  videos?: PortfolioMediaItem[];
  status: ContentStatus | "completed" | "in_support";
  statusLabel: string;
  projectStatusLabel?: string;
  isFeatured?: boolean;
  accentColor?: string;
  glowColor?: string;
  tags: string[];

  // Detailed Subsections
  features?: PortfolioFeatureItem[];
  metrics: ProjectMetric[];
  challenges?: PortfolioChallengeItem[];
  challenge?: string;
  solution?: string;
  results?: string[];
  technologies?: PortfolioTechnologyItem[];
  hardwareUsed: HardwareItem[];
  achievements?: PortfolioAchievementItem[];

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

  relatedProjects?: ProjectItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioFormData {
  title: string;
  slug?: string;
  client?: string;
  location?: string;
  projectDate?: string;
  summary: string;
  description: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  gallery?: PortfolioMediaItem[];
  videos?: PortfolioMediaItem[];
  categoryId?: string;
  status?: ContentStatus;
  isFeatured?: boolean;
  projectStatusLabel?: string;
  tags?: string[];
  features?: PortfolioFeatureItem[];
  challenges?: PortfolioChallengeItem[];
  technologies?: PortfolioTechnologyItem[];
  achievements?: PortfolioAchievementItem[];

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

export interface PortfolioQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  isFeatured?: boolean | string;
  status?: string;
}

export interface PaginatedPortfolioResponse {
  items: ProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
