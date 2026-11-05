export type NavBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "info"
  | "purple"
  | "orange"
  | "sky"
  | "emerald";

export interface DrawerBadgeInfo {
  badge?: string;
  badgeColor?: NavBadgeVariant | string;
}

export type AdminPageCategory =
  | "overview"
  | "commerce"
  | "partners"
  | "inventory"
  | "system"
  | "content";

export interface AdminPageDefinition {
  id: string;
  title: string;
  shortDescription: string;
  category: AdminPageCategory;
  categoryLabel: string;
  iconName: string;
  href: string;
  badge?: string;
  badgeVariant?: NavBadgeVariant;
}

export type PartnerPageCategory =
  | "overview"
  | "connectivity"
  | "procurement"
  | "finance"
  | "operations"
  | "services"
  | "legal";

export interface PartnerPageDefinition {
  id: string;
  title: string;
  shortDescription: string;
  category: PartnerPageCategory;
  categoryLabel: string;
  iconName: string;
  href: string;
  badge?: string;
  badgeVariant?: NavBadgeVariant;
}

export interface CustomerNavItemConfig {
  id: string;
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeColor?: NavBadgeVariant | string;
}

export interface CustomerNavCategoryConfig {
  key: string;
  title: string;
  subtitle: string;
  iconName: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  rolesAllowed: string[];
  items: CustomerNavItemConfig[];
}

export interface CategoryHeaderConfig {
  key: string;
  title: string;
  subtitle: string;
  iconName: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  rolesAllowed: string[];
}
