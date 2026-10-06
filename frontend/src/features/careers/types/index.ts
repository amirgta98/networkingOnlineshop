export interface JobPosition {
  id: string;
  title: string;
  department: string;
  type: string; // e.g. "تمام وقت", "پاره وقت", "حضوری / هیبریدی"
  experience: string; // e.g. "+۲ سال سابقه کار"
  location: string;
  badge?: string;
  skills: string[];
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
}
