export type ClubTierLevel = "bronze" | "silver" | "gold" | "diamond";

export interface ClubVoucher {
  id: string;
  title: string;
  discountAmount: number;
  pointsCost: number;
  minPurchaseAmount: number;
  code: string;
  isUnlocked: boolean;
}

export interface ClubChallenge {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  isCompleted: boolean;
  progressText?: string;
}

export interface ClubPointsHistoryEntry {
  id: string;
  title: string;
  points: number; // positive for earned, negative for spent
  createdAt: string;
  type: "earned" | "spent";
}

export interface ClubState {
  currentPoints: number;
  totalLifetimePoints: number;
  tier: ClubTierLevel;
  tierTitle: string;
  nextTierPoints: number;
  tierPerks: string[];
  vouchers: ClubVoucher[];
  challenges: ClubChallenge[];
  history: ClubPointsHistoryEntry[];
}
