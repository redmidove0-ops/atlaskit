import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import ProductsList from '@/components/ProductsList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  unit: string | null;
  price: string | number | null;
  tva: string | number | null;
  created_at: string | null;
};

function toNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = (sp?.q ?? '').trim();

  const t = await getTranslations({ locale, namespace: 'products' });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  let query = supabase
    .from('products')
    .select('id, name, description, unit, price, tva, created_at')
    .order('created_at', { ascending: false })
    .limit(300);

  if (q) {
    const qq = q.replace(/[%_]/g, '');
    query = query.or(
      `name.ilike.%${qq}%,description.ilike.%${qq}%,unit.ilike.%${qq}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load products: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const products = (data ?? []).map((p: ProductRow) => ({
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    unit: p.unit ?? 'pcs',
    price: toNumber(p.price ?? 0, 0),
    tva: toNumber(p.tva ?? 0, 0),
    created_at: p.created_at ?? '',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form
        action={`/${locale}/products`}
        method="get"
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder={t('searchPlaceholder')}
            className="ps-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          {t('search')}
        </Button>
        {q && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/products`}>
              <X className="h-4 w-4" />
              {t('clear')}
            </Link>
          </Button>
        )}
      </form>

      <ProductsList locale={locale} userId={user.id} initialProducts={products} />
    </div>
  );
}
