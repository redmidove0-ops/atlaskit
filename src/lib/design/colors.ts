// src/lib/design/colors.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Color Palette
// Matches Algerian government document styling
// ────────────────────────────────────────────────────────────────

/**
 * Algerian Government Document Colors
 * Based on official document styling conventions
 */
export const GOV_COLORS = {
  // Primary - Deep Green (Algerian flag green)
  primary: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#006233',  // Official Algerian green
    600: '#005a2e',
    700: '#004d27',
    800: '#003d1f',
    900: '#002d17',
  },

  // Secondary - Deep Red (Algerian flag red)
  secondary: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#d21034',  // Official Algerian red
    600: '#c62828',
    700: '#b71c1c',
    800: '#8e1318',
    900: '#6d0f12',
  },

  // Neutral - Document grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0a0a0a',
  },

  // Document-specific colors
  document: {
    // Background for official documents
    paper: '#ffffff',
    paperAlt: '#fefdfb',  // Slight warm tint
    
    // Header backgrounds
    headerDark: '#1a1a2e',    // Dark blue-black
    headerGreen: '#006233',   // Algerian green
    headerRed: '#d21034',     // Algerian red
    
    // Table styling
    tableHeader: '#f8f9fa',
    tableHeaderAlt: '#e9ecef',
    tableBorder: '#dee2e6',
    tableStripe: '#f8f9fa',
    
    // Text colors
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
    
    // Accent colors for highlights
    accent: '#0d6efd',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#0dcaf0',
  },
} as const;

/**
 * Document template color schemes
 */
export const TEMPLATE_COLORS = {
  // Classic - Traditional government style
  classic: {
    headerBg: GOV_COLORS.primary[500],
    headerText: '#ffffff',
    accentColor: GOV_COLORS.primary[500],
    tableBorder: GOV_COLORS.neutral[300],
    tableHeader: GOV_COLORS.neutral[100],
  },

  // Modern - Clean, professional
  modern: {
    headerBg: GOV_COLORS.document.headerDark,
    headerText: '#ffffff',
    accentColor: '#3b82f6',  // Blue
    tableBorder: GOV_COLORS.neutral[200],
    tableHeader: '#f1f5f9',
  },

  // Minimal - Simple, light
  minimal: {
    headerBg: '#ffffff',
    headerText: GOV_COLORS.neutral[900],
    accentColor: GOV_COLORS.neutral[700],
    tableBorder: GOV_COLORS.neutral[200],
    tableHeader: '#ffffff',
  },

  // Bold - Strong colors
  bold: {
    headerBg: GOV_COLORS.secondary[500],
    headerText: '#ffffff',
    accentColor: GOV_COLORS.secondary[500],
    tableBorder: GOV_COLORS.secondary[200],
    tableHeader: GOV_COLORS.secondary[50],
  },

  // Elegant - Refined, subtle
  elegant: {
    headerBg: '#1e293b',  // Slate
    headerText: '#f8fafc',
    accentColor: '#a78bfa',  // Purple
    tableBorder: '#e2e8f0',
    tableHeader: '#f8fafc',
  },

  // Corporate - Business professional
  corporate: {
    headerBg: '#0f172a',  // Dark slate
    headerText: '#ffffff',
    accentColor: '#0ea5e9',  // Sky blue
    tableBorder: '#cbd5e1',
    tableHeader: '#f1f5f9',
  },
} as const;

export type TemplateColorScheme = keyof typeof TEMPLATE_COLORS;

/**
 * Get color scheme for a template
 */
export function getTemplateColors(template: TemplateColorScheme) {
  return TEMPLATE_COLORS[template] ?? TEMPLATE_COLORS.modern;
}

/**
 * Document status colors
 */
export const STATUS_COLORS = {
  draft: {
    bg: '#f3f4f6',
    text: '#6b7280',
    border: '#d1d5db',
  },
  sent: {
    bg: '#dbeafe',
    text: '#1d4ed8',
    border: '#93c5fd',
  },
  paid: {
    bg: '#d1fae5',
    text: '#047857',
    border: '#6ee7b7',
  },
  partial: {
    bg: '#fef3c7',
    text: '#b45309',
    border: '#fcd34d',
  },
  overdue: {
    bg: '#fee2e2',
    text: '#b91c1c',
    border: '#fca5a5',
  },
  cancelled: {
    bg: '#f3f4f6',
    text: '#9ca3af',
    border: '#e5e7eb',
  },
  delivered: {
    bg: '#d1fae5',
    text: '#047857',
    border: '#6ee7b7',
  },
} as const;

/**
 * CSS custom properties for colors
 */
export const COLOR_CSS_VARS = `
  /* Algerian Government Colors */
  --color-gov-green: ${GOV_COLORS.primary[500]};
  --color-gov-green-dark: ${GOV_COLORS.primary[700]};
  --color-gov-green-light: ${GOV_COLORS.primary[100]};
  --color-gov-red: ${GOV_COLORS.secondary[500]};
  --color-gov-red-dark: ${GOV_COLORS.secondary[700]};
  --color-gov-red-light: ${GOV_COLORS.secondary[100]};
  
  /* Document Colors */
  --color-doc-paper: ${GOV_COLORS.document.paper};
  --color-doc-header: ${GOV_COLORS.document.headerDark};
  --color-doc-text: ${GOV_COLORS.document.textPrimary};
  --color-doc-text-secondary: ${GOV_COLORS.document.textSecondary};
  --color-doc-text-muted: ${GOV_COLORS.document.textMuted};
  --color-doc-border: ${GOV_COLORS.document.tableBorder};
  --color-doc-table-header: ${GOV_COLORS.document.tableHeader};
  --color-doc-table-stripe: ${GOV_COLORS.document.tableStripe};
`;
