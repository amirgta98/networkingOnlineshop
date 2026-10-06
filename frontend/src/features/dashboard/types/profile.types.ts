export interface UserProfileData {
  fullName: string;
  nationalCode: string;
  mobileNumber: string;
  email: string;
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
