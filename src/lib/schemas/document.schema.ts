// src/lib/schemas/document.schema.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Document Validation Schemas (Zod v4)
// Covers: Invoice, Devis (Quote), Bon de Livraison, Credit Note
// ────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────────

export const DocKindSchema = z.enum(['invoice', 'devis', 'bon_livraison', 'credit_note']);

export const DocStatusSchema = z.enum([
  'draft',      // مسودة
  'sent',       // مرسلة
  'paid',       // مدفوعة
  'partial',    // مدفوعة جزئياً
  'overdue',    // متأخرة
  'cancelled',  // ملغاة
  'delivered',  // تم التسليم
]);

export const PaymentMethodSchema = z.enum([
  'cash',           // نقداً
  'bank_transfer',  // تحويل بنكي
  'check',          // شيك
  'ccp',            // CCP (الجزائر)
  'card',           // بطاقة
  'other',          // آخر
]);

export const CountryCodeSchema = z.enum(['DZ', 'SA']);

export const TemplateStyleSchema = z.enum([
  'classic',
  'modern',
  'minimal',
  'bold',
  'elegant',
  'corporate',
]);

// ── Types from Schemas ─────────────────────────────────────────

export type DocKind = z.infer<typeof DocKindSchema>;
export type DocStatus = z.infer<typeof DocStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CountryCode = z.infer<typeof CountryCodeSchema>;
export type TemplateStyle = z.infer<typeof TemplateStyleSchema>;

// ── Payment Record ─────────────────────────────────────────────

export const PaymentRecordSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid ISO date format'),
  amount: z.number().nonnegative('Amount must be non-negative'),
  method: PaymentMethodSchema,
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;

// ── Country Configuration ──────────────────────────────────────

export const CountryConfigSchema = z.object({
  code: CountryCodeSchema,
  currency: z.string().length(3),
  currencySymbol: z.string().min(1),
  taxName: z.string().min(1),
  defaultTaxRate: z.number().min(0).max(100),
  locale: z.string(),
  fiscalFields: z.array(z.string()),
  hasTimbreFiscal: z.boolean(),
  timbreAmount: z.number().optional(),
});

export type CountryConfig = z.infer<typeof CountryConfigSchema>;

// ── Seller Info ────────────────────────────────────────────────

export const SellerInfoSchema = z.object({
  name: z.string().min(1, 'اسم الشركة مطلوب'),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  stamp: z.string().url().optional().or(z.literal('')),
  // Algeria-specific
  rc: z.string().optional(),      // Registre de Commerce
  nif: z.string().optional(),     // NIF
  ai: z.string().optional(),      // Article d'Imposition
  nis: z.string().optional(),     // NIS
  // Saudi-specific
  vat_number: z.string().optional(),
  cr_number: z.string().optional(),
});

export type SellerInfo = z.infer<typeof SellerInfoSchema>;

// ── Client Info ────────────────────────────────────────────────

export const ClientInfoSchema = z.object({
  name: z.string().min(1, 'اسم العميل مطلوب'),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  nif: z.string().optional(),
  rc: z.string().optional(),
  vat_number: z.string().optional(),
  cr_number: z.string().optional(),
});

export type ClientInfo = z.infer<typeof ClientInfoSchema>;

// ── Line Item ──────────────────────────────────────────────────

export const LineItemSchema = z.object({
  lineId: z.string().min(1),
  productRefId: z.string().optional(),
  label: z.string().min(1, 'اسم المنتج/الخدمة مطلوب'),
  description: z.string().optional(),
  qty: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
  unit: z.string().min(1).default('pcs'),
  unitPrice: z.number().nonnegative('السعر يجب أن يكون صفر أو أكبر'),
  tvaRate: z.number().min(0).max(100).default(19),
  discount: z.number().min(0).max(100).optional().default(0),
});

export type LineItem = z.infer<typeof LineItemSchema>;

// ── Document Draft (Main Schema) ───────────────────────────────

export const DocumentDraftSchema = z.object({
  kind: DocKindSchema,
  status: DocStatusSchema.default('draft'),
  number: z.string().min(1, 'رقم المستند مطلوب'),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reference: z.string().optional(),
  relatedDocId: z.string().optional(),
  country: CountryCodeSchema.default('DZ'),
  currency: z.string().length(3).default('DZD'),
  template: TemplateStyleSchema.default('modern'),
  seller: SellerInfoSchema,
  client: ClientInfoSchema,
  items: z.array(LineItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  discountRate: z.number().min(0).max(100).optional().default(0),
  payments: z.array(PaymentRecordSchema).optional().default([]),
  timbreFiscal: z.number().nonnegative().optional(),
  language: z.enum(['ar', 'fr', 'en']).optional().default('ar'),
  color: z.string().optional(),
});

export type DocumentDraft = z.infer<typeof DocumentDraftSchema>;

// ── Computed Totals ────────────────────────────────────────────

export const DocumentTotalsSchema = z.object({
  subtotal: z.number().nonnegative(),
  lineDiscountTotal: z.number().nonnegative(),
  globalDiscountAmount: z.number().nonnegative(),
  taxTotal: z.number().nonnegative(),
  timbreFiscal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  remainingAmount: z.number().nonnegative(),
});

export type DocumentTotals = z.infer<typeof DocumentTotalsSchema>;

// ── Document Kind-Specific Schemas ─────────────────────────────

// Invoice: must have seller, client, items, dueDate recommended
export const InvoiceSchema = DocumentDraftSchema.extend({
  kind: z.literal('invoice'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ الاستحقاق مطلوب'),
}).refine(
  (doc) => doc.items.length > 0,
  { message: 'الفاتورة يجب أن تحتوي على منتج واحد على الأقل' }
);

// Devis (Quote): validUntil is recommended
export const DevisSchema = DocumentDraftSchema.extend({
  kind: z.literal('devis'),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Bon de Livraison: no payment tracking, status is draft/delivered/cancelled
export const BonLivraisonSchema = DocumentDraftSchema.extend({
  kind: z.literal('bon_livraison'),
  status: z.enum(['draft', 'delivered', 'cancelled']).default('draft'),
}).omit({ payments: true, dueDate: true });

// Credit Note (Avoir): links to original invoice
export const CreditNoteSchema = DocumentDraftSchema.extend({
  kind: z.literal('credit_note'),
  relatedDocId: z.string().min(1, 'يجب ربط مستند المرتجع بفاتورة'),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type Devis = z.infer<typeof DevisSchema>;
export type BonLivraison = z.infer<typeof BonLivraisonSchema>;
export type CreditNote = z.infer<typeof CreditNoteSchema>;

// ── Validation Helpers ─────────────────────────────────────────

/** Validation result type */
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } };

/**
 * Validate a document draft and return typed result
 */
export function validateDocument(data: unknown): ValidationResult<DocumentDraft> {
  const result = DocumentDraftSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: {
      issues: result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    },
  };
}

/**
 * Validate by document kind
 */
export function validateByKind(kind: DocKind, data: unknown): ValidationResult<DocumentDraft> {
  let result;
  switch (kind) {
    case 'invoice':
      result = InvoiceSchema.safeParse(data);
      break;
    case 'devis':
      result = DevisSchema.safeParse(data);
      break;
    case 'bon_livraison':
      result = BonLivraisonSchema.safeParse(data);
      break;
    case 'credit_note':
      result = CreditNoteSchema.safeParse(data);
      break;
    default:
      result = DocumentDraftSchema.safeParse(data);
  }
  
  if (result.success) {
    return { success: true, data: result.data as DocumentDraft };
  }
  return {
    success: false,
    error: {
      issues: result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    },
  };
}

/**
 * Get validation errors as flat array of messages
 */
export function getValidationErrors(result: ValidationResult<unknown>): string[] {
  if (result.success) return [];
  return result.error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`);
}

/**
 * Check if document can transition to a new status
 */
export function canTransitionTo(kind: DocKind, current: DocStatus, target: DocStatus): boolean {
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
      sent: ['cancelled'],
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

  return transitions[kind]?.[current]?.includes(target) ?? false;
}

// ── Document Number Validation ─────────────────────────────────

export const DocNumberSchema = z.string().regex(
  /^(FAC|DV|BL|AV)-(\d{4}-)?\d{4}$/,
  'رقم المستند غير صالح. الصيغة: PREFIX-YYYY-NNNN أو PREFIX-NNNN'
);

/**
 * Parse document number and extract components
 */
export function parseDocNumber(number: string): {
  prefix: string;
  kind: DocKind;
  year?: string;
  sequence: number;
} | null {
  const fullMatch = number.match(/^(FAC|DV|BL|AV)-(\d{4})-(\d+)$/);
  if (fullMatch) {
    return {
      prefix: fullMatch[1],
      kind: prefixToKind(fullMatch[1]),
      year: fullMatch[2],
      sequence: parseInt(fullMatch[3], 10),
    };
  }

  const shortMatch = number.match(/^(FAC|DV|BL|AV)-(\d+)$/);
  if (shortMatch) {
    return {
      prefix: shortMatch[1],
      kind: prefixToKind(shortMatch[1]),
      sequence: parseInt(shortMatch[2], 10),
    };
  }

  return null;
}

function prefixToKind(prefix: string): DocKind {
  const map: Record<string, DocKind> = {
    FAC: 'invoice',
    DV: 'devis',
    BL: 'bon_livraison',
    AV: 'credit_note',
  };
  return map[prefix] ?? 'invoice';
}

// ── Constants ──────────────────────────────────────────────────

export const DOC_PREFIXES: Record<DocKind, string> = {
  invoice: 'FAC',
  devis: 'DV',
  bon_livraison: 'BL',
  credit_note: 'AV',
};

export const DOC_KIND_LABELS: Record<DocKind, { ar: string; fr: string; en: string }> = {
  invoice: { ar: 'فاتورة', fr: 'Facture', en: 'Invoice' },
  devis: { ar: 'عرض أسعار', fr: 'Devis', en: 'Quote' },
  bon_livraison: { ar: 'وصل تسليم', fr: 'Bon de Livraison', en: 'Delivery Note' },
  credit_note: { ar: 'فاتورة مرتجع', fr: 'Avoir', en: 'Credit Note' },
};

export const STATUS_LABELS: Record<DocStatus, { ar: string; fr: string; en: string }> = {
  draft: { ar: 'مسودة', fr: 'Brouillon', en: 'Draft' },
  sent: { ar: 'مرسلة', fr: 'Envoyée', en: 'Sent' },
  paid: { ar: 'مدفوعة', fr: 'Payée', en: 'Paid' },
  partial: { ar: 'مدفوعة جزئياً', fr: 'Partiellement payée', en: 'Partially Paid' },
  overdue: { ar: 'متأخرة', fr: 'En retard', en: 'Overdue' },
  cancelled: { ar: 'ملغاة', fr: 'Annulée', en: 'Cancelled' },
  delivered: { ar: 'تم التسليم', fr: 'Livrée', en: 'Delivered' },
};

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
