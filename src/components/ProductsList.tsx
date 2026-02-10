'use client';

import {useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {useTranslations} from 'next-intl';

type ProductRow = {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  tva: number;
  created_at?: string;
};

export default function ProductsList({
  locale,
  userId,
  initialProducts
}: {
  locale: string;
  userId: string;
  initialProducts: ProductRow[];
}) {
  const t = useTranslations('products');
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<ProductRow[]>(initialProducts);

  const [form, setForm] = useState({
    name: '',
    description: '',
    unit: 'pcs',
    price: '0',
    tva: '0'
  });

  const [state, setState] = useState<'idle' | 'saving' | 'error' | 'done'>('idle');
  const [err, setErr] = useState<string | null>(null);

  function clampPercent(v: number) {
    if (Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(100, v));
  }

  async function addProduct() {
    const name = form.name.trim();
    if (!name) return;

    setState('saving');
    setErr(null);

    const priceNum = Number(form.price);
    const tvaNum = clampPercent(Number(form.tva));

    const payload = {
      user_id: userId,
      name,
      description: form.description.trim(),
      unit: (form.unit.trim() || 'pcs'),
      price: Number.isFinite(priceNum) ? priceNum : 0,
      tva: Number.isFinite(tvaNum) ? tvaNum : 0
    };

    const {data, error} = await supabase
      .from('products')
      .insert(payload)
      .select('id, name, description, unit, price, tva, created_at')
      .single();

    if (error) {
      setState('error');
      setErr(error.message);
      return;
    }

    setItems((prev) => [{
      id: (data as any).id,
      name: (data as any).name ?? '',
      description: (data as any).description ?? '',
      unit: (data as any).unit ?? 'pcs',
      price: Number((data as any).price ?? 0),
      tva: Number((data as any).tva ?? 0),
      created_at: (data as any).created_at ?? ''
    }, ...prev]);

    setForm({name: '', description: '', unit: 'pcs', price: '0', tva: '0'});
    setState('done');
    setTimeout(() => setState('idle'), 900);
  }

  async function removeProduct(id: string) {
    const ok = confirm(t('confirmDelete'));
    if (!ok) return;

    const {error} = await supabase.from('products').delete().eq('id', id);
    if (!error) setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">{t('addTitle')}</div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t('name')} value={form.name} onChange={(v) => setForm((f) => ({...f, name: v}))} />
          <Field label={t('unit')} value={form.unit} onChange={(v) => setForm((f) => ({...f, unit: v}))} />
          <Field label={t('price')} value={form.price} onChange={(v) => setForm((f) => ({...f, price: v}))} />
          <Field label={t('tva')} value={form.tva} onChange={(v) => setForm((f) => ({...f, tva: v}))} />
        </div>

        <label className="grid gap-1">
          <span className="text-sm opacity-70">{t('description')}</span>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addProduct}
            disabled={!form.name.trim() || state === 'saving'}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {state === 'saving' ? t('saving') : t('add')}
          </button>

          <div className="text-xs opacity-70">
            {state === 'done' ? t('saved') : ''}
          </div>

          {state === 'error' && err ? <div className="text-xs text-red-600">{err}</div> : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden">
        {items.length === 0 ? (
          <div className="p-4 text-sm opacity-70">{t('empty')}</div>
        ) : (
          <div className="divide-y">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs opacity-70 truncate">
                    {p.unit} • TVA {p.tva}% • {p.price}
                  </div>
                  {p.description ? (
                    <div className="text-xs opacity-60 truncate">{p.description}</div>
                  ) : null}
                </div>
                <button
                  onClick={() => removeProduct(p.id)}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  {t('delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-70">{label}</span>
      <input
        className="rounded-xl border px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
