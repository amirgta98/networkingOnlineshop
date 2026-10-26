import { ClubState } from "../types/club.types";

export const INITIAL_CLUB_STATE: ClubState = {
  currentPoints: 0,
  totalLifetimePoints: 0,
  tier: "bronze",
  tierTitle: "رده برنزی (سطح پایه)",
  nextTierPoints: 100,
  tierPerks: [
    "امکان جمع‌آوری امتیاز در خریدهای آنلاین",
    "دسترسی به تخفیف‌های دوره‌ای",
  ],
  vouchers: [],
  challenges: [],
  history: [],
};
