import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {createClient} from '@/lib/supabase/server';
import ProductsList from '@/components/ProductsList';

export const dynamic = 'force-dynamic';

type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  unit: string | null;
  price: string | number | null; // numeric غالباً يرجع string
  tva: string | number | null;   // numeric غالباً يرجع string
  created_at: string | null;
};

function toNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function ProductsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{q?: string}>;
}) {
  const {locale} = await params;
  const sp = await searchParams;
  const q = (sp?.q ?? '').trim();

  const t = await getTranslations({locale, namespace: 'products'});

  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  let query = supabase
    .from('products')
    .select('id, name, description, unit, price, tva, created_at')
    .order('created_at', {ascending: false})
    .limit(300);

  // ✅ بحث آمن وبسيط
  if (q) {
    const qq = q.replace(/[%_]/g, ''); // sanitize ilike wildcards
    query = query.or(
      `name.ilike.%${qq}%,description.ilike.%${qq}%,unit.ilike.%${qq}%`
    );
  }

  const {data, error} = await query;

  if (error) {
    return (
      <pre className="rounded-xl border bg-white p-4 text-sm text-red-700">
        Failed to load products:
        {'\n'}
        {error.message}
      </pre>
    );
  }

  const products = (data ?? []).map((p: ProductRow) => ({
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    unit: p.unit ?? 'pcs',
    price: toNumber(p.price ?? 0, 0),
    tva: toNumber(p.tva ?? 0, 0),
    created_at: p.created_at ?? ''
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{t('title')}</h1>
          <p className="text-sm opacity-70">{t('subtitle')}</p>
        </div>

        <Link href={`/${locale}/documents`} className="rounded-xl border px-3 py-2 text-sm">
          ← Back
        </Link>
      </div>

      <form action={`/${locale}/products`} method="get" className="flex items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-xl border px-3 py-2 text-sm">
          {t('search')}
        </button>
        {q ? (
          <Link href={`/${locale}/products`} className="rounded-xl border px-3 py-2 text-sm">
            {t('clear')}
          </Link>
        ) : null}
      </form>

      <ProductsList locale={locale} userId={user.id} initialProducts={products} />
    </div>
  );
}
