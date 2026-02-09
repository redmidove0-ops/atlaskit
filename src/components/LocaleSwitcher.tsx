'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';

const LOCALES = ['en', 'fr', 'ar'] as const;

export default function LocaleSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function setLocale(nextLocale: string) {
    const parts = pathname.split('/');
    // pathname: /en/... or /fr/... or /ar/...
    if (parts.length > 1 && LOCALES.includes(parts[1] as any)) {
      parts[1] = nextLocale;
      router.replace(parts.join('/'));
    } else {
      router.replace(`/${nextLocale}`);
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="opacity-70">{t('language')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="rounded-lg border px-2 py-1"
      >
        <option value="en">{t('english')}</option>
        <option value="fr">{t('french')}</option>
        <option value="ar">{t('arabic')}</option>
      </select>
    </label>
  );
}
