import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Package, Plus, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.login(locale));

  // Fetch counts in parallel
  const [docsRes, clientsRes, productsRes, recentRes] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase
      .from('documents')
      .select('id, title, template, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const docCount = docsRes.count ?? 0;
  const clientCount = clientsRes.count ?? 0;
  const productCount = productsRes.count ?? 0;
  const recentDocs = recentRes.data ?? [];

  const stats = [
    { label: t('totalDocuments'), value: docCount, icon: FileText, href: routes.documents(locale) },
    { label: t('totalClients'), value: clientCount, icon: Users, href: routes.clients(locale) },
    { label: t('totalProducts'), value: productCount, icon: Package, href: routes.products(locale) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">{s.label}</CardDescription>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="w-full justify-start gap-2" asChild>
              <Link href={routes.documentNew(locale)}>
                <Plus className="h-4 w-4" />
                {t('newInvoice')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href={routes.documentNew(locale)}>
                <Plus className="h-4 w-4" />
                {t('newQuote')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href={routes.clients(locale)}>
                <Users className="h-4 w-4" />
                {t('totalClients')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t('recentDocuments')}</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href={routes.documents(locale)}>
                {t('viewAll')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noRecentDocs')}</p>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((d) => (
                  <Link
                    key={d.id}
                    href={routes.document(locale, d.id)}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.title ?? 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
