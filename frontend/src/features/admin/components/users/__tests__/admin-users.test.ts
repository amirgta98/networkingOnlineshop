import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { loadComponent } = req(
  "../../shared/__tests__/test-env.ts"
) as typeof import("../../shared/__tests__/test-env");

const {
  mapBackendUserToAdmin,
  adminUsersApi,
} = loadComponent<{
  mapBackendUserToAdmin: (dto: any) => any;
  adminUsersApi: {
    getUsers: (params?: any) => Promise<any[]>;
    getUserById: (id: string) => Promise<any>;
    updateUserRole: (id: string, role: string) => Promise<any>;
    updateUserStatus: (id: string, status: string) => Promise<any>;
    updateUser: (id: string, payload: any) => Promise<any>;
    createUser: (payload: any) => Promise<any>;
    deleteUser: (id: string) => Promise<any>;
  };
}>("./src/features/admin/api/admin-users-api.ts");



test("mapBackendUserToAdmin properly transforms role codes", () => {
  const adminDto = {
    id: "usr-1",
    fullName: "مدیر تستی",
    phone: "09162947221",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  };
  const mappedAdmin = mapBackendUserToAdmin(adminDto);
  assert.strictEqual(mappedAdmin.role, "admin");
  assert.strictEqual(mappedAdmin.status, "active");

  const partnerDto = {
    id: "usr-3",
    fullName: "همکار حقوقی",
    phone: "09162947222",
    role: "PARTNER_B2B",
    status: "PENDING_VERIFICATION",
  };
  const mappedPartner = mapBackendUserToAdmin(partnerDto);
  assert.strictEqual(mappedPartner.role, "partner_b2b");
  assert.strictEqual(mappedPartner.status, "pending_verification");

  const customerDto = {
    id: "usr-4",
    name: "مشتری عادی",
    phone: "09162947223",
    role: "customer",
    status: "SUSPENDED",
    isActive: false,
  };
  const mappedCustomer = mapBackendUserToAdmin(customerDto);
  assert.strictEqual(mappedCustomer.role, "customer");
  assert.strictEqual(mappedCustomer.status, "suspended");
  assert.strictEqual(mappedCustomer.fullName, "مشتری عادی");
});

test("mapBackendUserToAdmin handles financial and security attributes", () => {
  const dto = {
    id: "usr-5",
    fullName: "مهندس رستمی",
    phone: "09162947222",
    email: "rostami@pars-data.com",
    nationalCode: "۱۰۱۰۳۸۴۹۲۰۱",
    nationalCodeVerified: true,
    twoFactorActive: true,
    ordersCount: 19,
    totalSpent: 420000000,
    walletBalance: 12000000,
    companyName: "ارتباطات داده‌گستر پارس",
    userTier: "gold",
    notes: "یادداشت تست",
    activities: [
      {
        id: "act-1",
        action: "ورود موفق",
        timestamp: "امروز - ۱۰:۰۰",
        ip: "127.0.0.1",
      },
    ],
  };

  const admin = mapBackendUserToAdmin(dto);
  assert.strictEqual(admin.fullName, "مهندس رستمی");
  assert.strictEqual(admin.phone, "09162947222");
  assert.strictEqual(admin.email, "rostami@pars-data.com");
  assert.strictEqual(admin.nationalCode, "۱۰۱۰۳۸۴۹۲۰۱");
  assert.strictEqual(admin.nationalCodeVerified, true);
  assert.strictEqual(admin.twoFactorActive, true);
  assert.strictEqual(admin.ordersCount, 19);
  assert.strictEqual(admin.totalSpent, 420000000);
  assert.strictEqual(admin.walletBalance, 12000000);
  assert.strictEqual(admin.companyName, "ارتباطات داده‌گستر پارس");
  assert.strictEqual(admin.userTier, "gold");
  assert.strictEqual(admin.notes, "یادداشت تست");
  assert.strictEqual(admin.activities.length, 1);
});

test("adminUsersApi exposes all required backend contract methods", () => {
  assert.strictEqual(typeof adminUsersApi.getUsers, "function");
  assert.strictEqual(typeof adminUsersApi.getUserById, "function");
  assert.strictEqual(typeof adminUsersApi.updateUserRole, "function");
  assert.strictEqual(typeof adminUsersApi.updateUserStatus, "function");
  assert.strictEqual(typeof adminUsersApi.updateUser, "function");
  assert.strictEqual(typeof adminUsersApi.createUser, "function");
  assert.strictEqual(typeof adminUsersApi.deleteUser, "function");
});

test("mapBackendUserToAdmin does not inject mock strings when data is missing", () => {
  const minimalDto = {
    id: "usr-clean",
    name: "کاربر خام",
    phone: "09121111111",
  };
  const result = mapBackendUserToAdmin(minimalDto);
  assert.strictEqual(result.nationalCode, "", "Must not inject fake national code");
  assert.strictEqual(result.lastLogin, "ثبت نشده", "Must not inject fake last login time");
  assert.strictEqual(result.fullName, "کاربر خام");
  assert.strictEqual(result.ordersCount, 0);
  assert.strictEqual(result.totalSpent, 0);
  assert.strictEqual(result.walletBalance, 0);
});

test("mapBackendUserToAdmin falls back to unmasked phone number when name is absent, masked, or corrupted", () => {
  const phoneOnlyDto = {
    id: "usr-phone",
    name: "",
    phone: "09162947221",
  };
  const result1 = mapBackendUserToAdmin(phoneOnlyDto);
  assert.strictEqual(result1.fullName, "09162947221", "Must show full unmasked phone number without asterisks");

  const questionMarkDto = {
    id: "usr-q",
    name: "?????????? ??????????",
    phone: "09121111111",
  };
  const result2 = mapBackendUserToAdmin(questionMarkDto);
  assert.strictEqual(result2.fullName, "09121111111", "Must replace question marks with full unmasked phone number");

  const maskedDto = {
    id: "usr-masked",
    name: "کاربر 0916***7221",
    phone: "09162947221",
  };
  const result3 = mapBackendUserToAdmin(maskedDto);
  assert.strictEqual(result3.fullName, "09162947221", "Must remove masked pattern and show full phone number");
});

