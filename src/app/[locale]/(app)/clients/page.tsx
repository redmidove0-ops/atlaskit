import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import ClientsManager from '@/components/ClientsManager';

export const dynamic = 'force-dynamic';

export default async function ClientsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // ترجمة مع fallback (حتى لو ناقص keys ما يطيّح الصفحة)
  const t = await getTranslations({locale, namespace: 'clients'}).catch(() => null as any);

  const title = t ? t('title') : 'Clients';
  const subtitle = t ? t('subtitle') : 'Clients book to pick them quickly inside Devis.';

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm opacity-70">{subtitle}</p>
        </div>

        <Link href={`/${locale}/documents`} className="rounded-xl border px-3 py-2 text-sm">
          ← Back
        </Link>
      </div>

      <ClientsManager locale={locale} />
    </div>
  );
}
