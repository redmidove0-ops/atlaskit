export type Uuid = string & {readonly __brand: 'uuid'};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseUuid(v: unknown): Uuid | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return UUID_RE.test(s) ? (s as Uuid) : null;
}

export function assertUuid(v: unknown, message = 'Invalid UUID'): Uuid {
  const u = parseUuid(v);
  if (!u) throw new Error(message);
  return u;
}
