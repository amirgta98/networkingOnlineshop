export type WarrantyStatus = "active" | "expiring_soon" | "expired";

export type RmaStage =
  | "received"
  | "lab_testing"
  | "replacement_approved"
  | "dispatched";

export interface SerialVerificationResult {
  serialNumber: string;
  productName: string;
  model: string;
  brand: string;
  warrantyType: string;
  status: WarrantyStatus;
  statusLabel: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isAuthentic: boolean;
  hologramCode: string;
}

export interface RmaRequest {
  id: string;
  rmaNumber: string;
  serialNumber: string;
  productName: string;
  faultDescription: string;
  deliveryMethod: "courier" | "tipax" | "in_person";
  createdAt: string;
  currentStage: RmaStage;
  currentStageLabel: string;
  replacementSerial?: string;
  labNotes?: string;
  timeline: {
    stage: RmaStage;
    title: string;
    description: string;
    timestamp?: string;
    isCompleted: boolean;
    isCurrent?: boolean;
  }[];
}
