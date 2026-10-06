import { MediaItem } from "@/shared/types";

export type ArticleCategory =
  | "all"
  | "switching"
  | "fiber"
  | "mikrotik"
  | "passive";

export interface ArticleAuthor {
  name: string;
  role: string;
  avatarText: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  paragraphs: string[];
  category: ArticleCategory;
  categoryName: string;
  readTime: string;
  publishedAt: string;
  author: ArticleAuthor;
  keyTakeaways: string[];
  tags: string[];
  views: string;
  badgeColor: string;
  glowColor: string;
  imageUrl: string;
  gallery?: MediaItem[];
}

