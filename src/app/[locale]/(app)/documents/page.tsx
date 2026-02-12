import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Receipt,
  FileCheck,
  Truck,
  FileX,
} from 'lucide-react';
import {
  type DocKind,
  type DocStatus,
  DOC_KIND_LABELS,
  STATUS_COLORS,
} from '@/lib/docTypes';

export const dynamic = 'force-dynamic';

const KIND_ICONS: Record<DocKind, typeof FileText> = {
  invoice: Receipt,
  devis: FileCheck,
  bon_livraison: Truck,
  credit_note: FileX,
};

const KIND_COLORS: Record<DocKind, string> = {
  invoice: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  devis: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  bon_livraison: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  credit_note: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; kind?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = (sp?.q ?? '').trim();
  const kind = (sp?.kind ?? '') as DocKind | '';

  const t = await getTranslations('documents');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.login(locale));

  let query = supabase
    .from('documents')
    .select('id, title, template, content, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error } = await query;

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Parse content to extract kind and status
  type DocWithMeta = {
    id: string;
    title: string;
    template: string;
    created_at: string;
    kind: DocKind;
    status: DocStatus;
    number?: string;
  };

  const allDocs: DocWithMeta[] = (data ?? []).map((d) => {
    const content = typeof d.content === 'object' && d.content ? d.content : {};
    const docKind = (content as { kind?: string }).kind;
    const docStatus = (content as { status?: string }).status;
    const docNumber = (content as { number?: string }).number;

    return {
      id: d.id,
      title: d.title,
      template: d.template,
      created_at: d.created_at ?? '',
      kind: (['invoice', 'devis', 'bon_livraison', 'credit_note'].includes(docKind ?? '')
        ? docKind
        : 'invoice') as DocKind,
      status: (['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'delivered'].includes(docStatus ?? '')
        ? docStatus
        : 'draft') as DocStatus,
      number: docNumber,
    };
  });

  // Filter by kind if specified
  const docs = kind ? allDocs.filter((d) => d.kind === kind) : allDocs;

  // Count by kind
  const kindCounts: Record<DocKind | 'all', number> = {
    all: allDocs.length,
    invoice: allDocs.filter((d) => d.kind === 'invoice').length,
    devis: allDocs.filter((d) => d.kind === 'devis').length,
    bon_livraison: allDocs.filter((d) => d.kind === 'bon_livraison').length,
    credit_note: allDocs.filter((d) => d.kind === 'credit_note').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">
            {docs.length} {t('title').toLowerCase()}
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href={routes.documentNew(locale)}>
            <Plus className="h-4 w-4" />
            {t('newDocument')}
          </Link>
        </Button>
      </div>

      {/* Kind Filter Tabs */}
      <Tabs defaultValue={kind || 'all'} className="w-full">
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="all" asChild>
            <Link href={`${routes.documents(locale)}${q ? `?q=${q}` : ''}`}>
              {t('allDocuments')} ({kindCounts.all})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="invoice" asChild>
            <Link href={`${routes.documents(locale)}?kind=invoice${q ? `&q=${q}` : ''}`}>
              <Receipt className="h-4 w-4 me-1.5" />
              {t('invoice')} ({kindCounts.invoice})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="devis" asChild>
            <Link href={`${routes.documents(locale)}?kind=devis${q ? `&q=${q}` : ''}`}>
              <FileCheck className="h-4 w-4 me-1.5" />
              {t('quote')} ({kindCounts.devis})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="bon_livraison" asChild>
            <Link href={`${routes.documents(locale)}?kind=bon_livraison${q ? `&q=${q}` : ''}`}>
              <Truck className="h-4 w-4 me-1.5" />
              {t('deliveryNote')} ({kindCounts.bon_livraison})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="credit_note" asChild>
            <Link href={`${routes.documents(locale)}?kind=credit_note${q ? `&q=${q}` : ''}`}>
              <FileX className="h-4 w-4 me-1.5" />
              {t('creditNote')} ({kindCounts.credit_note})
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <form action={routes.documents(locale)} method="get">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder={t('searchPlaceholder')}
            className="ps-9"
          />
        </div>
      </form>

      {/* Document List */}
      {docs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">{t('noDocuments')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('createFirst')}</p>
            <Button className="mt-4 gap-2" asChild>
              <Link href={routes.documentNew(locale)}>
                <Plus className="h-4 w-4" />
                {t('newDocument')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {docs.map((d) => {
            const Icon = KIND_ICONS[d.kind] ?? FileText;
            const kindColor = KIND_COLORS[d.kind] ?? '';
            const statusColor = STATUS_COLORS[d.status] ?? '';

            return (
              <Link
                key={d.id}
                href={routes.document(locale, d.id)}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {d.title ?? t('untitled')}
                    </p>
                    {d.number && (
                      <span className="text-xs text-muted-foreground font-mono">
                        #{d.number}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={kindColor}>
                    {t(DOC_KIND_LABELS[d.kind])}
                  </Badge>
                  <Badge variant="secondary" className={statusColor}>
                    {t(`status.${d.status}`)}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
