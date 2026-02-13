// src/lib/schemas/converters.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Document Converters & Builders
// Handles: Devis→Invoice, Invoice→CreditNote, DB mapping, etc.
// ────────────────────────────────────────────────────────────────

import type {
  DocumentDraft,
  DocKind,
  CountryCode,
  LineItem,
  SellerInfo,
  ClientInfo,
} from './document.schema';
import { DOC_PREFIXES, COUNTRY_CONFIGS } from './document.schema';
import { calcDocTotals } from './calculations';
import type { Database } from '../database.types';

type DbDocument = Database['public']['Tables']['documents']['Row'];
type DbDocumentInsert = Database['public']['Tables']['documents']['Insert'];

// ── Date Helpers ───────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Line ID Generator ──────────────────────────────────────────

export function genLineId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `li_${crypto.randomUUID()}`;
  }
  return `li_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Empty Document Builder ─────────────────────────────────────

export interface CreateDocOptions {
  kind: DocKind;
  country?: CountryCode;
  number?: string;
  seller?: Partial<SellerInfo>;
  template?: DocumentDraft['template'];
}

/**
 * Create a new empty document of any kind
 */
export function createEmptyDoc(options: CreateDocOptions): DocumentDraft {
  const { kind, country = 'DZ', number, seller, template = 'modern' } = options;
  const config = COUNTRY_CONFIGS[country];
  const prefix = DOC_PREFIXES[kind];
  const docNumber = number || `${prefix}-${new Date().getFullYear()}-0001`;

  const defaultSeller: SellerInfo = {
    name: '',
    phone: '',
    address: '',
    email: '',
    ...seller,
  };

  const defaultClient: ClientInfo = {
    name: '',
    phone: '',
    address: '',
    email: '',
  };

  const defaultItem: LineItem = {
    lineId: genLineId(),
    label: '',
    description: '',
    qty: 1,
    unit: 'pcs',
    unitPrice: 0,
    tvaRate: config.defaultTaxRate,
    discount: 0,
  };

  return {
    kind,
    status: 'draft',
    number: docNumber,
    dateISO: todayISO(),
    dueDate: kind === 'invoice' ? addDays(todayISO(), 30) : undefined,
    validUntil: kind === 'devis' ? addDays(todayISO(), 30) : undefined,
    country,
    currency: config.currency,
    template,
    seller: defaultSeller,
    client: defaultClient,
    items: [defaultItem],
    notes: '',
    discountRate: 0,
    timbreFiscal: config.hasTimbreFiscal ? (config.timbreAmount ?? 0) : undefined,
    payments: [],
    language: 'ar',
  };
}

// ── Document Conversion ────────────────────────────────────────

export interface ConvertDocOptions {
  newNumber: string;
  keepItems?: boolean;
  keepNotes?: boolean;
  relatedDocId?: string;
}

/**
 * Get valid conversion targets for a document kind
 */
export function getConversionTargets(kind: DocKind): DocKind[] {
  const targets: Record<DocKind, DocKind[]> = {
    devis: ['invoice', 'bon_livraison'],
    invoice: ['credit_note', 'bon_livraison'],
    bon_livraison: ['invoice'],
    credit_note: [],
  };
  return targets[kind] ?? [];
}

/**
 * Convert a document from one kind to another
 * E.g., Devis → Invoice, Invoice → Credit Note
 */
export function convertDocument(
  source: DocumentDraft,
  targetKind: DocKind,
  options: ConvertDocOptions
): DocumentDraft {
  const { newNumber, keepItems = true, keepNotes = true, relatedDocId } = options;

  // Validate conversion is allowed
  const validTargets = getConversionTargets(source.kind);
  if (!validTargets.includes(targetKind)) {
    throw new Error(
      `Cannot convert ${source.kind} to ${targetKind}. Valid targets: ${validTargets.join(', ')}`
    );
  }

  const converted: DocumentDraft = {
    ...source,
    kind: targetKind,
    status: 'draft',
    number: newNumber,
    dateISO: todayISO(),
    dueDate: targetKind === 'invoice' ? addDays(todayISO(), 30) : undefined,
    validUntil: targetKind === 'devis' ? addDays(todayISO(), 30) : undefined,
    relatedDocId: relatedDocId ?? undefined,
    payments: [], // Reset payments for new document
    items: keepItems
      ? source.items.map((item) => ({ ...item, lineId: genLineId() }))
      : [
          {
            lineId: genLineId(),
            label: '',
            qty: 1,
            unit: 'pcs',
            unitPrice: 0,
            tvaRate: COUNTRY_CONFIGS[source.country].defaultTaxRate,
            discount: 0,
          },
        ],
    notes: keepNotes ? source.notes : '',
    internalNotes: keepNotes ? source.internalNotes : '',
  };

  return converted;
}

/**
 * Create a credit note from an invoice (reversal)
 */
export function createCreditNote(
  invoice: DocumentDraft,
  creditNoteNumber: string,
  options?: { partialItems?: LineItem[] }
): DocumentDraft {
  if (invoice.kind !== 'invoice') {
    throw new Error('Credit notes can only be created from invoices');
  }

  const items = options?.partialItems ?? invoice.items;

  return {
    ...invoice,
    kind: 'credit_note',
    status: 'draft',
    number: creditNoteNumber,
    dateISO: todayISO(),
    dueDate: undefined,
    relatedDocId: undefined, // Will be set when saving
    payments: [],
    items: items.map((item) => ({ ...item, lineId: genLineId() })),
    notes: `مرتجع فاتورة رقم: ${invoice.number}`,
  };
}

// ── Document Cloning ───────────────────────────────────────────

/**
 * Clone a document (create a copy with new number)
 */
export function cloneDocument(
  source: DocumentDraft,
  newNumber: string
): DocumentDraft {
  return {
    ...source,
    number: newNumber,
    status: 'draft',
    dateISO: todayISO(),
    dueDate: source.kind === 'invoice' ? addDays(todayISO(), 30) : source.dueDate,
    validUntil: source.kind === 'devis' ? addDays(todayISO(), 30) : source.validUntil,
    relatedDocId: undefined,
    payments: [],
    items: source.items.map((item) => ({ ...item, lineId: genLineId() })),
  };
}

// ── DB Mapping ─────────────────────────────────────────────────

/**
 * Convert DocumentDraft to DB insert format
 */
export function draftToDbInsert(
  draft: DocumentDraft,
  userId: string,
  clientId?: string
): DbDocumentInsert {
  const totals = calcDocTotals(draft);

  return {
    user_id: userId,
    kind: draft.kind,
    number: draft.number,
    status: draft.status,
    date_iso: draft.dateISO,
    due_date: draft.dueDate ?? null,
    valid_until: draft.validUntil ?? null,
    reference: draft.reference ?? null,
    related_doc_id: draft.relatedDocId ?? null,
    client_id: clientId ?? null,
    client_snapshot: draft.client as unknown as Database['public']['Tables']['documents']['Row']['client_snapshot'],
    country: draft.country,
    currency: draft.currency,
    template: draft.template,
    language: draft.language ?? null,
    color: draft.color ?? null,
    items: draft.items as unknown as Database['public']['Tables']['documents']['Row']['items'],
    notes: draft.notes ?? null,
    internal_notes: draft.internalNotes ?? null,
    discount_rate: draft.discountRate ?? null,
    timbre_fiscal: draft.timbreFiscal ?? null,
    subtotal: totals.subtotal,
    tax_total: totals.taxTotal,
    total: totals.total,
  };
}

/**
 * Convert DB row to DocumentDraft
 */
export function dbRowToDraft(
  row: DbDocument,
  seller: SellerInfo
): DocumentDraft {
  return {
    kind: row.kind,
    status: row.status,
    number: row.number,
    dateISO: row.date_iso,
    dueDate: row.due_date ?? undefined,
    validUntil: row.valid_until ?? undefined,
    reference: row.reference ?? undefined,
    relatedDocId: row.related_doc_id ?? undefined,
    country: row.country,
    currency: row.currency,
    template: row.template,
    seller,
    client: row.client_snapshot as unknown as ClientInfo,
    items: (row.items ?? []) as unknown as LineItem[],
    notes: row.notes ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    discountRate: row.discount_rate ?? 0,
    payments: [], // Loaded separately from payments table
    timbreFiscal: row.timbre_fiscal ?? undefined,
    language: (row.language as 'ar' | 'fr' | 'en') ?? 'ar',
    color: row.color ?? undefined,
  };
}

// ── Item Helpers ───────────────────────────────────────────────

/**
 * Add a new empty line item to a document
 */
export function addLineItem(
  draft: DocumentDraft,
  item?: Partial<LineItem>
): DocumentDraft {
  const config = COUNTRY_CONFIGS[draft.country];
  const newItem: LineItem = {
    lineId: genLineId(),
    label: '',
    qty: 1,
    unit: 'pcs',
    unitPrice: 0,
    tvaRate: config.defaultTaxRate,
    discount: 0,
    ...item,
  };

  return {
    ...draft,
    items: [...draft.items, newItem],
  };
}

/**
 * Remove a line item by ID
 */
export function removeLineItem(draft: DocumentDraft, lineId: string): DocumentDraft {
  return {
    ...draft,
    items: draft.items.filter((item) => item.lineId !== lineId),
  };
}

/**
 * Update a line item
 */
export function updateLineItem(
  draft: DocumentDraft,
  lineId: string,
  updates: Partial<LineItem>
): DocumentDraft {
  return {
    ...draft,
    items: draft.items.map((item) =>
      item.lineId === lineId ? { ...item, ...updates } : item
    ),
  };
}

// ── Normalization ──────────────────────────────────────────────

/**
 * Normalize a document draft (fix missing/invalid values)
 */
export function normalizeDocDraft(d: Partial<DocumentDraft>): DocumentDraft {
  const country = d.country ?? 'DZ';
  const config = COUNTRY_CONFIGS[country];

  const items = (d.items ?? []).map((it) => ({
    ...it,
    lineId: it.lineId?.trim() ? it.lineId : genLineId(),
    label: it.label ?? '',
    qty: Number.isFinite(it.qty) && it.qty > 0 ? it.qty : 1,
    unit: it.unit ?? 'pcs',
    unitPrice: Number.isFinite(it.unitPrice) ? it.unitPrice : 0,
    tvaRate: Number.isFinite(it.tvaRate) ? it.tvaRate : config.defaultTaxRate,
    discount: Number.isFinite(it.discount ?? 0) ? it.discount : 0,
  }));

  return {
    kind: d.kind ?? 'invoice',
    status: d.status ?? 'draft',
    number: d.number ?? '',
    dateISO: d.dateISO ?? todayISO(),
    dueDate: d.dueDate,
    validUntil: d.validUntil,
    reference: d.reference,
    relatedDocId: d.relatedDocId,
    country,
    currency: d.currency ?? config.currency,
    template: d.template ?? 'modern',
    seller: d.seller ?? { name: '', phone: '', address: '', email: '' },
    client: d.client ?? { name: '', phone: '', address: '', email: '' },
    items: items.length > 0 ? items : [
      {
        lineId: genLineId(),
        label: '',
        qty: 1,
        unit: 'pcs',
        unitPrice: 0,
        tvaRate: config.defaultTaxRate,
        discount: 0,
      },
    ],
    notes: d.notes,
    internalNotes: d.internalNotes,
    discountRate: d.discountRate ?? 0,
    payments: d.payments ?? [],
    timbreFiscal: d.timbreFiscal,
    language: d.language ?? 'ar',
    color: d.color,
  };
}
