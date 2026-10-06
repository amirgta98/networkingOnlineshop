export interface MilestoneItem {
  id: string;
  year: string;
  title: string;
  summary: string;
  badge?: string;
  metrics?: string;
  iconName: "flag" | "shield" | "server" | "award" | "network" | "sparkles";
}

export interface CoreValueItem {
  id: string;
  title: string;
  description: string;
  highlight: string;
  iconName: "shieldCheck" | "cpu" | "truck" | "headset" | "tag" | "refreshCw";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  certification?: string;
  experience: string;
  bio: string;
  avatarInitials: string;
  email?: string;
  linkedin?: string;
}

export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel: string;
  iconName: "users" | "server" | "shieldCheck" | "clock" | "package" | "award";
}

export interface ContactChannel {
  id: string;
  title: string;
  subtitle: string;
  primaryValue: string;
  actionLabel: string;
  actionHref: string;
  badge?: string;
  type: "phone" | "email" | "address" | "messenger" | "hours";
}

export interface PartnerBrand {
  id: string;
  name: string;
  tier: string;
  description: string;
  country: string;
}

export interface AboutFAQItem {
  id: string;
  question: string;
  answer: string;
  category: "company" | "warranty" | "procurement" | "visit";
}

export interface ContactFormData {
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  inquiryType: "general" | "sales" | "enterprise" | "technical" | "partnership";
  subject: string;
  message: string;
}
