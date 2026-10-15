/**
 * Tiny environment helpers shared by the SMS providers.
 *
 * `docker compose` injects an empty string when an interpolated variable
 * neither exists in `.env` nor has a default (e.g. `MELIPAYAMAK_USERNAME: ${MELIPAYAMAK_USERNAME}`).
 * Treating those empty values as "unset" prevents the providers from looking
 * unconfigured on a server where the variable is simply absent.
 */
export function firstNonEmpty(...values: Array<string | undefined | null>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export function firstNonEmptyNumber(...values: Array<string | number | undefined | null>): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number.parseInt(value.trim(), 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}
