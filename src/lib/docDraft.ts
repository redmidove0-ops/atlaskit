// src/lib/docDraft.ts
export type Template = 'classic' | 'modern';

export type SellerInfo = {
  name: string;
  phone: string;
  address: string;
  email: string;
  rc?: string;
  nif?: string;
};

export type ClientInfo = {
  name: string;
  phone: string;
  address: string;
  email?: string;
};

export type LineItem = {
  lineId: string;              // ✅ مفتاح ثابت للـ React + edits
  productRefId?: string;       // uuid من products (اختياري)
  label: string;               // اسم الخدمة/المنتج
  description?: string;        // وصف (اختياري)
  qty: number;                 // كمية
  unit: string;                // pcs / hour ...
  unitPrice: number;           // سعر الوحدة
  tvaRate: number;             // 0..100
};

export type DevisDraft = {
  kind: 'devis';
  number: string;              // DV-0001
  dateISO: string;             // 2026-02-11
  seller: SellerInfo;
  client: ClientInfo;
  items: LineItem[];
  notes?: string;
  discountRate?: number;       // % optional
};

export type DocDraft = DevisDraft;

export type DevisTotals = {
  subtotal: number;
  tvaTotal: number;
  discountAmount: number;
  total: number;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function genLineId(): string {
  // آمن كـ key (ليس للأمان)
  const g = globalThis as unknown as {crypto?: {randomUUID?: () => string}};
  const uuid = g.crypto?.randomUUID?.();
  if (uuid) return `li_${uuid}`;
  return `li_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeDevisDraft(d: DevisDraft): DevisDraft {
  const items = (d.items ?? []).map((it) => ({
    ...it,
    lineId: it.lineId?.trim() ? it.lineId : genLineId(),
    qty: Number.isFinite(it.qty) ? it.qty : 1,
    unitPrice: Number.isFinite(it.unitPrice) ? it.unitPrice : 0,
    tvaRate: Number.isFinite(it.tvaRate) ? it.tvaRate : 0
  }));
  return {...d, items};
}

export function createEmptyDevisDraft(): DevisDraft {
  return normalizeDevisDraft({
    kind: 'devis',
    number: 'DV-0001',
    dateISO: todayISO(),
    seller: {
      name: '',
      phone: '',
      address: '',
      email: '',
      rc: '',
      nif: ''
    },
    client: {
      name: '',
      phone: '',
      address: '',
      email: ''
    },
    items: [
      {
        lineId: genLineId(),
        label: '',
        description: '',
        qty: 1,
        unit: 'pcs',
        unitPrice: 0,
        tvaRate: 0
      }
    ],
    notes: '',
    discountRate: 0
  });
}

// ✅ لتفادي أخطاء قديمة (إن كان بعض الصفحات تستوردها)
export const createDefaultDraft = createEmptyDevisDraft;

export function calcDevisTotals(draft: DevisDraft): DevisTotals {
  const d = normalizeDevisDraft(draft);

  let subtotal = 0;
  let tvaTotal = 0;

  for (const it of d.items) {
    const qty = safeNum(it.qty, 1);
    const unitPrice = safeNum(it.unitPrice, 0);
    const tvaRate = clamp(safeNum(it.tvaRate, 0), 0, 100);

    const base = qty * unitPrice;
    const tva = (base * tvaRate) / 100;

    subtotal += base;
    tvaTotal += tva;
  }

  const discountRate = clamp(safeNum(d.discountRate ?? 0, 0), 0, 100);
  const discountAmount = (subtotal * discountRate) / 100;

  const total = Math.max(0, subtotal + tvaTotal - discountAmount);

  return {
    subtotal: round2(subtotal),
    tvaTotal: round2(tvaTotal),
    discountAmount: round2(discountAmount),
    total: round2(total)
  };
}

function safeNum(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
