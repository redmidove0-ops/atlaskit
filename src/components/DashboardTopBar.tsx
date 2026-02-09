'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

export default function DashboardTopBar() {
  const locale = useLocale();
  const t = useTranslations('topbar');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold">{t('title')}</div>
        <div className="relative">
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm md:w-80"
            placeholder={t('searchPh')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/${locale}/templates`}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5"
        >
          {t('templates')}
        </Link>

        <Link
          href={`/${locale}/documents/new`}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white"
        >
          {t('newDoc')}
        </Link>
      </div>
    </div>
  );
}
