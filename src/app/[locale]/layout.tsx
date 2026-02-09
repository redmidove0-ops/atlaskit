import Link from 'next/link';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';

import {getDir, routing} from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <div lang={locale} dir={getDir(locale)} className="min-h-screen bg-white text-black">
      <NextIntlClientProvider messages={messages}>
        <header className="no-print border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}`} className="text-lg font-semibold">
                AtlasKit
              </Link>
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm opacity-80 hover:opacity-100"
              >
                Dashboard
              </Link>
            </div>

            <LocaleSwitcher />
          </div>
        </header>

        <main>{children}</main>
      </NextIntlClientProvider>
    </div>
  );
}
