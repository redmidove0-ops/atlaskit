// src/lib/design/fonts.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Font Configuration
// Arabic: Cairo (sans-serif), Amiri (serif)
// Latin: Roboto (sans-serif)
// ────────────────────────────────────────────────────────────────

/**
 * Font family definitions
 */
export const FONT_FAMILIES = {
  // Arabic sans-serif (modern, clean)
  cairo: {
    name: 'Cairo',
    family: '"Cairo", "Segoe UI", Tahoma, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap',
  },

  // Arabic serif (traditional, formal documents)
  amiri: {
    name: 'Amiri',
    family: '"Amiri", "Times New Roman", serif',
    weights: {
      regular: 400,
      bold: 700,
    },
    url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
  },

  // Latin sans-serif
  roboto: {
    name: 'Roboto',
    family: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  },

  // Monospace (for numbers, codes)
  mono: {
    name: 'JetBrains Mono',
    family: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    weights: {
      regular: 400,
      medium: 500,
    },
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
  },
} as const;

/**
 * Font URLs for Google Fonts (combined)
 */
export const GOOGLE_FONTS_URL = 
  'https://fonts.googleapis.com/css2?' +
  'family=Cairo:wght@400;500;600;700&' +
  'family=Amiri:wght@400;700&' +
  'family=Roboto:wght@300;400;500;700&' +
  'family=JetBrains+Mono:wght@400;500&' +
  'display=swap';

/**
 * Font family by language/direction
 */
export const FONT_BY_LANGUAGE = {
  ar: FONT_FAMILIES.cairo.family,
  fr: FONT_FAMILIES.roboto.family,
  en: FONT_FAMILIES.roboto.family,
} as const;

/**
 * Serif font by language (for formal documents)
 */
export const SERIF_BY_LANGUAGE = {
  ar: FONT_FAMILIES.amiri.family,
  fr: '"Times New Roman", Georgia, serif',
  en: '"Times New Roman", Georgia, serif',
} as const;

export type FontLanguage = keyof typeof FONT_BY_LANGUAGE;

/**
 * Get appropriate font family for a language
 */
export function getFontFamily(language: FontLanguage, serif = false): string {
  return serif ? SERIF_BY_LANGUAGE[language] : FONT_BY_LANGUAGE[language];
}

// ── PDF Font Registration URLs (for @react-pdf/renderer) ──────

/**
 * Direct font file URLs for PDF rendering
 * These are from Google Fonts CDN, which allows direct downloads
 */
export const PDF_FONT_URLS = {
  cairo: {
    regular: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-W1ToLQ.ttf',
    bold: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOB-XFToLQ.ttf',
  },
  amiri: {
    regular: 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf',
    bold: 'https://fonts.gstatic.com/s/amiri/v27/J7acnpd8CGxBHp2VkZY4xJ9CGyAa.ttf',
  },
  roboto: {
    light: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmSU5fBBc4.ttf',
    regular: 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Mu4mxK.ttf',
    medium: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmEU9fBBc4.ttf',
    bold: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc4.ttf',
  },
} as const;
