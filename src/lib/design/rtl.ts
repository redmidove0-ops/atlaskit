// src/lib/design/rtl.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — RTL/LTR Direction System
// Unified direction handling for documents and UI
// ────────────────────────────────────────────────────────────────

import { FONT_BY_LANGUAGE, type FontLanguage } from './fonts';

/**
 * Text direction by language
 */
export const DIRECTION_BY_LANGUAGE: Record<FontLanguage, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
};

/**
 * Get direction for a language
 */
export function getDirection(language: FontLanguage): 'rtl' | 'ltr' {
  return DIRECTION_BY_LANGUAGE[language];
}

/**
 * Check if language is RTL
 */
export function isRTL(language: FontLanguage): boolean {
  return DIRECTION_BY_LANGUAGE[language] === 'rtl';
}

/**
 * Direction-aware CSS properties
 * Maps logical properties to physical properties based on direction
 */
export interface DirectionalStyles {
  // Logical to physical mapping
  marginInlineStart: 'marginLeft' | 'marginRight';
  marginInlineEnd: 'marginLeft' | 'marginRight';
  paddingInlineStart: 'paddingLeft' | 'paddingRight';
  paddingInlineEnd: 'paddingLeft' | 'paddingRight';
  borderInlineStart: 'borderLeft' | 'borderRight';
  borderInlineEnd: 'borderLeft' | 'borderRight';
  insetInlineStart: 'left' | 'right';
  insetInlineEnd: 'left' | 'right';
  textAlign: 'left' | 'right';
}

/**
 * Get directional style mappings for a language
 */
export function getDirectionalStyles(language: FontLanguage): DirectionalStyles {
  const isRtl = isRTL(language);

  return {
    marginInlineStart: isRtl ? 'marginRight' : 'marginLeft',
    marginInlineEnd: isRtl ? 'marginLeft' : 'marginRight',
    paddingInlineStart: isRtl ? 'paddingRight' : 'paddingLeft',
    paddingInlineEnd: isRtl ? 'paddingLeft' : 'paddingRight',
    borderInlineStart: isRtl ? 'borderRight' : 'borderLeft',
    borderInlineEnd: isRtl ? 'borderLeft' : 'borderRight',
    insetInlineStart: isRtl ? 'right' : 'left',
    insetInlineEnd: isRtl ? 'left' : 'right',
    textAlign: isRtl ? 'right' : 'left',
  };
}

/**
 * Flex direction for row based on RTL
 */
export function getFlexDirection(language: FontLanguage, reverse = false): 'row' | 'row-reverse' {
  const isRtl = isRTL(language);
  if (reverse) {
    return isRtl ? 'row' : 'row-reverse';
  }
  return isRtl ? 'row-reverse' : 'row';
}

/**
 * Document layout configuration
 */
export interface DocumentLayout {
  direction: 'rtl' | 'ltr';
  fontFamily: string;
  textAlign: 'left' | 'right';
  /**
   * For flex containers:
   * - RTL: items flow right-to-left
   * - LTR: items flow left-to-right
   */
  flexDirection: 'row' | 'row-reverse';
  /**
   * For tables:
   * - RTL: first column is on the right
   * - LTR: first column is on the left
   */
  tableDirection: 'rtl' | 'ltr';
}

/**
 * Get complete layout configuration for a language
 */
export function getDocumentLayout(language: FontLanguage): DocumentLayout {
  const isRtl = isRTL(language);

  return {
    direction: isRtl ? 'rtl' : 'ltr',
    fontFamily: FONT_BY_LANGUAGE[language],
    textAlign: isRtl ? 'right' : 'left',
    flexDirection: isRtl ? 'row-reverse' : 'row',
    tableDirection: isRtl ? 'rtl' : 'ltr',
  };
}

/**
 * Mirror a value for RTL (e.g., transform: rotate)
 */
export function mirrorValue(value: number, language: FontLanguage): number {
  return isRTL(language) ? -value : value;
}

/**
 * CSS classes for RTL/LTR
 */
export const DIRECTION_CLASSES = {
  rtl: {
    container: 'rtl-container',
    text: 'rtl-text',
    table: 'rtl-table',
  },
  ltr: {
    container: 'ltr-container',
    text: 'ltr-text',
    table: 'ltr-table',
  },
} as const;

/**
 * Get direction classes for a language
 */
export function getDirectionClasses(language: FontLanguage) {
  return isRTL(language) ? DIRECTION_CLASSES.rtl : DIRECTION_CLASSES.ltr;
}

/**
 * CSS for RTL/LTR support
 */
export const RTL_CSS = `
  /* RTL Container */
  .rtl-container,
  [dir="rtl"] {
    direction: rtl;
    text-align: right;
  }
  
  /* LTR Container */
  .ltr-container,
  [dir="ltr"] {
    direction: ltr;
    text-align: left;
  }
  
  /* RTL Text alignment */
  .rtl-text {
    text-align: right;
  }
  
  .ltr-text {
    text-align: left;
  }
  
  /* RTL Tables */
  .rtl-table {
    direction: rtl;
  }
  
  .rtl-table th,
  .rtl-table td {
    text-align: right;
  }
  
  .ltr-table {
    direction: ltr;
  }
  
  .ltr-table th,
  .ltr-table td {
    text-align: left;
  }
  
  /* Number cells always LTR (for proper digit ordering) */
  .num-cell {
    direction: ltr;
    text-align: right;
    unicode-bidi: isolate;
  }
  
  /* Bidirectional isolation */
  .bidi-isolate {
    unicode-bidi: isolate;
  }
  
  .bidi-embed {
    unicode-bidi: embed;
  }
  
  /* Flex utilities for RTL */
  [dir="rtl"] .flex-row-logical {
    flex-direction: row-reverse;
  }
  
  [dir="ltr"] .flex-row-logical {
    flex-direction: row;
  }
`;

/**
 * Inline style object for a direction
 */
export function getDirectionStyle(language: FontLanguage): React.CSSProperties {
  const layout = getDocumentLayout(language);
  
  return {
    direction: layout.direction,
    textAlign: layout.textAlign,
    fontFamily: layout.fontFamily,
  };
}
