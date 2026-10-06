"use client";

import * as React from "react";
import { UserProfileData } from "../types/profile.types";
import { INITIAL_USER_PROFILE } from "../data/mock-profile";

const PROFILE_KEY = "velox_dashboard_profile_v1";

export function useDashboardProfile() {
  const [profile, setProfile] = React.useState<UserProfileData>(INITIAL_USER_PROFILE);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) setProfile(JSON.parse(stored));
      else {
        setProfile(INITIAL_USER_PROFILE);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
      }
    } catch {
      setProfile(INITIAL_USER_PROFILE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (updated: UserProfileData) => {
    setProfile(updated);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  const updateProfile = (data: Partial<UserProfileData>) => {
    const updated = { ...profile, ...data };
    saveProfile(updated);
  };

  const togglePreference = (key: keyof UserProfileData["preferences"]) => {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key],
      },
    };
    saveProfile(updated);
  };

  return {
    profile,
    isLoaded,
    updateProfile,
    togglePreference,
  };
}
