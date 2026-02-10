// src/lib/docDraft.ts
// ✅ AtlasKit Doc Draft (Devis) — قوي + متوافق + بدون مفاجآت

/* -------------------------------- Types -------------------------------- */

export type SellerInfo = {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  rc?: string;  // Registre de commerce
  nif?: string; // Numéro d'identification fiscale
};

export type ClientInfo = {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
};

export type LineItem = {
  // ✅ لازم يكون موجود دائمًا لتفادي مشاكل keys + ترتيب الأسطر
  lineId: string;

  // optional reference to catalog product (Supabase products.id)
  productRefId?: string;

  label: string;
  description?: string;

  qty: number;
  unit?: string;

  unitPrice: number;
  tvaRate: number; // 0..100

  meta?: Record<string, unknown>;
};

export type DevisDraft = {
  kind: 'devis';

  number: string;   // DV-000123
  dateISO: string;  // YYYY-MM-DD

  seller: SellerInfo;
  client: ClientInfo;

  items: LineItem[];

  discountAmount?: number; // قيمة خصم ثابتة (دج)
  notes?: string;
};

// حالياً مشروعك يعتمد Devis فقط، لكن نترك الاسم العام جاهز للتوسع
export type DocDraft = DevisDraft;

export type DevisTotals = {
  subtotal: number;       // مجموع بدون TVA
  tvaTotal: number;       // مجموع TVA
  discountAmount: number; // الخصم الفعلي (بعد clamp)
  total: number;          // النهائي
};

export type LineTotals = {
  base: number;
  tva: number;
  total: number;
};

/* ------------------------------ Small Utils ----------------------------- */

function isObj(v: unknown): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function safeStr(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * ✅ UUID ثابت بدون اعتماد على window
 * يعمل على Server/Client
 */
export function genLineId(): string {
  const c: any = (globalThis as any).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();

  // fallback RFC4122-ish (good enough for UI keys)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* --------------------------- Draft Constructors -------------------------- */

export function createEmptyDevisDraft(): DevisDraft {
  return {
    kind: 'devis',
    number: 'DV-000001',
    dateISO: todayISO(),
    seller: {name: ''},
    client: {name: ''},
    items: [],
    discountAmount: 0,
    notes: ''
  };
}

/**
 * ✅ Alias للتوافق مع ملفاتك القديمة:
 * كان عندك imports باسم createDefaultDraft
 */
export function createDefaultDraft(): DevisDraft {
  return createEmptyDevisDraft();
}

/**
 * ✅ alias ثاني للتوافق لو ظهر عندك (بعض الملفات القديمة)
 */
export function createDefaultDevisDraft(): DevisDraft {
  return createEmptyDevisDraft();
}

/* --------------------------- Normalization/Migration --------------------------- */

/**
 * يحوّل أي Draft قديم/ناقص إلى DevisDraft رسمي:
 * - يدعم items أو lines
 * - يدعم qty/quantity
 * - يدعم unitPrice/price
 * - يدعم tvaRate/tva/vat
 * - يضمن وجود lineId دائمًا
 */
export function normalizeDevisDraft(input: unknown): DevisDraft {
  const d = isObj(input) ? input : {};

  const sellerRaw = isObj(d.seller) ? d.seller : {};
  const clientRaw = isObj(d.client) ? d.client : {};

  const seller: SellerInfo = {
    name: safeStr(sellerRaw.name, ''),
    phone: safeStr(sellerRaw.phone, ''),
    address: safeStr(sellerRaw.address, ''),
    email: safeStr(sellerRaw.email, ''),
    rc: safeStr(sellerRaw.rc, ''),
    nif: safeStr(sellerRaw.nif, '')
  };

  const client: ClientInfo = {
    name: safeStr(clientRaw.name, ''),
    phone: safeStr(clientRaw.phone, ''),
    address: safeStr(clientRaw.address, ''),
    email: safeStr(clientRaw.email, '')
  };

  const rawItems: any[] = Array.isArray((d as any).items)
    ? (d as any).items
    : Array.isArray((d as any).lines)
      ? (d as any).lines
      : [];

  const items: LineItem[] = rawItems.map((it: any) => {
    const obj = isObj(it) ? it : {};

    const qty = clamp(safeNum(obj.qty ?? obj.quantity ?? 1, 1), 0, 1_000_000);
    const unitPrice = clamp(
      safeNum(obj.unitPrice ?? obj.price ?? 0, 0),
      0,
      1_000_000_000
    );
    const tvaRate = clamp(
      safeNum(obj.tvaRate ?? obj.tva ?? obj.vat ?? 0, 0),
      0,
      100
    );

    const label =
      safeStr(obj.label, '') ||
      safeStr(obj.name, '') ||
      '—';

    const lineId = safeStr(obj.lineId, '') || genLineId();

    const productRefId =
      safeStr(obj.productRefId, '') ||
      safeStr(obj.product_id, '') ||
      safeStr(obj.productId, '');

    return {
      lineId,
      productRefId: productRefId || undefined,
      label,
      description: safeStr(obj.description, ''),
      qty,
      unit: safeStr(obj.unit, '') || undefined,
      unitPrice,
      tvaRate,
      meta: isObj(obj.meta) ? obj.meta : undefined
    };
  });

  return {
    kind: 'devis',
    number: safeStr((d as any).number, 'DV-000001'),
    dateISO: safeStr((d as any).dateISO, todayISO()),
    seller,
    client,
    items,
    discountAmount: clamp(safeNum((d as any).discountAmount ?? 0, 0), 0, 1_000_000_000),
    notes: safeStr((d as any).notes, '')
  };
}

/**
 * لو تحب: تضمن lineId حتى لو items جاء من API/DB ناقص
 */
export function ensureLineIds(items: LineItem[]): LineItem[] {
  return (Array.isArray(items) ? items : []).map((it) => ({
    ...it,
    lineId: it?.lineId ? it.lineId : genLineId()
  }));
}

/* ------------------------------ Calculations ----------------------------- */

export function calcLineTotals(item: LineItem): LineTotals {
  const qty = clamp(safeNum(item.qty, 0), 0, 1_000_000);
  const unitPrice = clamp(safeNum(item.unitPrice, 0), 0, 1_000_000_000);
  const tvaRate = clamp(safeNum(item.tvaRate, 0), 0, 100);

  const base = qty * unitPrice;
  const tva = (base * tvaRate) / 100;
  const total = base + tva;

  return {base, tva, total};
}

export function calcDevisTotals(draft: DevisDraft): DevisTotals {
  const items = Array.isArray(draft.items) ? draft.items : [];

  let subtotal = 0;
  let tvaTotal = 0;

  for (const it of items) {
    const {base, tva} = calcLineTotals(it);
    subtotal += base;
    tvaTotal += tva;
  }

  const rawDiscount = safeNum(draft.discountAmount ?? 0, 0);
  // الخصم لا يتجاوز المجموع (subtotal + tvaTotal)
  const discountAmount = clamp(rawDiscount, 0, subtotal + tvaTotal);

  const total = subtotal + tvaTotal - discountAmount;

  return {subtotal, tvaTotal, discountAmount, total};
}

/**
 * ✅ Alias للتوافق: بعض ملفاتك كانت تستورد calcTotal
 * في مشروعك: total النهائي للوثيقة
 */
export function calcTotal(draft: DevisDraft): number {
  return calcDevisTotals(draft).total;
}

/**
 * ✅ Alias للتوافق: كان يظهر عندك calcTotal vs calcDevisTotals
 */
export function calcTotals(draft: DevisDraft): DevisTotals {
  return calcDevisTotals(draft);
}

/* ------------------------------- Type Guards ------------------------------ */

export function isDevisDraft(d: unknown): d is DevisDraft {
  return isObj(d) && (d as any).kind === 'devis';
}
