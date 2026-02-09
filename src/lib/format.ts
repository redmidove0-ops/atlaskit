export function formatMoney(amount: number, locale: string, currency = 'EUR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}
