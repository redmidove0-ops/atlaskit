'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {createClient} from '@/lib/supabase/client';

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  price: any;
  tva: any;
  created_at?: string | null;
};

export default function CatalogPicker({
  locale,
  onAdd
}: {
  locale: string;
  onAdd: (p: {id: string; name: string; description: string; unit: string; price: number; tva: number}) => void;
}) {
  const t = useTranslations('products');
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const {data, error} = await supabase
        .from('products')
        .select('id, name, description, unit, price, tva, created_at')
        .order('created_at', {ascending: false})
        .limit(300);

      if (error) setErr(error.message);
      setProducts((data ?? []) as any);
      setLoading(false);
    })();
  }, [supabase]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      [p.name ?? '', p.description ?? '', p.unit ?? '']
        .join(' ')
        .toLowerCase()
        .includes(s)
    );
  }, [products, q]);

  function addSelected() {
    if (!selectedId) return;
    const p = products.find((x) => x.id === selectedId);
    if (!p) return;

    onAdd({
      id: p.id,
      name: p.name ?? '',
      description: p.description ?? '',
      unit: p.unit ?? 'pcs',
      price: Number(p.price ?? 0),
      tva: Number(p.tva ?? 0)
    });

    setSelectedId('');
  }

  return (
    <div className="mt-4 rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{t('catalogTitle')}</div>
        <Link href={`/${locale}/products`} className="rounded-xl border px-3 py-1.5 text-xs hover:bg-gray-50">
          {t('manageProducts')}
        </Link>
      </div>

      <input
        className="w-full rounded-xl border px-3 py-2 text-sm"
        placeholder={t('searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <select
          className="w-full rounded-xl border px-3 py-2 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? t('loading') : t('selectProduct')}</option>
          {filtered.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={addSelected}
          disabled={!selectedId}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {t('addToDoc')}
        </button>
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
