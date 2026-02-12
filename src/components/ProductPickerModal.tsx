'use client';

import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  tva: number;
};

export default function ProductPickerModal({
  open,
  locale,
  onClose,
  onPick
}: {
  open: boolean;
  locale: string;
  onClose: () => void;
  onPick: (p: CatalogProduct) => void;
}) {
  const t = useTranslations('builder');

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogProduct[]>([]);

  async function load(search: string) {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set('q', search.trim());
      qs.set('limit', '200');

      const res = await fetch(`/api/products?${qs.toString()}`, {cache: 'no-store'});
      const json = (await res.json()) as {ok: boolean; error: string | null; data: CatalogProduct[] | null};
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Failed');
      setItems(json.data ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setQ('');
    load('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => load(q), 250);
    return () => window.clearTimeout(id);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const list = useMemo(() => items, [items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-2 border-b p-4">
          <div>
            <div className="text-sm font-semibold">{t('catalogTitle')}</div>
            <div className="text-xs opacity-70">{t('catalogHint')}</div>
          </div>

          <button type="button" onClick={onClose} className="rounded-xl border px-3 py-2 text-sm">
            {t('close')}
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchProducts')}
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                {t('clearSearch')}
              </button>
            ) : null}
          </div>

          {loading ? <div className="mt-3 text-sm opacity-70">{t('loading')}</div> : null}
          {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}

          <div className="mt-3 max-h-[420px] overflow-auto rounded-xl border">
            {list.length === 0 && !loading ? (
              <div className="p-3 text-sm opacity-70">{t('noProducts')}</div>
            ) : (
              <ul className="divide-y">
                {list.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="truncate text-xs opacity-70">
                        {[p.description, p.unit ? `Unit: ${p.unit}` : '', `TVA: ${p.tva}%`]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPick(p)}
                      className="rounded-xl bg-black px-3 py-2 text-sm text-white"
                    >
                      {t('pick')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
