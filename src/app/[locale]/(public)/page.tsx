import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

export default async function Landing({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations('landing');

  const features = [
    t('f1'),
    t('f2'),
    t('f3'),
    t('f4'),
    t('f5'),
    t('f6')
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg opacity-80">{t('subtitle')}</p>

        <div className="flex gap-3">
          <Link
            href={`/${locale}/dashboard`}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            {t('cta')}
          </Link>

          <Link
            href={`/${locale}/documents/1/print`}
            className="rounded-xl border px-4 py-2"
          >
            {t('seePdf')}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {features.map((txt, i) => (
          <div key={i} className="rounded-2xl border p-4">
            <div className="text-sm font-semibold">{t('featureTitle')}</div>
            <div className="mt-1 text-sm opacity-80">{txt}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
