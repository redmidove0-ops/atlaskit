// src/lib/design/pdf-utils.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — PDF Generation Utilities
// Helper functions for PDF document generation
// ────────────────────────────────────────────────────────────────

import {
  type TemplateId,
  type TemplateConfig,
  getTemplateConfig,
  FONT_FAMILIES,
  FONT_BY_LANGUAGE,
  type FontLanguage,
} from './index';

// ── PDF Page Configuration ─────────────────────────────────────

export interface PDFPageConfig {
  /** Page format */
  format: 'A4' | 'LETTER';
  /** Page orientation */
  orientation: 'portrait' | 'landscape';
  /** Page margins in mm */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Page dimensions in points (72 dpi) */
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * A4 page configuration (portrait)
 */
export const PDF_A4_PORTRAIT: PDFPageConfig = {
  format: 'A4',
  orientation: 'portrait',
  margins: { top: 15, right: 15, bottom: 20, left: 15 },
  dimensions: {
    width: 595.28, // 210mm in points
    height: 841.89, // 297mm in points
  },
};

/**
 * A4 page configuration (landscape)
 */
export const PDF_A4_LANDSCAPE: PDFPageConfig = {
  format: 'A4',
  orientation: 'landscape',
  margins: { top: 15, right: 20, bottom: 15, left: 20 },
  dimensions: {
    width: 841.89,
    height: 595.28,
  },
};

/**
 * Convert millimeters to points (72 dpi)
 */
export function mmToPt(mm: number): number {
  return mm * 2.83465;
}

/**
 * Convert points to millimeters
 */
export function ptToMm(pt: number): number {
  return pt / 2.83465;
}

/**
 * Convert pixels to points (96 dpi screen to 72 dpi PDF)
 */
export function pxToPt(px: number): number {
  return px * 0.75;
}

/**
 * Convert points to pixels
 */
export function ptToPx(pt: number): number {
  return pt / 0.75;
}

// ── Font Loading for PDF ───────────────────────────────────────

/**
 * Font file URLs for PDF rendering
 * These are Google Fonts static file URLs
 */
export const PDF_FONT_FILES = {
  cairo: {
    regular: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1Q.woff2',
    medium: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hNI-W1Q.woff2',
    semibold: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hD45W1Q.woff2',
    bold: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5W1Q.woff2',
  },
  amiri: {
    regular: 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHpUrtLMA7w.woff2',
    bold: 'https://fonts.gstatic.com/s/amiri/v27/J7acnpd8CGxBHp2VkZY4xJ9CGyAa.woff2',
  },
  roboto: {
    light: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmSU5fBBc4AMP6lQ.woff2',
    regular: 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
    medium: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
    bold: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2',
  },
  jetbrainsMono: {
    regular: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO8.woff2',
    medium: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO-LuQ.woff2',
  },
} as const;

/**
 * Get font configuration for PDF generation
 */
export function getPDFFontConfig(language: FontLanguage) {
  const isArabic = language === 'ar';
  
  return {
    primary: isArabic ? PDF_FONT_FILES.cairo : PDF_FONT_FILES.roboto,
    serif: isArabic ? PDF_FONT_FILES.amiri : PDF_FONT_FILES.roboto,
    mono: PDF_FONT_FILES.jetbrainsMono,
    family: FONT_BY_LANGUAGE[language],
    monoFamily: FONT_FAMILIES.mono.family,
  };
}

// ── Document Layout Utilities ──────────────────────────────────

export interface DocumentLayoutConfig {
  /** Text direction */
  direction: 'rtl' | 'ltr';
  /** Primary text alignment */
  textAlign: 'right' | 'left';
  /** Font family */
  fontFamily: string;
  /** Number alignment (always ltr) */
  numberAlign: 'right' | 'left';
  /** Table first column position */
  tableStart: 'right' | 'left';
}

/**
 * Get document layout configuration for a language
 */
export function getDocumentLayoutConfig(language: FontLanguage): DocumentLayoutConfig {
  const isRtl = language === 'ar';
  
  return {
    direction: isRtl ? 'rtl' : 'ltr',
    textAlign: isRtl ? 'right' : 'left',
    fontFamily: FONT_BY_LANGUAGE[language],
    numberAlign: 'right', // Numbers always align right
    tableStart: isRtl ? 'right' : 'left',
  };
}

/**
 * Get CSS styles for PDF document
 */
export function getPDFDocumentStyles(
  templateId: TemplateId,
  language: FontLanguage
): string {
  const template = getTemplateConfig(templateId);
  const layout = getDocumentLayoutConfig(language);
  
  return `
    @page {
      size: A4;
      margin: ${template.layout.pageMargins.top}mm ${template.layout.pageMargins.right}mm ${template.layout.pageMargins.bottom}mm ${template.layout.pageMargins.left}mm;
    }
    
    body {
      direction: ${layout.direction};
      text-align: ${layout.textAlign};
      font-family: ${layout.fontFamily};
      font-size: ${template.typography.body.fontSize}pt;
      line-height: ${template.typography.body.lineHeight};
      color: ${template.typography.body.color};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .doc-header {
      background-color: ${template.header.backgroundColor};
      color: ${template.header.textColor};
      padding: ${template.header.padding.top}pt ${template.header.padding.right}pt ${template.header.padding.bottom}pt ${template.header.padding.left}pt;
    }
    
    .doc-title {
      font-size: ${template.typography.title.fontSize}pt;
      font-weight: ${template.typography.title.fontWeight};
      text-transform: ${template.typography.title.textTransform || 'none'};
    }
    
    .doc-table th {
      background-color: ${template.table.headerBg};
      color: ${template.table.headerText};
      font-weight: ${template.table.headerFontWeight};
      padding: ${template.table.cellPadding.vertical}pt ${template.table.cellPadding.horizontal}pt;
    }
    
    .doc-table td {
      padding: ${template.table.cellPadding.vertical}pt ${template.table.cellPadding.horizontal}pt;
      border-color: ${template.table.borderColor};
    }
    
    .doc-table tr:nth-child(even) {
      background-color: ${template.table.striped ? template.table.stripeBg : 'transparent'};
    }
    
    .doc-total-grand {
      background-color: ${template.totals.grandTotal.backgroundColor};
      color: ${template.totals.grandTotal.textColor};
      font-size: ${template.totals.grandTotal.fontSize}pt;
      font-weight: ${template.totals.grandTotal.fontWeight};
    }
    
    .num-cell {
      direction: ltr;
      text-align: ${layout.numberAlign};
      font-family: ${FONT_FAMILIES.mono.family};
      font-variant-numeric: tabular-nums;
    }
  `;
}

// ── Print Helpers ──────────────────────────────────────────────

/**
 * Generate print-friendly HTML wrapper
 */
export function wrapForPrint(content: string, options: {
  templateId: TemplateId;
  language: FontLanguage;
  title?: string;
}): string {
  const { templateId, language, title = 'Document' } = options;
  const styles = getPDFDocumentStyles(templateId, language);
  const layout = getDocumentLayoutConfig(language);
  
  return `
    <!DOCTYPE html>
    <html lang="${language}" dir="${layout.direction}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Amiri:wght@400;700&family=Roboto:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ${styles}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

/**
 * Trigger browser print dialog
 */
export function triggerPrint(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Check if browser supports printing
 */
export function canPrint(): boolean {
  return typeof window !== 'undefined' && typeof window.print === 'function';
}

// ── Export Helper ──────────────────────────────────────────────

export interface ExportOptions {
  templateId: TemplateId;
  language: FontLanguage;
  filename?: string;
  format?: 'pdf' | 'print';
}

/**
 * Get filename with proper format
 */
export function getExportFilename(
  docNumber: string,
  docType: string,
  options: { language: FontLanguage; extension?: string }
): string {
  const { language, extension = 'pdf' } = options;
  const cleanNumber = docNumber.replace(/[/\\?%*:|"<>]/g, '-');
  const typeLabel = language === 'ar' 
    ? (docType === 'devis' ? 'عرض_أسعار' : 'فاتورة')
    : (docType === 'devis' ? 'Devis' : 'Facture');
  
  return `${typeLabel}_${cleanNumber}.${extension}`;
}
