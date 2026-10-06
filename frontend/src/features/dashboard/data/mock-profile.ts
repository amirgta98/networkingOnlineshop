import { UserProfileData } from "../types/profile.types";

export const INITIAL_USER_PROFILE: UserProfileData = {
  fullName: "عرفان رضایی",
  nationalCode: "۰۰۱۹۸۴۷۵۶۱",
  mobileNumber: "09121234567",
  email: "erfan.rezaei@velox-net.ir",
  companyName: "شرکت ارتباطات داده و شبکه ولوکس (سهامی خاص)",
  economicCode: "411589763214",
  companyNationalId: "14009876543",
  registrationNumber: "456789",
  companyPhone: "۰۲۱-۸۸۲۰۰۱۹۰",
  companyAddress: "تهران، خیابان ولیعصر، نرسیده به توانیر، برج افق، طبقه ۵، واحد ۵۰۲",
  shebaNumber: "IR120170000000109283746501",
  bankName: "بانک سامان",
  accountHolderName: "عرفان رضایی",
  isShebaVerified: true,
  preferences: {
    smsOnOrderUpdates: true,
    smsOnInvoiceReady: true,
    newsletterSubscribed: false,
    twoFactorLoginNotify: true,
  },
};
