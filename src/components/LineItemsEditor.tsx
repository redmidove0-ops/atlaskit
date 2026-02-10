'use client';

import {useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {formatMoney} from '@/lib/format';
import type {LineItem} from '@/lib/docDraft';
import {genLineId} from '@/lib/docDraft';

function toNum(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function createEmptyItem(): LineItem {
  return {
    lineId: genLineId(),
    label: '',
    description: '',
    qty: 1,
    unit: 'pcs',
    unitPrice: 0,
    tvaRate: 0
  };
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
  const tr = (key: string, fallback: string) => {
    try {
      return t(key as any);
    } catch {
      return fallback;
    }
  };

  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  function update(lineId: string, patch: Partial<LineItem>) {
    onChange(rows.map((it) => (it.lineId === lineId ? {...it, ...patch} : it)));
  }

  function remove(lineId: string) {
    onChange(rows.filter((it) => it.lineId !== lineId));
  }

  function addRow() {
    onChange([createEmptyItem(), ...rows]);
  }

  return (
    <div className="mt-4 rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{tr('itemsTitle', 'Items')}</div>

        <div className="flex items-center gap-2">
          {onOpenCatalog ? (
            <button
              type="button"
              onClick={onOpenCatalog}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              {tr('addFromCatalog', 'Add from catalog')}
            </button>
          ) : null}

          <button
            type="button"
            onClick={addRow}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
          >
            {tr('addItem', 'Add item')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">{tr('colItem', 'Item')}</th>
              <th className="p-2 text-right">{tr('colQty', 'Qty')}</th>
              <th className="p-2 text-left">{tr('colUnit', 'Unit')}</th>
              <th className="p-2 text-right">{tr('colUnitPrice', 'Unit')}</th>
              <th className="p-2 text-right">{tr('colTva', 'TVA')}</th>
              <th className="p-2 text-right">{tr('colLineTotal', 'Total')}</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr className="border-t">
                <td className="p-3 text-sm opacity-70" colSpan={7}>
                  {tr('noItems', 'No items yet.')}
                </td>
              </tr>
            ) : (
              rows.map((it) => {
                const qty = clamp(toNum(it.qty, 1), 0, 1_000_000);
                const unitPrice = clamp(toNum(it.unitPrice, 0), 0, 1_000_000_000);
                const tvaRate = clamp(toNum(it.tvaRate, 0), 0, 100);

                const base = qty * unitPrice;
                const tva = (base * tvaRate) / 100;
                const total = base + tva;

                return (
                  <tr key={it.lineId} className="border-t align-top">
                    <td className="min-w-[240px] p-2">
                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        value={it.label}
                        placeholder={tr('itemPlaceholder', 'Service / Product…')}
                        onChange={(e) => update(it.lineId, {label: e.target.value})}
                      />
                      <input
                        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                        value={it.description ?? ''}
                        placeholder={tr('descPlaceholder', 'Description (optional)…')}
                        onChange={(e) => update(it.lineId, {description: e.target.value})}
                      />
                    </td>

                    <td className="w-[110px] p-2">
                      <input
                        type="number"
                        min={0}
                        step="1"
                        className="w-full rounded-xl border px-3 py-2 text-sm text-right"
                        value={qty}
                        onChange={(e) => update(it.lineId, {qty: clamp(toNum(e.target.value, 0), 0, 1_000_000)})}
                      />
                    </td>

                    <td className="w-[130px] p-2">
                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        value={it.unit ?? ''}
                        placeholder="pcs"
                        onChange={(e) => update(it.lineId, {unit: e.target.value})}
                      />
                    </td>

                    <td className="w-[160px] p-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-full rounded-xl border px-3 py-2 text-sm text-right"
                        value={unitPrice}
                        onChange={(e) => update(it.lineId, {unitPrice: clamp(toNum(e.target.value, 0), 0, 1_000_000_000)})}
                      />
                    </td>

                    <td className="w-[120px] p-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        className="w-full rounded-xl border px-3 py-2 text-sm text-right"
                        value={tvaRate}
                        onChange={(e) => update(it.lineId, {tvaRate: clamp(toNum(e.target.value, 0), 0, 100)})}
                      />
                    </td>

                    <td className="w-[170px] p-2 text-right font-semibold">
                      {formatMoney(locale, total)}
                    </td>

                    <td className="w-[90px] p-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(it.lineId)}
                        className="rounded-xl border px-3 py-2 text-sm"
                        title={tr('delete', 'Delete')}
                      >
                        {tr('delete', 'Delete')}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs opacity-60">
        {tr('itemsHint', 'Tip: Add from catalog then adjust qty/price/TVA here.')}
      </div>
    </div>
  );
}
