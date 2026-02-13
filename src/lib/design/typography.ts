// src/lib/design/typography.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Typography System
// Unified text styles for documents, UI, and PDF
// ────────────────────────────────────────────────────────────────

import { FONT_FAMILIES, FONT_BY_LANGUAGE, type FontLanguage } from './fonts';

/**
 * Font sizes (in pixels for screen, points for print)
 */
export const FONT_SIZES = {
  // Extra small
  xs: { px: 10, pt: 7.5, rem: '0.625rem' },
  // Small
  sm: { px: 12, pt: 9, rem: '0.75rem' },
  // Base
  base: { px: 14, pt: 10.5, rem: '0.875rem' },
  // Medium
  md: { px: 16, pt: 12, rem: '1rem' },
  // Large
  lg: { px: 18, pt: 13.5, rem: '1.125rem' },
  // Extra large
  xl: { px: 20, pt: 15, rem: '1.25rem' },
  // 2XL
  '2xl': { px: 24, pt: 18, rem: '1.5rem' },
  // 3XL
  '3xl': { px: 30, pt: 22.5, rem: '1.875rem' },
  // 4XL
  '4xl': { px: 36, pt: 27, rem: '2.25rem' },
  // 5XL
  '5xl': { px: 48, pt: 36, rem: '3rem' },
} as const;

/**
 * Line heights
 */
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

/**
 * Letter spacing
 */
export const LETTER_SPACING = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Text styles for documents
 */
export const DOC_TEXT_STYLES = {
  // Document title (فاتورة, عرض أسعار)
  title: {
    fontSize: FONT_SIZES['3xl'].pt,
    fontWeight: 700,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
  },
  
  // Document subtitle (رقم الفاتورة)
  subtitle: {
    fontSize: FONT_SIZES.xl.pt,
    fontWeight: 600,
    lineHeight: LINE_HEIGHTS.snug,
    letterSpacing: LETTER_SPACING.normal,
  },
  
  // Section header (معلومات البائع)
  sectionHeader: {
    fontSize: FONT_SIZES.lg.pt,
    fontWeight: 600,
    lineHeight: LINE_HEIGHTS.snug,
    letterSpacing: LETTER_SPACING.normal,
  },
  
  // Body text
  body: {
    fontSize: FONT_SIZES.base.pt,
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  
  // Small text (notes, footer)
  small: {
    fontSize: FONT_SIZES.sm.pt,
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  
  // Extra small (legal text, fine print)
  xs: {
    fontSize: FONT_SIZES.xs.pt,
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.relaxed,
    letterSpacing: LETTER_SPACING.wide,
  },
  
  // Table header
  tableHeader: {
    fontSize: FONT_SIZES.sm.pt,
    fontWeight: 600,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
  },
  
  // Table cell
  tableCell: {
    fontSize: FONT_SIZES.sm.pt,
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.snug,
    letterSpacing: LETTER_SPACING.normal,
  },
  
  // Numbers (prices, totals)
  number: {
    fontSize: FONT_SIZES.base.pt,
    fontWeight: 500,
    lineHeight: LINE_HEIGHTS.none,
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONT_FAMILIES.roboto.family,
  },
  
  // Large numbers (total amount)
  numberLarge: {
    fontSize: FONT_SIZES.xl.pt,
    fontWeight: 700,
    lineHeight: LINE_HEIGHTS.none,
    letterSpacing: LETTER_SPACING.tight,
    fontFamily: FONT_FAMILIES.roboto.family,
  },
  
  // Tafqit (amount in words)
  tafqit: {
    fontSize: FONT_SIZES.sm.pt,
    fontWeight: 500,
    lineHeight: LINE_HEIGHTS.normal,
    fontStyle: 'italic',
  },
  
  // Label (form labels)
  label: {
    fontSize: FONT_SIZES.xs.pt,
    fontWeight: 500,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
    textTransform: 'uppercase' as const,
  },
} as const;

export type DocTextStyle = keyof typeof DOC_TEXT_STYLES;

/**
 * Get text style with language-appropriate font
 */
export function getTextStyle(style: DocTextStyle, language: FontLanguage = 'ar') {
  const baseStyle = DOC_TEXT_STYLES[style];
  const fontFamily = FONT_BY_LANGUAGE[language];
  
  // Check if baseStyle has fontFamily property
  const styleFontFamily = 'fontFamily' in baseStyle 
    ? (baseStyle as { fontFamily: string }).fontFamily 
    : undefined;
  
  return {
    ...baseStyle,
    fontFamily: styleFontFamily ?? fontFamily,
  };
}

/**
 * Direction-aware text alignment
 */
export const TEXT_ALIGN = {
  start: { ar: 'right', fr: 'left', en: 'left' },
  end: { ar: 'left', fr: 'right', en: 'right' },
  center: { ar: 'center', fr: 'center', en: 'center' },
} as const;

/**
 * Get text alignment for language
 */
export function getTextAlign(
  align: keyof typeof TEXT_ALIGN,
  language: FontLanguage
): 'left' | 'right' | 'center' {
  return TEXT_ALIGN[align][language];
}

/**
 * CSS for typography (to inject in globals.css or document styles)
 */
export const TYPOGRAPHY_CSS = `
  /* Typography Scale */
  --font-size-xs: ${FONT_SIZES.xs.rem};
  --font-size-sm: ${FONT_SIZES.sm.rem};
  --font-size-base: ${FONT_SIZES.base.rem};
  --font-size-md: ${FONT_SIZES.md.rem};
  --font-size-lg: ${FONT_SIZES.lg.rem};
  --font-size-xl: ${FONT_SIZES.xl.rem};
  --font-size-2xl: ${FONT_SIZES['2xl'].rem};
  --font-size-3xl: ${FONT_SIZES['3xl'].rem};
  --font-size-4xl: ${FONT_SIZES['4xl'].rem};
  --font-size-5xl: ${FONT_SIZES['5xl'].rem};
  
  /* Line Heights */
  --line-height-none: ${LINE_HEIGHTS.none};
  --line-height-tight: ${LINE_HEIGHTS.tight};
  --line-height-snug: ${LINE_HEIGHTS.snug};
  --line-height-normal: ${LINE_HEIGHTS.normal};
  --line-height-relaxed: ${LINE_HEIGHTS.relaxed};
  --line-height-loose: ${LINE_HEIGHTS.loose};
  
  /* Font Families */
  --font-arabic: ${FONT_FAMILIES.cairo.family};
  --font-arabic-serif: ${FONT_FAMILIES.amiri.family};
  --font-latin: ${FONT_FAMILIES.roboto.family};
  --font-mono: ${FONT_FAMILIES.mono.family};
`;
