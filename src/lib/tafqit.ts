// src/lib/tafqit.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Number to Words Conversion (Tafqit)
// Supports: Arabic (DZ/SA), French, English
// ────────────────────────────────────────────────────────────────

type Language = 'ar' | 'fr' | 'en';
type Currency = 'DZD' | 'SAR' | 'EUR' | 'USD';

interface TafqitOptions {
  language: Language;
  currency?: Currency;
  feminine?: boolean; // For Arabic grammatical gender
}

// ── Arabic Words ───────────────────────────────────────────────

const AR_ONES = [
  '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة',
  'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
  'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
];

const AR_ONES_FEM = [
  '', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس',
  'ست', 'سبع', 'ثمان', 'تسع', 'عشر',
  'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة', 'خمس عشرة',
  'ست عشرة', 'سبع عشرة', 'ثماني عشرة', 'تسع عشرة',
];

const AR_TENS = [
  '', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون',
  'ستون', 'سبعون', 'ثمانون', 'تسعون',
];

const AR_HUNDREDS = [
  '', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة',
  'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة',
];

const AR_LARGE = [
  '',
  'ألف',
  'مليون',
  'مليار',
  'تريليون',
];

const AR_LARGE_DUAL = [
  '',
  'ألفان',
  'مليونان',
  'ملياران',
  'تريليونان',
];

const AR_LARGE_PLURAL = [
  '',
  'آلاف',
  'ملايين',
  'مليارات',
  'تريليونات',
];

// ── French Words ───────────────────────────────────────────────

const FR_ONES = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq',
  'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze',
  'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];

const FR_TENS = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante',
  'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt',
];

// ── English Words ──────────────────────────────────────────────

const EN_ONES = [
  '', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen',
];

const EN_TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty',
  'sixty', 'seventy', 'eighty', 'ninety',
];

// ── Currency Names ─────────────────────────────────────────────

const CURRENCY_NAMES: Record<Currency, Record<Language, { main: string; sub: string; mainPlural: string; subPlural: string }>> = {
  DZD: {
    ar: { main: 'دينار جزائري', sub: 'سنتيم', mainPlural: 'دينار جزائري', subPlural: 'سنتيم' },
    fr: { main: 'dinar algérien', sub: 'centime', mainPlural: 'dinars algériens', subPlural: 'centimes' },
    en: { main: 'Algerian dinar', sub: 'centime', mainPlural: 'Algerian dinars', subPlural: 'centimes' },
  },
  SAR: {
    ar: { main: 'ريال سعودي', sub: 'هللة', mainPlural: 'ريال سعودي', subPlural: 'هللة' },
    fr: { main: 'riyal saoudien', sub: 'halala', mainPlural: 'riyals saoudiens', subPlural: 'halalas' },
    en: { main: 'Saudi riyal', sub: 'halala', mainPlural: 'Saudi riyals', subPlural: 'halalas' },
  },
  EUR: {
    ar: { main: 'يورو', sub: 'سنت', mainPlural: 'يورو', subPlural: 'سنت' },
    fr: { main: 'euro', sub: 'centime', mainPlural: 'euros', subPlural: 'centimes' },
    en: { main: 'euro', sub: 'cent', mainPlural: 'euros', subPlural: 'cents' },
  },
  USD: {
    ar: { main: 'دولار أمريكي', sub: 'سنت', mainPlural: 'دولار أمريكي', subPlural: 'سنت' },
    fr: { main: 'dollar américain', sub: 'cent', mainPlural: 'dollars américains', subPlural: 'cents' },
    en: { main: 'US dollar', sub: 'cent', mainPlural: 'US dollars', subPlural: 'cents' },
  },
};

// ── Helper Functions ───────────────────────────────────────────

function splitNumber(n: number): { main: number; fraction: number } {
  const main = Math.floor(Math.abs(n));
  const fraction = Math.round((Math.abs(n) - main) * 100);
  return { main, fraction };
}

// ── Arabic Number to Words ─────────────────────────────────────

function arabicHundreds(n: number, feminine = false): string {
  if (n === 0) return '';
  if (n < 20) return feminine ? AR_ONES_FEM[n] : AR_ONES[n];
  if (n < 100) {
    const ones = n % 10;
    const tens = Math.floor(n / 10);
    if (ones === 0) return AR_TENS[tens];
    const onesWord = feminine ? AR_ONES_FEM[ones] : AR_ONES[ones];
    return `${onesWord} و${AR_TENS[tens]}`;
  }
  // 100-999
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return AR_HUNDREDS[h];
  return `${AR_HUNDREDS[h]} و${arabicHundreds(rest, feminine)}`;
}

function arabicNumberToWords(n: number, feminine = false): string {
  if (n === 0) return 'صفر';
  if (n < 0) return `سالب ${arabicNumberToWords(-n, feminine)}`;

  const groups: number[] = [];
  let num = n;
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;

    if (i === 0) {
      // Units group
      parts.push(arabicHundreds(g, feminine));
    } else {
      // Thousands, millions, etc.
      if (g === 1) {
        parts.push(AR_LARGE[i]);
      } else if (g === 2) {
        parts.push(AR_LARGE_DUAL[i]);
      } else if (g >= 3 && g <= 10) {
        parts.push(`${arabicHundreds(g, false)} ${AR_LARGE_PLURAL[i]}`);
      } else {
        parts.push(`${arabicHundreds(g, false)} ${AR_LARGE[i]}`);
      }
    }
  }

  return parts.join(' و');
}

// ── French Number to Words ─────────────────────────────────────

function frenchHundreds(n: number): string {
  if (n === 0) return '';
  if (n < 20) return FR_ONES[n];
  if (n < 70) {
    const ones = n % 10;
    const tens = Math.floor(n / 10);
    if (ones === 0) return FR_TENS[tens];
    if (ones === 1 && tens !== 8) return `${FR_TENS[tens]} et un`;
    return `${FR_TENS[tens]}-${FR_ONES[ones]}`;
  }
  if (n < 80) {
    // 70-79: soixante-dix...
    const sub = n - 60;
    if (sub === 11) return 'soixante et onze';
    return `soixante-${FR_ONES[sub]}`;
  }
  if (n < 100) {
    // 80-99: quatre-vingt...
    if (n === 80) return 'quatre-vingts';
    const sub = n - 80;
    return `quatre-vingt-${FR_ONES[sub]}`;
  }
  // 100-999
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let hWord = h === 1 ? 'cent' : `${FR_ONES[h]} cent`;
  if (rest === 0 && h > 1) hWord += 's';
  if (rest === 0) return hWord;
  return `${hWord} ${frenchHundreds(rest)}`;
}

function frenchNumberToWords(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 0) return `moins ${frenchNumberToWords(-n)}`;

  if (n < 1000) return frenchHundreds(n);

  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    let tWord = thousands === 1 ? 'mille' : `${frenchHundreds(thousands)} mille`;
    if (rest === 0) return tWord;
    return `${tWord} ${frenchHundreds(rest)}`;
  }

  if (n < 1000000000) {
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const mWord = millions === 1 ? 'un million' : `${frenchNumberToWords(millions)} millions`;
    if (rest === 0) return mWord;
    return `${mWord} ${frenchNumberToWords(rest)}`;
  }

  const billions = Math.floor(n / 1000000000);
  const rest = n % 1000000000;
  const bWord = billions === 1 ? 'un milliard' : `${frenchNumberToWords(billions)} milliards`;
  if (rest === 0) return bWord;
  return `${bWord} ${frenchNumberToWords(rest)}`;
}

// ── English Number to Words ────────────────────────────────────

function englishHundreds(n: number): string {
  if (n === 0) return '';
  if (n < 20) return EN_ONES[n];
  if (n < 100) {
    const ones = n % 10;
    const tens = Math.floor(n / 10);
    if (ones === 0) return EN_TENS[tens];
    return `${EN_TENS[tens]}-${EN_ONES[ones]}`;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return `${EN_ONES[h]} hundred`;
  return `${EN_ONES[h]} hundred and ${englishHundreds(rest)}`;
}

function englishNumberToWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return `negative ${englishNumberToWords(-n)}`;

  if (n < 1000) return englishHundreds(n);

  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const tWord = `${englishHundreds(thousands)} thousand`;
    if (rest === 0) return tWord;
    return `${tWord} ${englishHundreds(rest)}`;
  }

  if (n < 1000000000) {
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const mWord = `${englishNumberToWords(millions)} million`;
    if (rest === 0) return mWord;
    return `${mWord} ${englishNumberToWords(rest)}`;
  }

  const billions = Math.floor(n / 1000000000);
  const rest = n % 1000000000;
  const bWord = `${englishNumberToWords(billions)} billion`;
  if (rest === 0) return bWord;
  return `${bWord} ${englishNumberToWords(rest)}`;
}

// ── Main Tafqit Function ───────────────────────────────────────

/**
 * Convert a number to words
 * @param amount - The number to convert (can have decimals for currency)
 * @param options - Language, currency, and gender options
 * @returns The number spelled out in words
 */
export function tafqit(amount: number, options: TafqitOptions): string {
  const { language, currency, feminine = false } = options;
  const { main, fraction } = splitNumber(amount);

  let mainWords: string;
  let fractionWords: string;

  switch (language) {
    case 'ar':
      mainWords = arabicNumberToWords(main, feminine);
      fractionWords = fraction > 0 ? arabicNumberToWords(fraction, feminine) : '';
      break;
    case 'fr':
      mainWords = frenchNumberToWords(main);
      fractionWords = fraction > 0 ? frenchNumberToWords(fraction) : '';
      break;
    case 'en':
    default:
      mainWords = englishNumberToWords(main);
      fractionWords = fraction > 0 ? englishNumberToWords(fraction) : '';
      break;
  }

  // If no currency, just return the number words
  if (!currency) {
    if (fraction === 0) return mainWords;
    const decimalSep = language === 'ar' ? ' فاصلة ' : language === 'fr' ? ' virgule ' : ' point ';
    return `${mainWords}${decimalSep}${fractionWords}`;
  }

  // With currency
  const curr = CURRENCY_NAMES[currency]?.[language] ?? CURRENCY_NAMES.DZD[language];
  const mainCurr = main === 1 ? curr.main : curr.mainPlural;
  const subCurr = fraction === 1 ? curr.sub : curr.subPlural;

  if (fraction === 0) {
    return `${mainWords} ${mainCurr}`;
  }

  const connector = language === 'ar' ? ' و' : language === 'fr' ? ' et ' : ' and ';
  return `${mainWords} ${mainCurr}${connector}${fractionWords} ${subCurr}`;
}

/**
 * Quick Arabic tafqit with DZD currency (most common use case)
 */
export function tafqitAR(amount: number): string {
  return tafqit(amount, { language: 'ar', currency: 'DZD' });
}

/**
 * Quick French tafqit with DZD currency
 */
export function tafqitFR(amount: number): string {
  return tafqit(amount, { language: 'fr', currency: 'DZD' });
}

/**
 * Number to words without currency
 */
export function numberToWords(n: number, language: Language = 'ar'): string {
  return tafqit(n, { language });
}

// ── Export helpers for direct use ──────────────────────────────

export { arabicNumberToWords, frenchNumberToWords, englishNumberToWords };
