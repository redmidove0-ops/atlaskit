'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';

type NavItem = {
  key: 'dashboard' | 'documents' | 'templates' | 'settings';
  path: string;
};

const NAV: NavItem[] = [
  {key: 'dashboard', path: 'dashboard'},
  {key: 'documents', path: 'documents'},
  {key: 'templates', path: 'templates'},
  {key: 'settings', path: 'settings'}
];

export default function AppSidebar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border bg-white p-3">
      <div className="px-2 pb-2 text-sm font-semibold">Workspace</div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const href = `/${locale}/${item.path}`;
          const active = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={item.key}
              href={href}
              className={[
                'rounded-xl px-3 py-2 text-sm',
                active ? 'border bg-black text-white' : 'hover:bg-black/5'
              ].join(' ')}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 rounded-xl border px-3 py-2 text-xs opacity-70">
        Next up: Auth + Workspaces + Roles
      </div>
    </div>
  );
}
