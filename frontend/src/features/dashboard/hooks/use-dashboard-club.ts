"use client";

import * as React from "react";
import { ClubState, ClubVoucher } from "../types/club.types";
import { INITIAL_CLUB_STATE } from "../data/mock-club";

const CLUB_KEY = "velox_dashboard_club_v1";

export function useDashboardClub() {
  const [clubState, setClubState] = React.useState<ClubState>(INITIAL_CLUB_STATE);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(CLUB_KEY);
      if (stored) setClubState(JSON.parse(stored));
      else {
        setClubState(INITIAL_CLUB_STATE);
        localStorage.setItem(CLUB_KEY, JSON.stringify(INITIAL_CLUB_STATE));
      }
    } catch {
      setClubState(INITIAL_CLUB_STATE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveState = (updated: ClubState) => {
    setClubState(updated);
    try {
      localStorage.setItem(CLUB_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save club state", e);
    }
  };

  const redeemVoucher = (voucher: ClubVoucher) => {
    if (clubState.currentPoints < voucher.pointsCost) {
      throw new Error("امتیاز شما برای دریافت این بن تخفیف کافی نیست.");
    }

    const updated: ClubState = {
      ...clubState,
      currentPoints: clubState.currentPoints - voucher.pointsCost,
      history: [
        {
          id: `ph-${Date.now()}`,
          title: `تبدیل امتیاز به ${voucher.title} (کد: ${voucher.code})`,
          points: -voucher.pointsCost,
          createdAt: "هم‌اکنون",
          type: "spent",
        },
        ...clubState.history,
      ],
    };

    saveState(updated);
    return voucher.code;
  };

  return {
    clubState,
    isLoaded,
    redeemVoucher,
  };
}
