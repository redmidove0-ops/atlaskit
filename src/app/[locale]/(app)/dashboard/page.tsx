import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

export default async function Dashboard({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations('dashboard');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="opacity-80">{t('subtitle')}</p>

      <div className="flex gap-3">
        <Link href={`/${locale}/documents`} className="rounded-xl border px-4 py-2">
          {t('goDocuments')}
        </Link>
        <Link
          href={`/${locale}/documents/1/print`}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          {t('previewPdf')}
        </Link>
      </div>
    </section>
  );
}
