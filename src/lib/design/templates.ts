// src/lib/design/templates.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — PDF Template Configurations
// Classic & Modern template styles for document generation
// ────────────────────────────────────────────────────────────────

import { GOV_COLORS, TEMPLATE_COLORS } from './colors';
import { FONT_FAMILIES, FONT_BY_LANGUAGE, type FontLanguage } from './fonts';
import { FONT_SIZES, LINE_HEIGHTS, DOC_TEXT_STYLES } from './typography';

// ── Template Types ─────────────────────────────────────────────

export type TemplateId = 'classic' | 'modern';

export interface TemplateHeader {
  /** Header background color */
  backgroundColor: string;
  /** Header text color */
  textColor: string;
  /** Header padding (pt) */
  padding: { top: number; right: number; bottom: number; left: number };
  /** Border bottom style */
  borderBottom?: { width: number; color: string; style: 'solid' | 'dashed' };
  /** Logo position */
  logoPosition: 'left' | 'right' | 'center';
  /** Logo max height (pt) */
  logoMaxHeight: number;
}

export interface TemplateTable {
  /** Table header background */
  headerBg: string;
  /** Table header text color */
  headerText: string;
  /** Table border color */
  borderColor: string;
  /** Table border width (pt) */
  borderWidth: number;
  /** Cell padding (pt) */
  cellPadding: { vertical: number; horizontal: number };
  /** Alternate row background */
  stripeBg: string;
  /** Use striped rows */
  striped: boolean;
  /** Header font weight */
  headerFontWeight: number;
}

export interface TemplateTypography {
  /** Title style */
  title: {
    fontSize: number;
    fontWeight: number;
    color: string;
    textTransform?: 'uppercase' | 'capitalize' | 'none';
  };
  /** Subtitle style */
  subtitle: {
    fontSize: number;
    fontWeight: number;
    color: string;
  };
  /** Section header style */
  sectionHeader: {
    fontSize: number;
    fontWeight: number;
    color: string;
    borderBottom?: { width: number; color: string };
  };
  /** Body text style */
  body: {
    fontSize: number;
    fontWeight: number;
    color: string;
    lineHeight: number;
  };
  /** Small text style */
  small: {
    fontSize: number;
    fontWeight: number;
    color: string;
  };
  /** Number/currency style */
  number: {
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
  };
}

export interface TemplateLayout {
  /** Page margins (mm) */
  pageMargins: { top: number; right: number; bottom: number; left: number };
  /** Section spacing (pt) */
  sectionSpacing: number;
  /** Card/box styling */
  card: {
    backgroundColor: string;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
    padding: number;
    shadow?: boolean;
  };
  /** Info grid columns */
  infoGridColumns: 2 | 3;
}

export interface TemplateFooter {
  /** Footer background color */
  backgroundColor: string;
  /** Footer text color */
  textColor: string;
  /** Footer padding (pt) */
  padding: { top: number; bottom: number };
  /** Show page numbers */
  showPageNumbers: boolean;
  /** Footer border top */
  borderTop?: { width: number; color: string };
}

export interface TemplateTotals {
  /** Totals section background */
  backgroundColor: string;
  /** Totals border */
  borderColor: string;
  /** Grand total row style */
  grandTotal: {
    backgroundColor: string;
    textColor: string;
    fontWeight: number;
    fontSize: number;
  };
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  nameAr: string;
  description: string;
  /** Header configuration */
  header: TemplateHeader;
  /** Table configuration */
  table: TemplateTable;
  /** Typography configuration */
  typography: TemplateTypography;
  /** Layout configuration */
  layout: TemplateLayout;
  /** Footer configuration */
  footer: TemplateFooter;
  /** Totals section configuration */
  totals: TemplateTotals;
  /** Accent color for highlights */
  accentColor: string;
  /** Primary brand color */
  primaryColor: string;
}

// ── Classic Template ───────────────────────────────────────────

export const CLASSIC_TEMPLATE: TemplateConfig = {
  id: 'classic',
  name: 'Classic',
  nameAr: 'كلاسيكي',
  description: 'Clean and minimal. Traditional government document style.',

  header: {
    backgroundColor: GOV_COLORS.primary[500],
    textColor: '#ffffff',
    padding: { top: 16, right: 20, bottom: 16, left: 20 },
    borderBottom: { width: 3, color: GOV_COLORS.primary[700], style: 'solid' },
    logoPosition: 'left',
    logoMaxHeight: 50,
  },

  table: {
    headerBg: GOV_COLORS.neutral[100],
    headerText: GOV_COLORS.neutral[900],
    borderColor: GOV_COLORS.neutral[300],
    borderWidth: 1,
    cellPadding: { vertical: 8, horizontal: 10 },
    stripeBg: GOV_COLORS.neutral[50],
    striped: true,
    headerFontWeight: 600,
  },

  typography: {
    title: {
      fontSize: FONT_SIZES['2xl'].pt,
      fontWeight: 700,
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    subtitle: {
      fontSize: FONT_SIZES.lg.pt,
      fontWeight: 600,
      color: GOV_COLORS.neutral[700],
    },
    sectionHeader: {
      fontSize: FONT_SIZES.base.pt,
      fontWeight: 600,
      color: GOV_COLORS.neutral[800],
      borderBottom: { width: 1, color: GOV_COLORS.neutral[200] },
    },
    body: {
      fontSize: FONT_SIZES.sm.pt,
      fontWeight: 400,
      color: GOV_COLORS.document.textPrimary,
      lineHeight: LINE_HEIGHTS.normal,
    },
    small: {
      fontSize: FONT_SIZES.xs.pt,
      fontWeight: 400,
      color: GOV_COLORS.document.textSecondary,
    },
    number: {
      fontSize: FONT_SIZES.sm.pt,
      fontWeight: 500,
      fontFamily: FONT_FAMILIES.mono.family,
    },
  },

  layout: {
    pageMargins: { top: 15, right: 15, bottom: 20, left: 15 },
    sectionSpacing: 16,
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 6,
      borderColor: GOV_COLORS.neutral[200],
      borderWidth: 1,
      padding: 12,
      shadow: false,
    },
    infoGridColumns: 2,
  },

  footer: {
    backgroundColor: 'transparent',
    textColor: GOV_COLORS.document.textMuted,
    padding: { top: 12, bottom: 8 },
    showPageNumbers: true,
    borderTop: { width: 1, color: GOV_COLORS.neutral[200] },
  },

  totals: {
    backgroundColor: '#ffffff',
    borderColor: GOV_COLORS.neutral[200],
    grandTotal: {
      backgroundColor: GOV_COLORS.primary[500],
      textColor: '#ffffff',
      fontWeight: 700,
      fontSize: FONT_SIZES.md.pt,
    },
  },

  accentColor: GOV_COLORS.primary[500],
  primaryColor: GOV_COLORS.primary[500],
};

// ── Modern Template ────────────────────────────────────────────

export const MODERN_TEMPLATE: TemplateConfig = {
  id: 'modern',
  name: 'Modern',
  nameAr: 'عصري',
  description: 'Bold header, modern look. Great for branding.',

  header: {
    backgroundColor: GOV_COLORS.document.headerDark,
    textColor: '#ffffff',
    padding: { top: 20, right: 24, bottom: 20, left: 24 },
    logoPosition: 'right',
    logoMaxHeight: 60,
  },

  table: {
    headerBg: '#1e293b', // slate-800
    headerText: '#ffffff',
    borderColor: '#e2e8f0', // slate-200
    borderWidth: 1,
    cellPadding: { vertical: 10, horizontal: 12 },
    stripeBg: '#f8fafc', // slate-50
    striped: true,
    headerFontWeight: 600,
  },

  typography: {
    title: {
      fontSize: FONT_SIZES['3xl'].pt,
      fontWeight: 700,
      color: '#ffffff',
      textTransform: 'none',
    },
    subtitle: {
      fontSize: FONT_SIZES.xl.pt,
      fontWeight: 500,
      color: '#64748b', // slate-500
    },
    sectionHeader: {
      fontSize: FONT_SIZES.md.pt,
      fontWeight: 600,
      color: '#1e293b', // slate-800
    },
    body: {
      fontSize: FONT_SIZES.sm.pt,
      fontWeight: 400,
      color: '#334155', // slate-700
      lineHeight: LINE_HEIGHTS.relaxed,
    },
    small: {
      fontSize: FONT_SIZES.xs.pt,
      fontWeight: 400,
      color: '#94a3b8', // slate-400
    },
    number: {
      fontSize: FONT_SIZES.sm.pt,
      fontWeight: 500,
      fontFamily: FONT_FAMILIES.mono.family,
    },
  },

  layout: {
    pageMargins: { top: 12, right: 12, bottom: 16, left: 12 },
    sectionSpacing: 20,
    card: {
      backgroundColor: '#f8fafc', // slate-50
      borderRadius: 12,
      borderColor: '#e2e8f0', // slate-200
      borderWidth: 1,
      padding: 16,
      shadow: true,
    },
    infoGridColumns: 2,
  },

  footer: {
    backgroundColor: '#f8fafc',
    textColor: '#64748b',
    padding: { top: 16, bottom: 12 },
    showPageNumbers: true,
  },

  totals: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    grandTotal: {
      backgroundColor: '#1e293b',
      textColor: '#ffffff',
      fontWeight: 700,
      fontSize: FONT_SIZES.lg.pt,
    },
  },

  accentColor: '#3b82f6', // blue-500
  primaryColor: '#1e293b', // slate-800
};

// ── Template Registry ──────────────────────────────────────────

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  classic: CLASSIC_TEMPLATE,
  modern: MODERN_TEMPLATE,
};

export const TEMPLATE_LIST: TemplateConfig[] = [
  CLASSIC_TEMPLATE,
  MODERN_TEMPLATE,
];

/**
 * Get template configuration by ID
 */
export function getTemplateConfig(templateId: TemplateId): TemplateConfig {
  return TEMPLATES[templateId] ?? TEMPLATES.classic;
}

/**
 * Normalize template ID
 */
export function normalizeTemplateId(value: unknown): TemplateId {
  if (value === 'modern') return 'modern';
  return 'classic';
}

// ── Template CSS Generation ────────────────────────────────────

/**
 * Generate CSS variables for a template
 */
export function getTemplateCSSVars(template: TemplateConfig): string {
  return `
    --template-header-bg: ${template.header.backgroundColor};
    --template-header-text: ${template.header.textColor};
    --template-accent: ${template.accentColor};
    --template-primary: ${template.primaryColor};
    --template-table-header-bg: ${template.table.headerBg};
    --template-table-header-text: ${template.table.headerText};
    --template-table-border: ${template.table.borderColor};
    --template-table-stripe: ${template.table.stripeBg};
    --template-card-bg: ${template.layout.card.backgroundColor};
    --template-card-border: ${template.layout.card.borderColor};
    --template-totals-bg: ${template.totals.backgroundColor};
    --template-grand-total-bg: ${template.totals.grandTotal.backgroundColor};
    --template-grand-total-text: ${template.totals.grandTotal.textColor};
  `;
}

/**
 * Get template styles for language direction
 */
export function getTemplateStyles(
  templateId: TemplateId,
  language: FontLanguage
): {
  template: TemplateConfig;
  fontFamily: string;
  direction: 'rtl' | 'ltr';
  textAlign: 'right' | 'left';
} {
  const template = getTemplateConfig(templateId);
  const isRtl = language === 'ar';

  return {
    template,
    fontFamily: FONT_BY_LANGUAGE[language],
    direction: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
  };
}

// ── Template Style Helpers ─────────────────────────────────────

/**
 * Get header styles for a template
 */
export function getTemplateHeaderStyles(template: TemplateConfig) {
  const { header, typography } = template;
  return {
    backgroundColor: header.backgroundColor,
    color: header.textColor,
    paddingTop: header.padding.top,
    paddingRight: header.padding.right,
    paddingBottom: header.padding.bottom,
    paddingLeft: header.padding.left,
    borderBottom: header.borderBottom
      ? `${header.borderBottom.width}pt ${header.borderBottom.style} ${header.borderBottom.color}`
      : 'none',
  };
}

/**
 * Get table styles for a template
 */
export function getTemplateTableStyles(template: TemplateConfig) {
  const { table } = template;
  return {
    header: {
      backgroundColor: table.headerBg,
      color: table.headerText,
      fontWeight: table.headerFontWeight,
      paddingVertical: table.cellPadding.vertical,
      paddingHorizontal: table.cellPadding.horizontal,
    },
    cell: {
      paddingVertical: table.cellPadding.vertical,
      paddingHorizontal: table.cellPadding.horizontal,
      borderColor: table.borderColor,
      borderWidth: table.borderWidth,
    },
    stripe: {
      backgroundColor: table.striped ? table.stripeBg : 'transparent',
    },
  };
}

/**
 * Get totals section styles
 */
export function getTemplateTotalsStyles(template: TemplateConfig) {
  const { totals, typography } = template;
  return {
    container: {
      backgroundColor: totals.backgroundColor,
      borderColor: totals.borderColor,
    },
    row: {
      fontSize: typography.body.fontSize,
      color: typography.body.color,
    },
    grandTotal: {
      backgroundColor: totals.grandTotal.backgroundColor,
      color: totals.grandTotal.textColor,
      fontWeight: totals.grandTotal.fontWeight,
      fontSize: totals.grandTotal.fontSize,
    },
  };
}

/**
 * Get card/box styles for a template
 */
export function getTemplateCardStyles(template: TemplateConfig) {
  const { layout } = template;
  return {
    backgroundColor: layout.card.backgroundColor,
    borderRadius: layout.card.borderRadius,
    borderColor: layout.card.borderColor,
    borderWidth: layout.card.borderWidth,
    padding: layout.card.padding,
    boxShadow: layout.card.shadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  };
}
