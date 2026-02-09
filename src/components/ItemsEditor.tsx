'use client';

import {DevisItem, cryptoId} from '@/lib/docDraft';

export default function ItemsEditor({
  items,
  onChange
}: {
  items: DevisItem[];
  onChange: (items: DevisItem[]) => void;
}) {
  function update(id: string, patch: Partial<DevisItem>) {
    onChange(items.map((it) => (it.id === id ? {...it, ...patch} : it)));
  }

  function add() {
    onChange([
      ...items,
      {id: cryptoId(), label: '', qty: 1, unitPrice: 0, tvaRate: 0}
    ]);
  }

  function remove(id: string) {
    const next = items.filter((it) => it.id !== id);
    onChange(next.length ? next : [{id: cryptoId(), label: '', qty: 1, unitPrice: 0, tvaRate: 0}]);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2">Service / Article</th>
              <th className="p-2 w-24">Qty</th>
              <th className="p-2 w-32">Unit</th>
              <th className="p-2 w-28">TVA</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">
                  <input
                    className="w-full rounded-lg border px-2 py-1"
                    value={it.label}
                    onChange={(e) => update(it.id, {label: e.target.value})}
                    placeholder="مثال: تركيب قطعة…"
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-20 rounded-lg border px-2 py-1"
                    type="number"
                    step="1"
                    value={it.qty}
                    onChange={(e) => update(it.id, {qty: Number(e.target.value)})}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="w-28 rounded-lg border px-2 py-1"
                    type="number"
                    step="0.01"
                    value={it.unitPrice}
                    onChange={(e) => update(it.id, {unitPrice: Number(e.target.value)})}
                  />
                </td>
                <td className="p-2">
                  <select
                    className="rounded-lg border px-2 py-1"
                    value={it.tvaRate}
                    onChange={(e) => update(it.id, {tvaRate: Number(e.target.value)})}
                  >
                    <option value={0}>0%</option>
                    <option value={0.09}>9%</option>
                    <option value={0.19}>19%</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="rounded-lg border px-2 py-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={add}
        className="rounded-xl border px-3 py-2 text-sm"
      >
        + Add item
      </button>
    </div>
  );
}
