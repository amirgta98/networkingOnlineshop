export type JobPositionType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "HYBRID"
  | "REMOTE";

export type JobApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "ACCEPTED"
  | "REJECTED";

export interface JobPosition {
  id: string;
  title: string;
  slug?: string;
  department: string;
  type: JobPositionType | string;
  experience?: string | null;
  location?: string | null;
  badge?: string | null;
  skills: string[];
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    applications: number;
  };
}

export interface CareerPerk {
  id: string;
  title: string;
  description: string;
  iconName: "award" | "trending-up" | "shield" | "coffee" | "cpu" | "users";
}

export interface ResumeFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  positionId: string;
  about: string;
  file: File | null;
}

export interface SubmissionResult {
  trackingCode: string;
  submittedAt: string;
  fullName: string;
  positionTitle: string;
  phoneNumber?: string;
}

export interface JobApplication {
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
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationStats {
  totalPositions: number;
  activePositions: number;
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}
