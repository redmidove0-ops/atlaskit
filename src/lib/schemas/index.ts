// src/lib/schemas/index.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Schema & Types Index
// Central export point for all document types and validation
// ────────────────────────────────────────────────────────────────

// ── Document Schemas & Types ───────────────────────────────────
export {
  // Enum schemas
  DocKindSchema,
  DocStatusSchema,
  PaymentMethodSchema,
  CountryCodeSchema,
  TemplateStyleSchema,

  // Object schemas
  PaymentRecordSchema,
  CountryConfigSchema,
  SellerInfoSchema,
  ClientInfoSchema,
  LineItemSchema,
  DocumentDraftSchema,
  DocumentTotalsSchema,
  DocNumberSchema,

  // Document-specific schemas
  InvoiceSchema,
  DevisSchema,
  BonLivraisonSchema,
  CreditNoteSchema,

  // Inferred types
  type DocKind,
  type DocStatus,
  type PaymentMethod,
  type CountryCode,
  type TemplateStyle,
  type PaymentRecord,
  type CountryConfig,
  type SellerInfo,
  type ClientInfo,
  type LineItem,
  type DocumentDraft,
  type DocumentTotals,
  type Invoice,
  type Devis,
  type BonLivraison,
  type CreditNote,

  // Validation helpers
  validateDocument,
  validateByKind,
  getValidationErrors,
  canTransitionTo,
  parseDocNumber,
  type ValidationResult,

  // Constants
  DOC_PREFIXES,
  DOC_KIND_LABELS,
  STATUS_LABELS,
  COUNTRY_CONFIGS,
} from './document.schema';

// ── Calculations ───────────────────────────────────────────────
export {
  calcLineItemTotals,
  calcDocTotals,
  getTaxBreakdown,
  calcTimbreFiscal,
  getPaymentStatus,
  getRemainingPercent,
  getPaidPercent,
  compareDocuments,
  quickTotal,
  type LineItemTotals,
  type TaxBreakdown,
  type PaymentStatus,
} from './calculations';

// ── Converters & Builders ──────────────────────────────────────
export {
  // Builders
  createEmptyDoc,
  genLineId,
  type CreateDocOptions,

  // Converters
  convertDocument,
  createCreditNote,
  cloneDocument,
  getConversionTargets,
  type ConvertDocOptions,

  // DB Mapping
  draftToDbInsert,
  dbRowToDraft,

  // Item helpers
  addLineItem,
  removeLineItem,
  updateLineItem,

  // Normalization
  normalizeDocDraft,
} from './converters';
