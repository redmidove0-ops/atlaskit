export type Money = number; // نخزن بالدينار كـ number (مرحلة MVP)

export type DevisItem = {
  id: string;
  label: string;
  qty: number;
  unitPrice: Money;
  tvaRate: number; // 0 .. 1  (مثلا 0.19)
};

export type DevisDraft = {
  kind: 'devis';
  number: string;        // مثال: DV-2026-0001 (مؤقتًا)
  dateISO: string;       // YYYY-MM-DD
  currency: 'DZD';

  seller: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    rc?: string;
    nif?: string;
  };

  client: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };

  items: DevisItem[];

  discount: {
    type: 'none' | 'percent' | 'amount';
    value: number; // percent 0..100 أو amount بالدينار
  };

  notes?: string;
};

export type DocDraft = DevisDraft;

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function createDefaultDraft(): DevisDraft {
  return {
    kind: 'devis',
    number: 'DV-0001',
    dateISO: todayISO(),
    currency: 'DZD',
    seller: {name: ''},
    client: {name: ''},
    items: [
      {id: cryptoId(), label: '', qty: 1, unitPrice: 0, tvaRate: 0}
    ],
    discount: {type: 'none', value: 0},
    notes: ''
  };
}

export function cryptoId() {
  // آمن في المتصفح والـserver
  return globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(16).slice(2)}`;
}

export function calcDevisTotals(draft: DevisDraft) {
  const lines = draft.items.map((it) => {
    const base = safeNum(it.qty) * safeNum(it.unitPrice);
    const tva = base * safeNum(it.tvaRate);
    return {base, tva, total: base + tva};
  });

  const subtotal = sum(lines.map((l) => l.base));
  const tvaTotal = sum(lines.map((l) => l.tva));
  const gross = subtotal + tvaTotal;

  const discountAmount = (() => {
    if (draft.discount.type === 'none') return 0;
    if (draft.discount.type === 'amount') return clamp(safeNum(draft.discount.value), 0, gross);
    const pct = clamp(safeNum(draft.discount.value), 0, 100) / 100;
    return gross * pct;
  })();

  const total = Math.max(0, gross - discountAmount);

  return {subtotal, tvaTotal, discountAmount, total};
}

function sum(ns: number[]) {
  return ns.reduce((a, b) => a + b, 0);
}
function safeNum(n: unknown) {
  const x = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(x) ? x : 0;
}
function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}
