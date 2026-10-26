import { UserProfileData } from "../types/profile.types";

export const INITIAL_USER_PROFILE: UserProfileData = {
  fullName: "",
  nationalCode: "",
  mobileNumber: "",
  email: "",
  companyName: "",
  economicCode: "",
  companyNationalId: "",
  registrationNumber: "",
  companyPhone: "",
  companyAddress: "",
  shebaNumber: "",
  cardNumber: "",
  bankName: "",
  accountHolderName: "",
  isShebaVerified: false,
  preferences: {
    smsOnOrderUpdates: true,
    smsOnInvoiceReady: true,
    newsletterSubscribed: false,
    twoFactorLoginNotify: true,
  },
};
