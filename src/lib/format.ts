import { type CountryCode, COUNTRY_CONFIGS } from './docTypes';

/** Format money with proper currency and locale */
export function formatMoney(
  amount: number,
  locale: string,
  currency?: string,
  country?: CountryCode
) {
  const cur = currency ?? (country ? COUNTRY_CONFIGS[country].currency : 'DZD');

  // Map our locale codes to Intl-compatible ones
  const intlLocale =
    locale === 'ar' ? 'ar-SA' :
    locale === 'fr' ? 'fr-DZ' :
    'en-US';

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Format a number with locale-aware grouping */
export function formatNumber(amount: number, locale: string): string {
  const intlLocale =
    locale === 'ar' ? 'ar-SA' :
    locale === 'fr' ? 'fr-FR' :
    'en-US';
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format date based on locale */
export function formatDate(isoDate: string, locale: string): string {
  const d = new Date(isoDate);
  const intlLocale =
    locale === 'ar' ? 'ar-SA' :
    locale === 'fr' ? 'fr-FR' :
    'en-US';
  return d.toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format date short */
export function formatDateShort(isoDate: string, locale: string): string {
  const d = new Date(isoDate);
  const intlLocale =
    locale === 'ar' ? 'ar-SA' :
    locale === 'fr' ? 'fr-FR' :
    'en-US';
  return d.toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Format a relative date (e.g., "3 days ago") */
export function formatRelativeDate(isoDate: string, locale: string): string {
  const now = new Date();
  const d = new Date(isoDate);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const intlLocale =
    locale === 'ar' ? 'ar-SA' :
    locale === 'fr' ? 'fr-FR' :
    'en-US';

  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });

  if (diffDays === 0) return rtf.format(0, 'day');
  if (diffDays < 7) return rtf.format(-diffDays, 'day');
  if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), 'week');
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
  return rtf.format(-Math.floor(diffDays / 365), 'year');
}

/** Get percentage string */
export function formatPercent(value: number): string {
  return `${value}%`;
}
