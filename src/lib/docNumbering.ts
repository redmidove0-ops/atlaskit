// src/lib/docNumbering.ts
// ────────────────────────────────────────────────────────────────
// Auto-incrementing document numbering system
// Format: PREFIX-YYYY-NNNN (e.g., FAC-2026-0001)
// ────────────────────────────────────────────────────────────────

import { type DocKind, DOC_PREFIXES } from './docTypes';

/**
 * Generate the next document number based on existing numbers.
 * @param kind - Document type
 * @param existingNumbers - Array of existing document numbers of this type
 * @returns The next sequential number in format PREFIX-YYYY-NNNN
 */
export function generateNextNumber(kind: DocKind, existingNumbers: string[]): string {
  const prefix = DOC_PREFIXES[kind];
  const year = new Date().getFullYear();
  const yearStr = String(year);
  const fullPrefix = `${prefix}-${yearStr}-`;

  // Find the highest number for this year
  let maxNum = 0;
  for (const num of existingNumbers) {
    if (num.startsWith(fullPrefix)) {
      const suffix = num.slice(fullPrefix.length);
      const parsed = parseInt(suffix, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
    // Also support old format: PREFIX-NNNN
    const oldPrefix = `${prefix}-`;
    if (num.startsWith(oldPrefix) && !num.includes(yearStr)) {
      const suffix = num.slice(oldPrefix.length);
      const parsed = parseInt(suffix, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }

  const nextNum = String(maxNum + 1).padStart(4, '0');
  return `${fullPrefix}${nextNum}`;
}

/**
 * Parse a document number to extract parts
 */
export function parseDocNumber(number: string): {
  prefix: string;
  year?: string;
  sequence: number;
} | null {
  // Try format: PREFIX-YYYY-NNNN
  const fullMatch = number.match(/^([A-Z]+)-(\d{4})-(\d+)$/);
  if (fullMatch) {
    return {
      prefix: fullMatch[1],
      year: fullMatch[2],
      sequence: parseInt(fullMatch[3], 10),
    };
  }

  // Try format: PREFIX-NNNN
  const shortMatch = number.match(/^([A-Z]+)-(\d+)$/);
  if (shortMatch) {
    return {
      prefix: shortMatch[1],
      sequence: parseInt(shortMatch[2], 10),
    };
  }

  return null;
}
