export interface UserProfileData {
  id?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  nationalCode: string;
  mobileNumber: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  companyName?: string;
  economicCode?: string;
  companyNationalId?: string;
  registrationNumber?: string;
  companyPhone?: string;
  companyAddress?: string;
  shebaNumber: string;
  bankName: string;
  accountHolderName: string;
  isShebaVerified: boolean;
  preferences: {
    smsOnOrderUpdates: boolean;
    smsOnInvoiceReady: boolean;
    newsletterSubscribed: boolean;
    twoFactorLoginNotify: boolean;
  };
}
