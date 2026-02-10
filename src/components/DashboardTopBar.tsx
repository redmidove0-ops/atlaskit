'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';

import LocaleSwitcher from '@/components/LocaleSwitcher';

type Props = {
  /** اختياري: لو عندك صفحة فيها بحث */
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  searchActionHref?: (locale: string, q: string) => string;
};

export default function DashboardTopBar({
  searchEnabled = true,
  searchPlaceholder,
  searchActionHref
}: Props) {
  const locale = useLocale();
  const t = useTranslations('common');

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const initialQ = sp.get('q') ?? '';
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    setQ(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  const placeholder = searchPlaceholder ?? t('search');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextHref = searchActionHref
      ? searchActionHref(locale, q.trim())
      : `${pathname}${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`;

    router.push(nextHref);
  };

  const links = useMemo(
    () => [
      {href: `/${locale}/documents`, label: t('new')}, // زر New يروح للـ documents (ومنها new)
      {href: `/${locale}/templates`, label: t('templates')},
      {href: `/${locale}/clients`, label: t('clients')},
      {href: `/${locale}/products`, label: t('products')},
      {href: `/${locale}/settings/company`, label: t('company')}
    ],
    [locale, t]
  );

  return (
    <header className="no-print sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        {/* Brand */}
        <Link href={`/${locale}/documents`} className="flex items-center gap-2">
          <div className="rounded-xl bg-black px-3 py-1.5 text-sm font-semibold text-white">
            {t('appName')}
          </div>
        </Link>

        {/* Search */}
        {searchEnabled ? (
          <form onSubmit={onSubmit} className="hidden flex-1 items-center gap-2 md:flex">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl border px-3 py-2 text-sm">
              {t('search')}
            </button>
          </form>
        ) : (
          <div className="flex-1" />
        )}

        {/* Actions */}
        <nav className="flex items-center gap-2">
          {links.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              {x.label}
            </Link>
          ))}

          <LocaleSwitcher />

          <Link
            href={`/${locale}/logout`}
            className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            {t('logout')}
          </Link>
        </nav>
      </div>

      {/* Mobile search */}
      {searchEnabled ? (
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl border px-3 py-2 text-sm">
              {t('search')}
            </button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
