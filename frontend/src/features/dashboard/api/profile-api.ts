import { apiClient } from "@/shared/lib/api-client";
import { UserProfileData } from "../types/profile.types";

export interface UpdateProfilePayload {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  nationalCode?: string;
  email?: string;
  bio?: string;
  companyName?: string;
  economicCode?: string;
  companyNationalId?: string;
  registrationNumber?: string;
  companyPhone?: string;
  companyAddress?: string;
  shebaNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  preferences?: {
    smsOnOrderUpdates?: boolean;
    smsOnInvoiceReady?: boolean;
    newsletterSubscribed?: boolean;
    twoFactorLoginNotify?: boolean;
  };
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  filename: string;
  message: string;
}

export const profileApi = {
  async getProfile(): Promise<UserProfileData> {
    return apiClient.get<UserProfileData>("/users/me/profile");
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfileData> {
    return apiClient.put<UserProfileData>("/users/me/profile", payload);
  },

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<AvatarUploadResponse>("/users/me/avatar", formData);
  },

  async deleteAvatar(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>("/users/me/avatar");
  },
};
