import test from "node:test";
import assert from "node:assert";
import {
  isValidIranianMobile,
  normalizePhoneNumber,
  maskPhone,
} from "../api/mock-users.ts";

test("phone validation: recognizes valid Iranian 11-digit mobile starting with 09", () => {
  assert.strictEqual(isValidIranianMobile("09123456789"), true);
  assert.strictEqual(isValidIranianMobile("09901234567"), true);
  assert.strictEqual(isValidIranianMobile("09351112233"), true);

  // Invalid formats
  assert.strictEqual(isValidIranianMobile("02188888888"), false); // Tehran landline
  assert.strictEqual(isValidIranianMobile("0912345678"), false);  // 10 digits
  assert.strictEqual(isValidIranianMobile("091234567890"), false); // 12 digits
  assert.strictEqual(isValidIranianMobile(""), false);
});

test("phone normalization: handles Persian and Arabic numerals", () => {
  const persianInput = "۰۹۱۲۳۴۵۶۷۸۹";
  const normalized = normalizePhoneNumber(persianInput);
  assert.strictEqual(normalized, "09123456789");
  assert.strictEqual(isValidIranianMobile(normalized), true);
});

test("phone normalization: handles country code +98 and spaces/dashes", () => {
  assert.strictEqual(normalizePhoneNumber("+989123456789"), "09123456789");
  assert.strictEqual(normalizePhoneNumber("00989123456789"), "09123456789");
  assert.strictEqual(normalizePhoneNumber("0912-345-6789"), "09123456789");
  assert.strictEqual(normalizePhoneNumber("0912 345 6789"), "09123456789");
});

test("phone masking: masks middle digits correctly", () => {
  const masked = maskPhone("09123456789");
  assert.strictEqual(masked.includes("***"), true);
  assert.strictEqual(masked.startsWith("0912"), true);
  assert.strictEqual(masked.endsWith("6789"), true);
});

test("role-based redirect logic maps roles to designated portals", () => {
  const getRedirectUrl = (role?: string) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "partner":
        return "/partner";
      case "customer":
      default:
        return "/dashboard";
    }
  };

  assert.strictEqual(getRedirectUrl("admin"), "/admin");
  assert.strictEqual(getRedirectUrl("partner"), "/partner");
  assert.strictEqual(getRedirectUrl("customer"), "/dashboard");
  assert.strictEqual(getRedirectUrl(undefined), "/dashboard");
});

test("OTP code validation: accepts strictly 5 digits and preserves leading zeros", () => {
  const isValid5DigitOtp = (code: string) => /^\d{5}$/.test(code.trim());

  assert.strictEqual(isValid5DigitOtp("01234"), true); // Preserves leading zero
  assert.strictEqual(isValid5DigitOtp("54321"), true);
  assert.strictEqual(isValid5DigitOtp("1234"), false);  // 4 digits
  assert.strictEqual(isValid5DigitOtp("123456"), false); // 6 digits
  assert.strictEqual(isValid5DigitOtp("abcde"), false); // Non-numeric
});

test("step progression logic: skips 2FA when user does not have 2FA enabled", () => {
  const getNextStep = (hasTwoFactor: boolean) => {
    return hasTwoFactor ? "2fa" : "success";
  };

  assert.strictEqual(getNextStep(false), "success");
  assert.strictEqual(getNextStep(true), "2fa");
});

