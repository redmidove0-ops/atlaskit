import {DevisDraft, calcDevisTotals} from '@/lib/docDraft';

function currencyForLocale(locale: string) {
  if (locale === 'en') return 'EUR';
  return 'DZD'; // ar + fr
}

function formatMoney(locale: string, amount: number) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyForLocale(locale)
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function DevisPreview({
  locale,
  draft,
  template
}: {
  locale: string;
  draft: DevisDraft;
  template: 'classic' | 'modern';
}) {
  const totals = calcDevisTotals(draft);
  const items = draft.items ?? [];

  return (
    <div className="print-sheet rounded-2xl border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-bold">{template === 'modern' ? 'DEVIS' : 'Devis'}</div>
          <div className="text-sm opacity-70">{draft.number} • {draft.dateISO}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-semibold">{draft.seller.name || '—'}</div>
          <div className="opacity-70">{draft.seller.phone || ''}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-3">
          <div className="text-xs font-semibold opacity-70">Seller</div>
          <div className="mt-1 text-sm">{draft.seller.name || '—'}</div>
          <div className="text-xs opacity-70">{draft.seller.address || ''}</div>
          <div className="text-xs opacity-70">{draft.seller.rc ? `RC: ${draft.seller.rc}` : ''}</div>
          <div className="text-xs opacity-70">{draft.seller.nif ? `NIF: ${draft.seller.nif}` : ''}</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-xs font-semibold opacity-70">Client</div>
          <div className="mt-1 text-sm">{draft.client.name || '—'}</div>
          <div className="text-xs opacity-70">{draft.client.address || ''}</div>
          <div className="text-xs opacity-70">{draft.client.phone || ''}</div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Unit</th>
              <th className="p-2 text-right">TVA</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="border-t">
                <td className="p-3 text-sm opacity-70" colSpan={5}>
                  — No items —
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const base = it.qty * it.unitPrice;
                const tva = (base * it.tvaRate) / 100;
                const total = base + tva;

                return (
                  <tr key={it.lineId} className="border-t">
                    <td className="p-2">{it.label || '—'}</td>
                    <td className="p-2 text-right">{it.qty}</td>
                    <td className="p-2 text-right">{formatMoney(locale, it.unitPrice)}</td>
                    <td className="p-2 text-right">{it.tvaRate}%</td>
                    <td className="p-2 text-right">{formatMoney(locale, total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 ml-auto w-full max-w-sm space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(locale, totals.subtotal)}</span></div>
        <div className="flex justify-between"><span>TVA</span><span>{formatMoney(locale, totals.tvaTotal)}</span></div>
        {totals.discountAmount > 0 ? (
          <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(locale, totals.discountAmount)}</span></div>
        ) : null}
        <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(locale, totals.total)}</span></div>
      </div>

      {draft.notes ? (
        <div className="mt-6 rounded-xl border p-3 text-sm">
          <div className="text-xs font-semibold opacity-70">Notes</div>
          <div className="mt-1 whitespace-pre-wrap">{draft.notes}</div>
        </div>
      ) : null}
    </div>
  );
}
