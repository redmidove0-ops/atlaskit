// src/lib/uuid.ts
// Centralized UUID validation utilities

export type Uuid = string & { readonly __brand: 'uuid' };

/** Strict UUID v1-5 regex (RFC 4122) */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Quick boolean check for UUID validity
 */
export function isValidUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v.trim());
}

/**
 * Parse and return typed UUID or null
 */
export function parseUuid(v: unknown): Uuid | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return UUID_RE.test(s) ? (s as Uuid) : null;
}

/**
 * Assert UUID validity or throw
 */
export function assertUuid(v: unknown, message = 'Invalid UUID'): Uuid {
  const u = parseUuid(v);
  if (!u) throw new Error(message);
  return u;
}
