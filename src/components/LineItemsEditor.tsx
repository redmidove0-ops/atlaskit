'use client';

import {useTranslations} from 'next-intl';
import {type LineItem, genLineId} from '@/lib/docDraft';

function toNumber(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function LineItemsEditor({
  locale,
  items,
  onChange,
  onOpenCatalog
}: {
  locale: string;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  onOpenCatalog?: () => void;
}) {
  const t = useTranslations('builder');

  const addRow = () => {
    const next: LineItem = {
      lineId: genLineId(),
      label: '',
      description: '',
      qty: 1,
      unit: 'pcs',
      unitPrice: 0,
      tvaRate: 0
    };
    onChange([next, ...items]);
  };

  const update = (lineId: string, patch: Partial<LineItem>) => {
    onChange(items.map((it) => (it.lineId === lineId ? {...it, ...patch} : it)));
  };

  const remove = (lineId: string) => {
    onChange(items.filter((it) => it.lineId !== lineId));
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{t('itemsTitle')}</div>
          <div className="text-xs opacity-60">{t('itemsHint')}</div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCatalog ? (
            <button
              type="button"
              onClick={onOpenCatalog}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              {t('addFromCatalog')}
            </button>
          ) : null}

          <button
            type="button"
            onClick={addRow}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
          >
            {t('addItem')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">{t('colItem')}</th>
              <th className="p-2 text-right">{t('colQty')}</th>
              <th className="p-2 text-left">{t('colUnit')}</th>
              <th className="p-2 text-right">{t('colUnitPrice')}</th>
              <th className="p-2 text-right">{t('colTva')}</th>
              <th className="p-2 text-right">{t('colLineTotal')}</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-3 text-center text-sm opacity-60">
                  {t('noItems')}
                </td>
              </tr>
            ) : null}

            {items.map((it) => {
              const base = it.qty * it.unitPrice;
              const tva = (base * it.tvaRate) / 100;
              const total = base + tva;

              const money = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'DZD'
              }).format(total);

              return (
                <tr key={it.lineId} className="border-t align-top">
                  <td className="p-2">
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder={t('itemPlaceholder')}
                      value={it.label}
                      onChange={(e) => update(it.lineId, {label: e.target.value})}
                    />
                    <input
                      className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder={t('descPlaceholder')}
                      value={it.description ?? ''}
                      onChange={(e) => update(it.lineId, {description: e.target.value})}
                    />
                  </td>

                  <td className="p-2 text-right">
                    <input
                      className="w-24 rounded-xl border px-3 py-2 text-sm text-right"
                      value={it.qty}
                      inputMode="decimal"
                      onChange={(e) => update(it.lineId, {qty: toNumber(e.target.value, 1)})}
                    />
                  </td>

                  <td className="p-2">
                    <input
                      className="w-28 rounded-xl border px-3 py-2 text-sm"
                      value={it.unit}
                      onChange={(e) => update(it.lineId, {unit: e.target.value})}
                    />
                  </td>

                  <td className="p-2 text-right">
                    <input
                      className="w-32 rounded-xl border px-3 py-2 text-sm text-right"
                      value={it.unitPrice}
                      inputMode="decimal"
                      onChange={(e) => update(it.lineId, {unitPrice: toNumber(e.target.value, 0)})}
                    />
                  </td>

                  <td className="p-2 text-right">
                    <input
                      className="w-20 rounded-xl border px-3 py-2 text-sm text-right"
                      value={it.tvaRate}
                      inputMode="decimal"
                      onChange={(e) => update(it.lineId, {tvaRate: toNumber(e.target.value, 0)})}
                    />
                  </td>

                  <td className="p-2 text-right font-semibold">{money}</td>

                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => remove(it.lineId)}
                      className="rounded-xl border px-3 py-2 text-sm"
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
