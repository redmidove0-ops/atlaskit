import Link from 'next/link';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';

import {getDir, routing} from '@/i18n/routing';
import HtmlLangDir from '@/components/HtmlLangDir';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {routes} from '@/lib/routes';

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
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');

  return (
    <div dir={getDir(locale)} className="min-h-screen bg-white text-black">
      <HtmlLangDir locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <header className="locale-header no-print border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Link href={routes.home(locale)} className="text-lg font-semibold">
                {tCommon('appName')}
              </Link>
              <Link
                href={routes.dashboard(locale)}
                className="text-sm opacity-80 hover:opacity-100"
              >
                {tNav('dashboard')}
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
