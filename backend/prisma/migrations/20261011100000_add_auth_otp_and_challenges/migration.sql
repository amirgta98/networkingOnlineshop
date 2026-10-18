-- ============================================================================
-- Migration: 20261011100000_add_auth_otp_and_challenges
-- Description: Production-Ready Tables for OTP Authentication Challenges,
--              Two-Factor Authentication Tokens, and Rate-Limiting Indexes.
-- ============================================================================

-- 1. AUTH OTP CHALLENGES (Phone OTP codes, salt/hash, attempt limits & cooldown)
CREATE TABLE IF NOT EXISTS "auth_otp_challenges" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "phone" VARCHAR(20) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL DEFAULT 'LOGIN',
    "attempts" INT NOT NULL DEFAULT 0,
    "max_attempts" INT NOT NULL DEFAULT 5,
    "resend_cooldown_until" TIMESTAMPTZ NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "consumed_at" TIMESTAMPTZ,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_otp_attempts_non_negative" CHECK ("attempts" >= 0),
    CONSTRAINT "chk_otp_max_attempts_positive" CHECK ("max_attempts" > 0)
);

-- 2. AUTH TWO-FACTOR CHALLENGES (Short-lived 2FA tickets for partial authentication)
CREATE TABLE IF NOT EXISTS "auth_two_factor_challenges" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "phone" VARCHAR(20) NOT NULL,
    "attempts" INT NOT NULL DEFAULT 0,
    "max_attempts" INT NOT NULL DEFAULT 5,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "consumed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chk_2fa_attempts_non_negative" CHECK ("attempts" >= 0),
    CONSTRAINT "chk_2fa_max_attempts_positive" CHECK ("max_attempts" > 0)
);

-- 3. INDEXES FOR PERFORMANCE & RATE LIMITING
CREATE INDEX IF NOT EXISTS "idx_otp_phone_valid" ON "auth_otp_challenges" ("phone", "consumed_at", "expires_at");
CREATE INDEX IF NOT EXISTS "idx_otp_ip_rate_limit" ON "auth_otp_challenges" ("ip_address", "created_at");
CREATE INDEX IF NOT EXISTS "idx_2fa_user_valid" ON "auth_two_factor_challenges" ("user_id", "consumed_at", "expires_at");

-- 4. ATTACH AUTOMATIC UPDATED_AT TRIGGERS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auth_otp_challenges_updated_at') THEN
        CREATE TRIGGER trg_auth_otp_challenges_updated_at BEFORE UPDATE ON "auth_otp_challenges" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auth_two_factor_challenges_updated_at') THEN
        CREATE TRIGGER trg_auth_two_factor_challenges_updated_at BEFORE UPDATE ON "auth_two_factor_challenges" FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
    END IF;
END $$;

-- ============================================================================
-- DOWN MIGRATION (For reversibility):
-- DROP TRIGGER IF EXISTS trg_auth_two_factor_challenges_updated_at ON "auth_two_factor_challenges";
-- DROP TRIGGER IF EXISTS trg_auth_otp_challenges_updated_at ON "auth_otp_challenges";
-- DROP TABLE IF EXISTS "auth_two_factor_challenges";
-- DROP TABLE IF EXISTS "auth_otp_challenges";
-- ============================================================================
