// src/lib/schemas/calculations.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Document Calculations
// Unified totals computation for all document types
// ────────────────────────────────────────────────────────────────

import type { LineItem, DocumentDraft, DocumentTotals, CountryCode } from './document.schema';
import { COUNTRY_CONFIGS } from './document.schema';

// ── Safe Math Helpers ──────────────────────────────────────────

function safeNum(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Line Item Calculations ─────────────────────────────────────

export interface LineItemTotals {
  subtotal: number;        // qty × unitPrice
  discountAmount: number;  // line discount in value
  afterDiscount: number;   // subtotal - discount
  taxAmount: number;       // TVA amount
  lineTotal: number;       // afterDiscount + taxAmount
}

/**
 * Calculate totals for a single line item
 */
export function calcLineItemTotals(item: LineItem): LineItemTotals {
  const qty = safeNum(item.qty, 1);
  const price = safeNum(item.unitPrice, 0);
  const subtotal = qty * price;

  const discountRate = clamp(safeNum(item.discount ?? 0, 0), 0, 100);
  const discountAmount = (subtotal * discountRate) / 100;
  const afterDiscount = subtotal - discountAmount;

  const tvaRate = clamp(safeNum(item.tvaRate, 0), 0, 100);
  const taxAmount = (afterDiscount * tvaRate) / 100;

  const lineTotal = afterDiscount + taxAmount;

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    afterDiscount: round2(afterDiscount),
    taxAmount: round2(taxAmount),
    lineTotal: round2(lineTotal),
  };
}

// ── Document Totals ────────────────────────────────────────────

/**
 * Calculate complete totals for a document
 */
export function calcDocTotals(draft: DocumentDraft): DocumentTotals {
  let subtotal = 0;
  let lineDiscountTotal = 0;
  let taxTotal = 0;

  for (const item of draft.items) {
    const lineTotals = calcLineItemTotals(item);
    subtotal += lineTotals.subtotal;
    lineDiscountTotal += lineTotals.discountAmount;
    taxTotal += lineTotals.taxAmount;
  }

  const afterLineDiscount = subtotal - lineDiscountTotal;

  const globalDiscountRate = clamp(safeNum(draft.discountRate ?? 0, 0), 0, 100);
  const globalDiscountAmount = (afterLineDiscount * globalDiscountRate) / 100;

  const timbre = safeNum(draft.timbreFiscal ?? 0, 0);

  const total = Math.max(
    0,
    afterLineDiscount - globalDiscountAmount + taxTotal + timbre
  );

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

// ── Tax Breakdown ──────────────────────────────────────────────

export interface TaxBreakdown {
  rate: number;
  base: number;    // Amount before tax at this rate
  amount: number;  // Tax amount
}

/**
 * Get tax breakdown by rate (for documents with multiple TVA rates)
 */
export function getTaxBreakdown(draft: DocumentDraft): TaxBreakdown[] {
  const byRate = new Map<number, { base: number; amount: number }>();

  for (const item of draft.items) {
    const lineTotals = calcLineItemTotals(item);
    const rate = safeNum(item.tvaRate, 0);

    const existing = byRate.get(rate) ?? { base: 0, amount: 0 };
    existing.base += lineTotals.afterDiscount;
    existing.amount += lineTotals.taxAmount;
    byRate.set(rate, existing);
  }

  return Array.from(byRate.entries())
    .map(([rate, { base, amount }]) => ({
      rate,
      base: round2(base),
      amount: round2(amount),
    }))
    .sort((a, b) => a.rate - b.rate);
}

// ── Timbre Fiscal (Algeria) ────────────────────────────────────

/**
 * Calculate timbre fiscal based on total (Algeria specific)
 * Current rules: 1% of amount, min 5 DZD, max 2500 DZD
 * Note: These values can be updated based on current regulations
 */
export function calcTimbreFiscal(
  total: number,
  country: CountryCode = 'DZ'
): number {
  if (country !== 'DZ') return 0;

  const config = COUNTRY_CONFIGS[country];
  if (!config.hasTimbreFiscal) return 0;

  // Fixed timbre if configured
  if (config.timbreAmount && config.timbreAmount > 0) {
    return config.timbreAmount;
  }

  // Percentage-based (1% with min/max)
  const rate = 0.01;
  const min = 5;
  const max = 2500;

  const calculated = total * rate;
  return round2(Math.min(max, Math.max(min, calculated)));
}

// ── Payment Status Helpers ─────────────────────────────────────

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overpaid';

/**
 * Determine payment status based on totals
 */
export function getPaymentStatus(totals: DocumentTotals): PaymentStatus {
  if (totals.paidAmount === 0) return 'unpaid';
  if (totals.paidAmount >= totals.total) return totals.paidAmount > totals.total ? 'overpaid' : 'paid';
  return 'partial';
}

/**
 * Calculate remaining percentage
 */
export function getRemainingPercent(totals: DocumentTotals): number {
  if (totals.total === 0) return 0;
  return round2((totals.remainingAmount / totals.total) * 100);
}

/**
 * Calculate paid percentage
 */
export function getPaidPercent(totals: DocumentTotals): number {
  if (totals.total === 0) return 100;
  return round2(Math.min(100, (totals.paidAmount / totals.total) * 100));
}

// ── Document Comparison ────────────────────────────────────────

/**
 * Compare two documents (useful for credit notes vs original invoice)
 */
export function compareDocuments(
  original: DocumentDraft,
  comparison: DocumentDraft
): {
  originalTotal: number;
  comparisonTotal: number;
  difference: number;
  percentChange: number;
} {
  const origTotals = calcDocTotals(original);
  const compTotals = calcDocTotals(comparison);

  const difference = compTotals.total - origTotals.total;
  const percentChange = origTotals.total > 0
    ? round2((difference / origTotals.total) * 100)
    : 0;

  return {
    originalTotal: origTotals.total,
    comparisonTotal: compTotals.total,
    difference: round2(difference),
    percentChange,
  };
}

// ── Quick Totals (without payments) ────────────────────────────

/**
 * Quick calculation of just the document total (without payment tracking)
 */
export function quickTotal(items: LineItem[], discountRate = 0, timbre = 0): number {
  let subtotal = 0;
  let lineDiscountTotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const totals = calcLineItemTotals(item);
    subtotal += totals.subtotal;
    lineDiscountTotal += totals.discountAmount;
    taxTotal += totals.taxAmount;
  }

  const afterLineDiscount = subtotal - lineDiscountTotal;
  const globalDiscount = (afterLineDiscount * clamp(discountRate, 0, 100)) / 100;

  return round2(afterLineDiscount - globalDiscount + taxTotal + timbre);
}
