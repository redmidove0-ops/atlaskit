'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {formatMoney} from '@/lib/format';

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
  const tr = (key: string, fallback: string) => {
    try {
      return t(key as any);
    } catch {
      return fallback;
    }
  };

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogProduct[]>([]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // fetch products (debounced)
  useEffect(() => {
    if (!open) return;

    setErr(null);
    const handle = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok || json?.ok === false) {
          setErr(json?.error ?? 'Failed to load products');
          setItems([]);
          return;
        }

        setItems(Array.isArray(json.data) ? json.data : []);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load products');
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [open, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* modal */}
      <div className="relative mx-auto mt-20 w-[95%] max-w-3xl rounded-2xl border bg-white shadow-xl">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <div className="text-sm font-semibold">{tr('catalogTitle', 'Catalog')}</div>
          <button type="button" onClick={onClose} className="rounded-xl border px-3 py-2 text-sm">
            {tr('close', 'Close')}
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tr('searchProducts', 'Search products…')}
              className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
              autoFocus
            />
            <button type="button" onClick={() => setQ('')} className="rounded-xl border px-3 py-2 text-sm">
              {tr('clearSearch', 'Clear')}
            </button>
          </div>

          {err ? (
            <div className="mt-3 rounded-xl border bg-white p-3 text-sm text-red-700">{err}</div>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-xl border">
            <div className="max-h-[55vh] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm opacity-70">{tr('loading', 'Loading…')}</div>
              ) : items.length === 0 ? (
                <div className="p-4 text-sm opacity-70">{tr('noProducts', 'No products found.')}</div>
              ) : (
                <ul className="divide-y">
                  {items.map((p) => (
                    <li key={p.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">{p.name || '—'}</div>
                          {p.description ? (
                            <div className="mt-1 line-clamp-2 text-xs opacity-70">{p.description}</div>
                          ) : null}
                          <div className="mt-2 text-xs opacity-70">
                            {p.unit ? `${p.unit} • ` : ''}TVA {Number(p.tva ?? 0)}%
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold">
                            {formatMoney(locale, Number(p.price ?? 0))}
                          </div>
                          <button
                            type="button"
                            onClick={() => onPick(p)}
                            className="mt-2 rounded-xl bg-black px-3 py-2 text-sm text-white"
                          >
                            {tr('pick', 'Add')}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs opacity-60">
            {tr('catalogHint', 'Tip: Search then click Add to insert it into your document.')}
          </div>
        </div>
      </div>
    </div>
  );
}
