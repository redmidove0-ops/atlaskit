import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {createClient} from '@/lib/supabase/server';
import {routes} from '@/lib/routes';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations('dashboard');

  // Fetch latest document so the "Preview PDF" button links to a real doc
  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect(routes.login(locale));

  const {data: latestDoc} = await supabase
    .from('documents')
    .select('id')
    .order('created_at', {ascending: false})
    .limit(1)
    .single();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="opacity-80">{t('subtitle')}</p>

      <div className="flex gap-3">
        <Link href={routes.documents(locale)} className="rounded-xl border px-4 py-2">
          {t('goDocuments')}
        </Link>

        {latestDoc ? (
          <Link
            href={routes.documentPrint(locale, latestDoc.id)}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            {t('previewPdf')}
          </Link>
        ) : (
          <Link
            href={routes.documentNew(locale)}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            {t('previewPdf')}
          </Link>
        )}
      </div>
    </section>
  );
}
