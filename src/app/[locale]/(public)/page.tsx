import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function Landing({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  const t = await getTranslations({locale, namespace: 'landing'});

  const features = [t('f1'), t('f2'), t('f3'), t('f4'), t('f5')];

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-sm opacity-70">{t('subtitle')}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link href={`/${locale}/documents/new`} className="rounded-xl bg-black px-4 py-2 text-sm text-white">
            {t('ctaPrimary')}
          </Link>
          <Link href={`/${locale}/login`} className="rounded-xl border px-4 py-2 text-sm">
            {t('ctaSecondary')}
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {features.map((f, i) => (
          <div key={i} className="rounded-2xl border bg-white p-4">
            <div className="text-sm font-medium">{f}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
