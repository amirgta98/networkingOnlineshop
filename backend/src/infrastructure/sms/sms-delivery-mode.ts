import { MelipayamakBaseServiceProvider } from './melipayamak-base-service.provider.js';
import { MelipayamakConsoleOtpProvider } from './melipayamak-console-otp.provider.js';
import type { ISmsProvider } from './sms-provider.interface.js';

/**
 * How OTP codes leave the system:
 * - `real`     → the configured Melipayamak API (production behaviour)
 * - `telegram` → local/dev simulation, the code is forwarded to the Telegram bot
 * - `test`     → automated tests, no outbound network request at all
 */
export type SmsDeliveryMode = 'real' | 'telegram' | 'test';

export interface SmsModeResolutionInput {
  /**
   * Whether at least one real SMS provider (Melipayamak console or BaseService)
   * has usable credentials available.
   */
  realProviderConfigured: boolean;
  env?: NodeJS.ProcessEnv;
}

export interface SmsModeResolution {
  mode: SmsDeliveryMode;
  /** Human readable reason, used for startup logs and diagnostics endpoints. */
  reason: string;
}

/** Accepted `SMS_DELIVERY_MODE` values that mean "simulate locally". */
const TELEGRAM_MODE_ALIASES = new Set([
  'telegram',
  'dev',
  'development',
  'local',
  'mock',
  'simulate',
  'simulated',
]);

/** Accepted `SMS_DELIVERY_MODE` values that mean "use the real SMS API". */
const REAL_MODE_ALIASES = new Set(['real', 'sms', 'melipayamak', 'production', 'prod']);

function readEnv(env: NodeJS.ProcessEnv, key: string): string {
  return (env[key] ?? '').trim();
}

/**
 * Resolves the single source of truth for OTP delivery routing.
 *
 * Resolution order:
 * 1. Automated tests (`NODE_ENV=test` or `MOCK_SMS=true`) → `test`
 * 2. Explicit `SMS_DELIVERY_MODE` → obeyed exactly (highest operator priority)
 * 3. `FORCE_REAL_SMS=true` → `real`
 * 4. `NODE_ENV=production` → `real` (production NEVER falls back to Telegram)
 * 5. `FORCE_REAL_SMS=false` → `telegram` (explicit local development opt-in)
 * 6. Real SMS credentials configured → `real`
 * 7. Nothing configured at all → `telegram` (local development convenience)
 *
 * Rule 6 is the important guarantee: as soon as the Melipayamak API is
 * configured, the server sends real SMS even when `NODE_ENV` is missing or not
 * set to `production`. The Telegram bot is only ever used when the operator
 * explicitly asks for it (rules 2 or 5) or when nothing is configured at all.
 */
export function resolveSmsDeliveryMode(input: SmsModeResolutionInput): SmsModeResolution {
  const env = input.env ?? process.env;

  // 1. Automated tests must never hit the network.
  if (readEnv(env, 'NODE_ENV').toLowerCase() === 'test' || readEnv(env, 'MOCK_SMS').toLowerCase() === 'true') {
    return { mode: 'test', reason: 'NODE_ENV=test or MOCK_SMS=true' };
  }

  // 2. Explicit operator choice wins over every implicit heuristic.
  const explicitMode = readEnv(env, 'SMS_DELIVERY_MODE').toLowerCase();
  if (REAL_MODE_ALIASES.has(explicitMode)) {
    return { mode: 'real', reason: `SMS_DELIVERY_MODE=${explicitMode}` };
  }
  if (explicitMode === 'test') {
    return { mode: 'test', reason: 'SMS_DELIVERY_MODE=test' };
  }
  if (TELEGRAM_MODE_ALIASES.has(explicitMode)) {
    return { mode: 'telegram', reason: `SMS_DELIVERY_MODE=${explicitMode} (explicit local/dev mode)` };
  }

  // 3. Legacy explicit force flag.
  const forceRealSms = readEnv(env, 'FORCE_REAL_SMS').toLowerCase();
  if (forceRealSms === 'true') {
    return { mode: 'real', reason: 'FORCE_REAL_SMS=true' };
  }

  // 4. Production deployments always deliver real SMS.
  if (readEnv(env, 'NODE_ENV').toLowerCase() === 'production') {
    return { mode: 'real', reason: 'NODE_ENV=production' };
  }

  // 5. Explicit local development opt-in.
  if (forceRealSms === 'false') {
    return { mode: 'telegram', reason: 'FORCE_REAL_SMS=false (explicit local/dev mode)' };
  }

  // 6. Real credentials are configured → real SMS, regardless of NODE_ENV.
  if (input.realProviderConfigured) {
    return {
      mode: 'real',
      reason: 'Melipayamak credentials are configured (real SMS by default)',
    };
  }

  // 7. Fresh local checkout without credentials → simulated delivery.
  return { mode: 'telegram', reason: 'no real SMS provider configured (local/dev simulation)' };
}

/**
 * Resolves the effective mode for an arbitrary provider instance.
 * `CompositeSmsProvider` reports its own resolved mode; other implementations
 * fall back to the environment rules (strictly, so secrets are never returned
 * in API responses by accident).
 */
export function getSmsDeliveryMode(provider: ISmsProvider): SmsDeliveryMode {
  const candidate = provider as { getDeliveryMode?: () => SmsDeliveryMode };
  if (typeof candidate.getDeliveryMode === 'function') {
    return candidate.getDeliveryMode();
  }
  return resolveSmsDeliveryMode({ realProviderConfigured: true }).mode;
}

export interface SmsDiagnostics {
  mode: SmsDeliveryMode;
  reason: string;
  nodeEnv: string | null;
  forceRealSms: string | null;
  smsDeliveryMode: string | null;
  mockSms: string | null;
  consoleProviderConfigured: boolean;
  baseServiceProviderConfigured: boolean;
  consoleCredentialsFromBuiltInFallback: boolean;
  activeRealProvider: 'console' | 'baseService' | 'none';
}

/**
 * Builds a safe, secret-free report about the current SMS routing state.
 * Used by the `/api/v1/system/sms-status` diagnostics endpoint.
 */
export function buildSmsDiagnostics(env: NodeJS.ProcessEnv = process.env): SmsDiagnostics {
  const consoleProvider = new MelipayamakConsoleOtpProvider();
  const baseServiceProvider = new MelipayamakBaseServiceProvider();

  const consoleProviderConfigured = consoleProvider.isConfigured();
  const baseServiceProviderConfigured = baseServiceProvider.isConfigured();

  const { mode, reason } = resolveSmsDeliveryMode({
    realProviderConfigured: consoleProviderConfigured || baseServiceProviderConfigured,
    env,
  });

  return {
    mode,
    reason,
    nodeEnv: readEnv(env, 'NODE_ENV') || null,
    forceRealSms: readEnv(env, 'FORCE_REAL_SMS') || null,
    smsDeliveryMode: readEnv(env, 'SMS_DELIVERY_MODE') || null,
    mockSms: readEnv(env, 'MOCK_SMS') || null,
    consoleProviderConfigured,
    baseServiceProviderConfigured,
    consoleCredentialsFromBuiltInFallback: consoleProvider.isUsingBuiltInCredentials,
    activeRealProvider: consoleProviderConfigured
      ? 'console'
      : baseServiceProviderConfigured
        ? 'baseService'
        : 'none',
  };
}
