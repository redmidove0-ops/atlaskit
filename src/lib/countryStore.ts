// src/lib/countryStore.ts
// ────────────────────────────────────────────────────────────────
// Simple country configuration store
// Persists to localStorage so users don't have to re-select
// ────────────────────────────────────────────────────────────────

import { type CountryCode, COUNTRY_CONFIGS, type CountryConfig } from './docTypes';

const STORAGE_KEY = 'atlaskit_country';

/** Get the stored country code, defaulting to DZ */
export function getCountryCode(): CountryCode {
  if (typeof window === 'undefined') return 'DZ';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'SA' || stored === 'DZ') return stored;
  return 'DZ';
}

/** Set the country code */
export function setCountryCode(code: CountryCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, code);
}

/** Get full country config */
export function getCountryConfig(): CountryConfig {
  return COUNTRY_CONFIGS[getCountryCode()];
}
