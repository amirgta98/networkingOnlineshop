"use client";

import * as React from "react";
import { UserProfileData } from "../types/profile.types";
import { INITIAL_USER_PROFILE } from "../data/mock-profile";
import { profileApi } from "../api/profile-api";
import { useAuth } from "@/features/auth/context/auth-context";

const PROFILE_KEY = "velox_dashboard_profile_v2";

export function useDashboardProfile() {
  const { updateAuthUser, user } = useAuth();
  const [profile, setProfile] = React.useState<UserProfileData>(INITIAL_USER_PROFILE);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load profile from API with fallback
  React.useEffect(() => {
    let isMounted = true;

    async function load() {
      const userFallback: UserProfileData = {
        ...INITIAL_USER_PROFILE,
        fullName: user?.name || "",
        mobileNumber: user?.phone || "",
        email: user?.email || "",
        companyName: user?.companyName || "",
        nationalCode: (user as any)?.nationalId || "",
        economicCode: (user as any)?.economicCode || "",
      };

      try {
        const remote = await profileApi.getProfile();
        if (isMounted && remote) {
          setProfile(remote);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(remote));
          if (remote.avatarUrl) {
            updateAuthUser({ avatarUrl: remote.avatarUrl });
          }
          return;
        }
      } catch (err) {
        console.warn("[Profile Hook] Backend profile fetch fallback:", err);
      }

      // Local storage fallback
      if (isMounted) {
        try {
          const stored = localStorage.getItem(PROFILE_KEY);
          if (stored) {
            setProfile(JSON.parse(stored));
          } else {
            setProfile(userFallback);
            localStorage.setItem(PROFILE_KEY, JSON.stringify(userFallback));
          }
        } catch {
          setProfile(userFallback);
        }
      }
    }

    load().finally(() => {
      if (isMounted) setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [updateAuthUser, user]);

  const saveProfile = async (updated: UserProfileData) => {
    setIsSaving(true);
    setError(null);
    try {
      const saved = await profileApi.updateProfile({
        fullName: updated.fullName?.trim() || undefined,
        firstName: updated.firstName?.trim() || undefined,
        lastName: updated.lastName?.trim() || undefined,
        nationalCode: updated.nationalCode?.trim() || undefined,
        phone: updated.mobileNumber?.trim() || undefined,
        email: updated.email?.trim() || undefined,
        bio: updated.bio?.trim() ?? undefined,
        companyName: updated.companyName?.trim() || undefined,
        economicCode: updated.economicCode?.trim() || undefined,
        companyNationalId: updated.companyNationalId?.trim() || undefined,
        registrationNumber: updated.registrationNumber?.trim() || undefined,
        companyPhone: updated.companyPhone?.trim() || undefined,
        companyAddress: updated.companyAddress?.trim() || undefined,
        shebaNumber: updated.shebaNumber?.trim() || undefined,
        cardNumber: updated.cardNumber?.trim() || undefined,
        bankName: updated.bankName?.trim() || undefined,
        accountHolderName: updated.accountHolderName?.trim() || undefined,
        preferences: updated.preferences,
      });

      setProfile(saved);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));

      updateAuthUser({
        name: saved.fullName || user?.name,
        phone: saved.mobileNumber || user?.phone,
        email: saved.email || user?.email,
        companyName: saved.companyName ?? undefined,
        avatarUrl: saved.avatarUrl ?? undefined,
      });

      return saved;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ذخیره‌سازی مشخصات پروفایل";
      setError(msg);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfileData>) => {
    const merged = { ...profile, ...data };
    return await saveProfile(merged);
  };

  const uploadAvatar = async (file: File) => {
    setIsAvatarUploading(true);
    setError(null);
    try {
      const res = await profileApi.uploadAvatar(file);
      setProfile((prev) => {
        const next = { ...prev, avatarUrl: res.avatarUrl };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        return next;
      });

      updateAuthUser({ avatarUrl: res.avatarUrl });
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در بارگذاری تصویر پروفایل";
      setError(msg);
      throw err;
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const deleteAvatar = async () => {
    setIsAvatarUploading(true);
    setError(null);
    try {
      await profileApi.deleteAvatar();
      setProfile((prev) => {
        const next = { ...prev, avatarUrl: null };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        return next;
      });

      updateAuthUser({ avatarUrl: undefined });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در حذف تصویر پروفایل";
      setError(msg);
      throw err;
    } finally {
      setIsAvatarUploading(false);
    }
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
    isSaving,
    isAvatarUploading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    togglePreference,
  };
}
