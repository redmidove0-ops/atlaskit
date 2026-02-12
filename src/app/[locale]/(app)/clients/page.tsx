import { getTranslations } from 'next-intl/server';
import ClientsManager from '@/components/ClientsManager';

export const dynamic = 'force-dynamic';

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'clients' }).catch(
    () => null as any,
  );

  const title = t ? t('title') : 'Clients';
  const subtitle = t
    ? t('subtitle')
    : 'Clients book to pick them quickly inside Devis.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <ClientsManager locale={locale} />
    </div>
  );
}
