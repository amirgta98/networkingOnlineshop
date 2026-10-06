import { WalletBalanceInfo, WalletTransaction, BankAccountInfo } from "../types/wallet.types";

export const INITIAL_WALLET_BALANCE: WalletBalanceInfo = {
  cashBalance: 4850000,
  giftOrCashbackBalance: 650000,
  b2bCreditLimit: 500000000,
  b2bCreditUsed: 180000000,
  totalUsable: 5500000,
};

export const INITIAL_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    shebaNumber: "IR120170000000109283746501",
    accountHolderName: "عرفان رضایی (به نام حساب شرکت)",
    bankName: "بانک سامان",
    isVerified: true,
  },
  {
    shebaNumber: "IR560120000000029384756102",
    accountHolderName: "عرفان رضایی",
    bankName: "بانک ملت",
    isVerified: true,
  },
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-501",
    trackingCode: "SHP-9920184",
    amount: 5000000,
    type: "deposit",
    typeLabel: "شارژ آنلاین کیف پول",
    title: "شارژ آنی از طریق درگاه پرداخت اینترنتی سامان",
    createdAt: "۱۴۰۳/۰۸/۲۲ - ۱۰:۱۴",
    status: "successful",
    statusLabel: "موفق",
    gatewayName: "سامان کیش",
  },
  {
    id: "tx-502",
    trackingCode: "ORD-91402-WLT",
    amount: -48575000,
    type: "order_payment",
    typeLabel: "پرداخت فاکتور سفارش",
    title: "تسویه سفارش تجهیزات سوئیچ و ماژول سیسکو VLX-91402",
    createdAt: "۱۴۰۳/۰۸/۲۲ - ۱۴:۳۵",
    status: "successful",
    statusLabel: "موفق",
    referenceId: "ord-101",
  },
  {
    id: "tx-503",
    trackingCode: "CB-204918",
    amount: 350000,
    type: "cashback",
    typeLabel: "پاداش وفاداری (کش‌بک)",
    title: "هدیه نقدی ۱٪ خرید تجهیزات زیرساخت شبکه",
    createdAt: "۱۴۰۳/۰۸/۲۳ - ۰۸:۰۰",
    status: "successful",
    statusLabel: "موفق",
    referenceId: "ord-101",
  },
  {
    id: "tx-504",
    trackingCode: "SHP-7720914",
    amount: 10000000,
    type: "deposit",
    typeLabel: "شارژ آنلاین کیف پول",
    title: "شارژ حساب کاربری از طریق درگاه ملت",
    createdAt: "۱۴۰۳/۰۸/۰۱ - ۱۶:۳۰",
    status: "successful",
    statusLabel: "موفق",
    gatewayName: "به‌پرداخت ملت",
  },
  {
    id: "tx-505",
    trackingCode: "WDR-109283",
    amount: -3000000,
    type: "withdrawal",
    typeLabel: "تسویه به حساب بانکی",
    title: "انتقال وجه به شماره شبا بانک سامان (IR120170...)",
    createdAt: "۱۴۰۳/۰۷/۲۵ - ۱۱:۲۰",
    status: "successful",
    statusLabel: "موفق",
  },
];
