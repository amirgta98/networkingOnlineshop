export type InstallationServiceCategory =
  | "cabling"
  | "datacenter"
  | "cctv"
  | "wireless"
  | "switching"
  | "fiber"
  | "ups-power"
  | "other";

export type ProjectScale = "small" | "medium" | "large" | "enterprise";

export type BuildingType =
  | "office"
  | "industrial"
  | "warehouse"
  | "datacenter"
  | "retail"
  | "residential"
  | "educational"
  | "medical";

export type EquipmentStatus =
  | "already_purchased"
  | "need_purchase_from_netmarket"
  | "need_consultation";

export type PreferredTimeline =
  | "urgent"
  | "this_week"
  | "next_two_weeks"
  | "flexible";

export interface InstallationServiceItem {
  id: InstallationServiceCategory;
  title: string;
  badge: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  standard: string;
  toolsUsed: string[];
  unit: string;
  basePriceEstimate: number; // in Tomans
  durationEstimate: string;
  warrantyMonths: number;
  features: string[];
  recommendedFor: string;
}

export interface InstallationRequestFormData {
  serviceType: InstallationServiceCategory;
  secondaryServices: InstallationServiceCategory[];
  projectScale: ProjectScale;
  buildingType: BuildingType;
  approximateArea: number; // in square meters
  nodeCount: number; // number of RJ45 ports / nodes
  cctvCount: number; // number of cameras
  rackCount: number; // number of racks
  fiberCoreCount: number; // fiber cores
  equipmentStatus: EquipmentStatus;
  needsFlukeTest: boolean;
  needsOnsiteSurvey: boolean;
  preferredTimeline: PreferredTimeline;
  province: string;
  city: string;
  address: string;
  fullName: string;
  companyName: string;
  phoneNumber: string;
  email?: string;
  notes: string;
  hasAttachment: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
}

export type InstallationStatus =
  | "PENDING_REVIEW"
  | "ASSIGNED"
  | "SURVEY_SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface InstallationAdminItem {
  id: string;
  trackingCode: string;
  serviceType: InstallationServiceCategory;
  serviceTitle: string;
  secondaryServices?: InstallationServiceCategory[];
  projectScale: ProjectScale;
  buildingType: BuildingType;
  approximateArea: number;
  nodeCount: number;
  cctvCount: number;
  rackCount: number;
  fiberCoreCount: number;
  equipmentStatus: EquipmentStatus;
  needsFlukeTest: boolean;
  needsOnsiteSurvey: boolean;
  preferredTimeline: PreferredTimeline;
  province: string;
  city: string;
  address: string;
  fullName: string;
  companyName?: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
  hasAttachment: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
  status: InstallationStatus;
  estimatedDays?: string;
  minEstimatedCost: number;
  maxEstimatedCost: number;
  finalQuotationAmount?: number | null;
  assignedTeamLead?: string;
  assignedTeamRole?: string;
  assignedTeamPhone?: string;
  statusPercent: number;
  currentStepIndex: number;
  trackingSteps?: TrackingStep[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email?: string;
    phone?: string;
  };
}

export interface InstallationStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalEstimatedValue: number;
  flukeAdoptionRate: number;
  serviceDistribution: Record<string, number>;
  provinceDistribution: Record<string, number>;
}

export interface InstallationQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  province?: string;
}

export interface PaginatedInstallationResponse {
  items: InstallationAdminItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export interface InstallationSubmissionResult {
  trackingCode: string;
  submittedAt: string;
  estimatedDays: string;
  estimatedCostRange: {
    min: number;
    max: number;
  };
  status: "pending_review" | "assigned" | "survey_scheduled" | "in_progress" | "completed";
  formData: InstallationRequestFormData;
  assignedTeam: {
    leadName: string;
    role: string;
    phone: string;
  };
}

export interface InstallationStepInfo {
  step: string;
  title: string;
  description: string;
  duration: string;
  iconName: string;
}

export interface InstallationFAQItem {
  q: string;
  a: string;
  category: "pricing" | "technical" | "warranty" | "survey";
}

export interface TrackingStep {
  title: string;
  description: string;
  date?: string;
  status: "completed" | "current" | "upcoming";
}

export interface TrackingRecord {
  trackingCode: string;
  clientName: string;
  companyName: string;
  serviceTitle: string;
  registeredDate: string;
  estimatedCompletion: string;
  technicianName: string;
  technicianPhone?: string;
  statusPercent: number;
  currentStepIndex: number;
  steps: TrackingStep[];
}
