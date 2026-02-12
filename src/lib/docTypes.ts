// src/lib/docTypes.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Unified Document Type System
// Supports: Invoice, Devis (Quote), Bon de Livraison, Credit Note
// ────────────────────────────────────────────────────────────────

/** All supported document kinds */
export type DocKind = 'invoice' | 'devis' | 'bon_livraison' | 'credit_note';

/** Document lifecycle statuses */
export type DocStatus =
  | 'draft'        // مسودة — working copy, not sent
  | 'sent'         // مرسلة — shared with client
  | 'paid'         // مدفوعة — fully paid
  | 'partial'      // مدفوعة جزئياً — partially paid
  | 'overdue'      // متأخرة — past due date
  | 'cancelled'    // ملغاة — voided
  | 'delivered';   // تم التسليم — for bon_livraison only

/** Payment method */
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'ccp' | 'card' | 'other';

/** Single payment record for tracking partial payments */
export interface PaymentRecord {
  id: string;
  date: string;          // ISO date
  amount: number;
  method: PaymentMethod;
  reference?: string;    // check number, transfer ref, etc.
  notes?: string;
}

/** Country-specific configuration */
export type CountryCode = 'DZ' | 'SA';

export interface CountryConfig {
  code: CountryCode;
  currency: string;        // DZD, SAR
  currencySymbol: string;  // د.ج, ر.س
  taxName: string;         // TVA, VAT
  defaultTaxRate: number;  // 19, 15
  locale: string;          // ar-DZ, ar-SA
  fiscalFields: string[];  // ['nif', 'rc', 'ai', 'nis'] for DZ, ['vat_number', 'cr_number'] for SA
  hasTimbreFiscal: boolean; // true for Algeria
  timbreAmount?: number;    // Timbre fiscal amount for Algeria
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  DZ: {
    code: 'DZ',
    currency: 'DZD',
    currencySymbol: 'د.ج',
    taxName: 'TVA',
    defaultTaxRate: 19,
    locale: 'ar-DZ',
    fiscalFields: ['nif', 'rc', 'ai', 'nis'],
    hasTimbreFiscal: true,
    timbreAmount: 0,
  },
  SA: {
    code: 'SA',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    taxName: 'VAT',
    defaultTaxRate: 15,
    locale: 'ar-SA',
    fiscalFields: ['vat_number', 'cr_number'],
    hasTimbreFiscal: false,
  },
};

/** Seller (company) info — extended for multi-country */
export interface SellerInfo {
  name: string;
  phone: string;
  address: string;
  email: string;
  logo?: string;       // URL to uploaded logo
  stamp?: string;      // URL to uploaded stamp/seal
  // Algeria-specific
  rc?: string;         // Registre de Commerce
  nif?: string;        // Numéro d'Identification Fiscale
  ai?: string;         // Article d'Imposition
  nis?: string;        // Numéro d'Identification Statistique
  // Saudi-specific
  vat_number?: string; // VAT Registration Number
  cr_number?: string;  // Commercial Registration
}

/** Client info — extended */
export interface ClientInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
  // Fiscal identifiers (optional per country)
  nif?: string;
  rc?: string;
  vat_number?: string;
  cr_number?: string;
}

/** Line item — enhanced with line-level discount */
export interface LineItem {
  lineId: string;
  productRefId?: string;
  label: string;
  description?: string;
  qty: number;
  unit: string;
  unitPrice: number;
  tvaRate: number;        // 0..100
  discount?: number;      // line-level discount %
}

/** Template styles */
export type TemplateStyle = 'classic' | 'modern' | 'minimal' | 'bold' | 'elegant' | 'corporate';

/** The unified document draft type */
export interface DocumentDraft {
  kind: DocKind;
  status: DocStatus;
  number: string;              // auto-generated: FAC-0001, DV-0001, BL-0001, AV-0001
  dateISO: string;             // issue date
  dueDate?: string;            // for invoices — when payment is due
  validUntil?: string;         // for devis — quote expiry
  reference?: string;          // internal reference or PO number
  relatedDocId?: string;       // link to source doc (devis→invoice conversion)
  country: CountryCode;
  currency: string;            // DZD, SAR, EUR, USD
  template: TemplateStyle;
  seller: SellerInfo;
  client: ClientInfo;
  items: LineItem[];
  notes?: string;
  internalNotes?: string;      // private notes, not shown on document
  discountRate?: number;       // global % discount
  payments?: PaymentRecord[];  // payment tracking
  // Algeria-specific
  timbreFiscal?: number;       // stamp tax amount
  // Metadata
  language?: string;           // document print language (ar, fr, en)
  color?: string;              // brand color for template
}

/** Computed totals */
export interface DocumentTotals {
  subtotal: number;
  lineDiscountTotal: number;
  globalDiscountAmount: number;
  taxTotal: number;
  timbreFiscal: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
}

/** Document prefix per kind */
export const DOC_PREFIXES: Record<DocKind, string> = {
  invoice: 'FAC',
  devis: 'DV',
  bon_livraison: 'BL',
  credit_note: 'AV',
};

/** Document kind labels (for i18n keys) */
export const DOC_KIND_LABELS: Record<DocKind, string> = {
  invoice: 'invoice',
  devis: 'quote',
  bon_livraison: 'deliveryNote',
  credit_note: 'creditNote',
};

/** Status colors */
export const STATUS_COLORS: Record<DocStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-500',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

// ── Helpers ──

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

export function genLineId(): string {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  const uuid = g.crypto?.randomUUID?.();
  if (uuid) return `li_${uuid}`;
  return `li_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Calculate line-level subtotal (before line discount) */
function lineSubtotal(item: LineItem): number {
  const qty = safeNum(item.qty, 1);
  const price = safeNum(item.unitPrice, 0);
  return qty * price;
}

/** Calculate totals for any document */
export function calcDocTotals(draft: DocumentDraft): DocumentTotals {
  let subtotal = 0;
  let lineDiscountTotal = 0;
  let taxTotal = 0;

  for (const item of draft.items) {
    const base = lineSubtotal(item);
    const lineDiscount = (base * clamp(safeNum(item.discount ?? 0, 0), 0, 100)) / 100;
    const afterDiscount = base - lineDiscount;
    const tax = (afterDiscount * clamp(safeNum(item.tvaRate, 0), 0, 100)) / 100;

    subtotal += base;
    lineDiscountTotal += lineDiscount;
    taxTotal += tax;
  }

  const globalDiscountRate = clamp(safeNum(draft.discountRate ?? 0, 0), 0, 100);
  const globalDiscountAmount = ((subtotal - lineDiscountTotal) * globalDiscountRate) / 100;

  const timbre = safeNum(draft.timbreFiscal ?? 0, 0);

  const total = Math.max(0, subtotal - lineDiscountTotal - globalDiscountAmount + taxTotal + timbre);

  const paidAmount = (draft.payments ?? []).reduce(
    (sum, p) => sum + safeNum(p.amount, 0),
    0
  );

  return {
    subtotal: round2(subtotal),
    lineDiscountTotal: round2(lineDiscountTotal),
    globalDiscountAmount: round2(globalDiscountAmount),
    taxTotal: round2(taxTotal),
    timbreFiscal: round2(timbre),
    total: round2(total),
    paidAmount: round2(paidAmount),
    remainingAmount: round2(Math.max(0, total - paidAmount)),
  };
}

/** Normalize a document draft (fill defaults, fix invalid numbers) */
export function normalizeDocDraft(d: DocumentDraft): DocumentDraft {
  const items = (d.items ?? []).map((it) => ({
    ...it,
    lineId: it.lineId?.trim() ? it.lineId : genLineId(),
    qty: Number.isFinite(it.qty) ? it.qty : 1,
    unitPrice: Number.isFinite(it.unitPrice) ? it.unitPrice : 0,
    tvaRate: Number.isFinite(it.tvaRate) ? it.tvaRate : 0,
    discount: Number.isFinite(it.discount ?? 0) ? it.discount : 0,
  }));
  return { ...d, items };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Create a new empty document of any kind */
export function createEmptyDoc(
  kind: DocKind,
  country: CountryCode = 'DZ',
  number = ''
): DocumentDraft {
  const config = COUNTRY_CONFIGS[country];
  const prefix = DOC_PREFIXES[kind];
  const docNumber = number || `${prefix}-0001`;

  return normalizeDocDraft({
    kind,
    status: 'draft',
    number: docNumber,
    dateISO: todayISO(),
    dueDate: kind === 'invoice' ? addDays(todayISO(), 30) : undefined,
    validUntil: kind === 'devis' ? addDays(todayISO(), 30) : undefined,
    country,
    currency: config.currency,
    template: 'modern',
    seller: {
      name: '',
      phone: '',
      address: '',
      email: '',
    },
    client: {
      name: '',
      phone: '',
      address: '',
      email: '',
    },
    items: [
      {
        lineId: genLineId(),
        label: '',
        description: '',
        qty: 1,
        unit: 'pcs',
        unitPrice: 0,
        tvaRate: config.defaultTaxRate,
      },
    ],
    notes: '',
    discountRate: 0,
    timbreFiscal: config.hasTimbreFiscal ? config.timbreAmount : undefined,
    payments: [],
  });
}

/** Convert a document from one kind to another (e.g., Devis → Invoice) */
export function convertDocument(
  source: DocumentDraft,
  targetKind: DocKind,
  newNumber: string
): DocumentDraft {
  return {
    ...source,
    kind: targetKind,
    status: 'draft',
    number: newNumber,
    dateISO: todayISO(),
    dueDate: targetKind === 'invoice' ? addDays(todayISO(), 30) : undefined,
    relatedDocId: undefined, // will be set when saving
    payments: [],
  };
}

/** Get all valid status transitions */
export function getValidTransitions(kind: DocKind, currentStatus: DocStatus): DocStatus[] {
  const transitions: Record<DocKind, Record<DocStatus, DocStatus[]>> = {
    invoice: {
      draft: ['sent', 'cancelled'],
      sent: ['paid', 'partial', 'overdue', 'cancelled'],
      partial: ['paid', 'overdue', 'cancelled'],
      overdue: ['paid', 'partial', 'cancelled'],
      paid: [],
      cancelled: ['draft'],
      delivered: [],
    },
    devis: {
      draft: ['sent', 'cancelled'],
      sent: ['cancelled'],   // accepted = convert to invoice
      paid: [],
      partial: [],
      overdue: [],
      cancelled: ['draft'],
      delivered: [],
    },
    bon_livraison: {
      draft: ['delivered', 'cancelled'],
      delivered: [],
      sent: [],
      paid: [],
      partial: [],
      overdue: [],
      cancelled: ['draft'],
    },
    credit_note: {
      draft: ['sent', 'cancelled'],
      sent: ['paid', 'cancelled'],
      paid: [],
      partial: [],
      overdue: [],
      cancelled: ['draft'],
      delivered: [],
    },
  };

  return transitions[kind]?.[currentStatus] ?? [];
}

/** Which document kinds can this kind be converted to? */
export function getConversionTargets(kind: DocKind): DocKind[] {
  const targets: Record<DocKind, DocKind[]> = {
    devis: ['invoice', 'bon_livraison'],
    invoice: ['credit_note', 'bon_livraison'],
    bon_livraison: ['invoice'],
    credit_note: [],
  };
  return targets[kind] ?? [];
}

// ── Date helpers ──

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
