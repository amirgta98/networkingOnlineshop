import { MediaItem } from "@/shared/types";

export type ProjectCategory =
  | "all"
  | "datacenter"
  | "switching"
  | "wireless"
  | "security";

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
  category: ProjectCategory;
  categoryName: string;
  year: string;
  location: string;
  summary: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: ProjectMetric[];
  hardwareUsed: HardwareItem[];
  tags: string[];
  status: "completed" | "in_support";
  statusLabel: string;
  accentColor: string;
  glowColor: string;
  imageUrl: string;
  gallery?: MediaItem[];
}

