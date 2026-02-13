// src/lib/design/index.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Design System Index
// Unified export point for fonts, colors, typography, and RTL
// ────────────────────────────────────────────────────────────────

// ── Fonts ──────────────────────────────────────────────────────
export {
  FONT_FAMILIES,
  FONT_BY_LANGUAGE,
  SERIF_BY_LANGUAGE,
  GOOGLE_FONTS_URL,
  PDF_FONT_URLS,
  getFontFamily,
  type FontLanguage,
} from './fonts';

// ── Colors ─────────────────────────────────────────────────────
export {
  GOV_COLORS,
  TEMPLATE_COLORS,
  STATUS_COLORS,
  COLOR_CSS_VARS,
  getTemplateColors,
  type TemplateColorScheme,
} from './colors';

// ── Typography ─────────────────────────────────────────────────
export {
  FONT_SIZES,
  LINE_HEIGHTS,
  LETTER_SPACING,
  DOC_TEXT_STYLES,
  TYPOGRAPHY_CSS,
  getTextStyle,
  getTextAlign,
  TEXT_ALIGN,
  type DocTextStyle,
} from './typography';

// ── RTL/LTR ────────────────────────────────────────────────────
export {
  DIRECTION_BY_LANGUAGE,
  DIRECTION_CLASSES,
  RTL_CSS,
  getDirection,
  isRTL,
  getDirectionalStyles,
  getFlexDirection,
  getDocumentLayout,
  getDirectionClasses,
  getDirectionStyle,
  mirrorValue,
  type DirectionalStyles,
  type DocumentLayout,
} from './rtl';

// ── PDF Templates ──────────────────────────────────────────────
export {
  CLASSIC_TEMPLATE,
  MODERN_TEMPLATE,
  TEMPLATES,
  TEMPLATE_LIST,
  getTemplateConfig,
  normalizeTemplateId,
  getTemplateCSSVars,
  getTemplateStyles,
  getTemplateHeaderStyles,
  getTemplateTableStyles,
  getTemplateTotalsStyles,
  getTemplateCardStyles,
  type TemplateId,
  type TemplateConfig,
  type TemplateHeader,
  type TemplateTable,
  type TemplateTypography,
  type TemplateLayout,
  type TemplateFooter,
  type TemplateTotals,
} from './templates';

// ── PDF Utilities ──────────────────────────────────────────────
export {
  PDF_A4_PORTRAIT,
  PDF_A4_LANDSCAPE,
  PDF_FONT_FILES,
  mmToPt,
  ptToMm,
  pxToPt,
  ptToPx,
  getPDFFontConfig,
  getDocumentLayoutConfig,
  getPDFDocumentStyles,
  wrapForPrint,
  triggerPrint,
  canPrint,
  getExportFilename,
  type PDFPageConfig,
  type DocumentLayoutConfig,
  type ExportOptions,
} from './pdf-utils';

// ── Combined CSS for injection ─────────────────────────────────
import { COLOR_CSS_VARS } from './colors';
import { TYPOGRAPHY_CSS } from './typography';
import { RTL_CSS } from './rtl';

/**
 * All design system CSS variables and utilities combined
 */
export const DESIGN_SYSTEM_CSS = `
  :root {
    ${COLOR_CSS_VARS}
    ${TYPOGRAPHY_CSS}
  }
  
  ${RTL_CSS}
`;
