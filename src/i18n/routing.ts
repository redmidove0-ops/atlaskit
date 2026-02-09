import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'en'
});

export type AppLocale = (typeof routing.locales)[number];

export function getDir(locale: AppLocale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
