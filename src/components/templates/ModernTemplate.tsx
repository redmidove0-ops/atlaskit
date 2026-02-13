// src/components/templates/ModernTemplate.tsx
// ────────────────────────────────────────────────────────────────
// AtlasKit — Modern Template Component
// Bold, professional design with dark header
// ────────────────────────────────────────────────────────────────

'use client';

import { type DevisDraft, calcDevisTotals } from '@/lib/docDraft';
import {
  MODERN_TEMPLATE,
  getTemplateHeaderStyles,
  getTemplateTableStyles,
  getTemplateTotalsStyles,
  getTemplateCardStyles,
} from '@/lib/design';
import { tafqit } from '@/lib/tafqit';

interface ModernTemplateProps {
  locale: string;
  draft: DevisDraft;
  showTafqit?: boolean;
}

function formatMoney(locale: string, amount: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(locale: string, dateISO: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateISO));
  } catch {
    return dateISO;
  }
}

export default function ModernTemplate({
  locale,
  draft,
  showTafqit = true,
}: ModernTemplateProps) {
  const template = MODERN_TEMPLATE;
  const totals = calcDevisTotals(draft);
  const items = draft.items ?? [];
  const isRtl = locale === 'ar';

  const headerStyles = getTemplateHeaderStyles(template);
  const tableStyles = getTemplateTableStyles(template);
  const totalsStyles = getTemplateTotalsStyles(template);
  const cardStyles = getTemplateCardStyles(template);

  // Labels based on locale
  const labels = {
    ar: {
      invoice: 'فاتورة',
      quote: 'عرض أسعار',
      number: 'رقم',
      date: 'التاريخ',
      seller: 'البائع',
      client: 'العميل',
      rc: 'السجل التجاري',
      nif: 'الرقم الجبائي',
      item: 'البيان',
      qty: 'الكمية',
      unit: 'الوحدة',
      unitPrice: 'سعر الوحدة',
      tva: 'TVA',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي',
      discount: 'الخصم',
      grandTotal: 'المجموع الكلي',
      notes: 'ملاحظات',
      totalInWords: 'المبلغ بالحروف',
      page: 'صفحة',
    },
    fr: {
      invoice: 'FACTURE',
      quote: 'DEVIS',
      number: 'N°',
      date: 'Date',
      seller: 'Vendeur',
      client: 'Client',
      rc: 'RC',
      nif: 'NIF',
      item: 'Désignation',
      qty: 'Qté',
      unit: 'Unité',
      unitPrice: 'Prix U.',
      tva: 'TVA',
      total: 'Total',
      subtotal: 'Sous-total',
      discount: 'Remise',
      grandTotal: 'Total TTC',
      notes: 'Notes',
      totalInWords: 'Arrêté à la somme de',
      page: 'Page',
    },
    en: {
      invoice: 'INVOICE',
      quote: 'QUOTE',
      number: 'No.',
      date: 'Date',
      seller: 'From',
      client: 'To',
      rc: 'RC',
      nif: 'NIF',
      item: 'Description',
      qty: 'Qty',
      unit: 'Unit',
      unitPrice: 'Unit Price',
      tva: 'VAT',
      total: 'Total',
      subtotal: 'Subtotal',
      discount: 'Discount',
      grandTotal: 'Grand Total',
      notes: 'Notes',
      totalInWords: 'Amount in words',
      page: 'Page',
    },
  };

  const t = labels[locale as keyof typeof labels] ?? labels.fr;
  const docTitle = draft.kind === 'devis' ? t.quote : t.invoice;

  return (
    <div
      className="print-sheet overflow-hidden rounded-2xl bg-white shadow-sm"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isRtl
          ? 'var(--font-arabic)'
          : 'var(--font-latin)',
      }}
    >
      {/* ─── Header ─── */}
      <div
        className="relative"
        style={{
          backgroundColor: headerStyles.backgroundColor,
          color: headerStyles.color,
          padding: `${headerStyles.paddingTop}px ${headerStyles.paddingRight}px ${headerStyles.paddingBottom}px ${headerStyles.paddingLeft}px`,
        }}
      >
        {/* Decorative accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: template.accentColor }}
        />

        <div className="flex items-start justify-between">
          <div>
            <div
              className="font-bold tracking-tight"
              style={{
                fontSize: `${template.typography.title.fontSize}pt`,
              }}
            >
              {docTitle}
            </div>
            <div
              className="mt-2 flex items-center gap-4 opacity-80"
              style={{ fontSize: `${template.typography.small.fontSize}pt` }}
            >
              <span>
                {t.number}: <strong className="font-mono">{draft.number}</strong>
              </span>
              <span>•</span>
              <span>
                {t.date}: <strong>{formatDate(locale, draft.dateISO)}</strong>
              </span>
            </div>
          </div>

          {/* Company name in header */}
          {draft.seller?.name && (
            <div className={`text-${isRtl ? 'left' : 'right'}`}>
              <div className="text-lg font-semibold">{draft.seller.name}</div>
              {draft.seller.phone && (
                <div className="mt-1 text-sm opacity-70">{draft.seller.phone}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Info Cards ─── */}
      <div className="grid grid-cols-2 gap-5 p-5">
        {/* Seller */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: cardStyles.backgroundColor,
            border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
            padding: `${cardStyles.padding}px`,
            boxShadow: cardStyles.boxShadow,
          }}
        >
          <div
            className="mb-3 flex items-center gap-2 font-semibold"
            style={{
              fontSize: `${template.typography.sectionHeader.fontSize}pt`,
              color: template.typography.sectionHeader.color,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: template.accentColor }}
            />
            {t.seller}
          </div>
          <div style={{ fontSize: `${template.typography.body.fontSize}pt` }}>
            <div className="font-medium text-slate-900">
              {draft.seller?.name || '—'}
            </div>
            <div className="mt-2 space-y-1 text-slate-600">
              {draft.seller?.address && <div>{draft.seller.address}</div>}
              {draft.seller?.phone && <div>{draft.seller.phone}</div>}
              {draft.seller?.email && (
                <div className="text-xs">{draft.seller.email}</div>
              )}
            </div>
            {(draft.seller?.rc || draft.seller?.nif) && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                {draft.seller?.rc && (
                  <span>
                    {t.rc}: <span className="font-mono">{draft.seller.rc}</span>
                  </span>
                )}
                {draft.seller?.nif && (
                  <span>
                    {t.nif}: <span className="font-mono">{draft.seller.nif}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Client */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: cardStyles.backgroundColor,
            border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
            padding: `${cardStyles.padding}px`,
            boxShadow: cardStyles.boxShadow,
          }}
        >
          <div
            className="mb-3 flex items-center gap-2 font-semibold"
            style={{
              fontSize: `${template.typography.sectionHeader.fontSize}pt`,
              color: template.typography.sectionHeader.color,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: template.accentColor }}
            />
            {t.client}
          </div>
          <div style={{ fontSize: `${template.typography.body.fontSize}pt` }}>
            <div className="font-medium text-slate-900">
              {draft.client?.name || '—'}
            </div>
            <div className="mt-2 space-y-1 text-slate-600">
              {draft.client?.address && <div>{draft.client.address}</div>}
              {draft.client?.phone && <div>{draft.client.phone}</div>}
              {draft.client?.email && (
                <div className="text-xs">{draft.client.email}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Items Table ─── */}
      <div className="px-5">
        <div
          className="overflow-hidden rounded-xl"
          style={{
            border: `${tableStyles.cell.borderWidth}px solid ${tableStyles.cell.borderColor}`,
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  backgroundColor: tableStyles.header.backgroundColor,
                  color: tableStyles.header.color,
                }}
              >
                <th
                  className={`${isRtl ? 'text-right' : 'text-left'} text-xs uppercase tracking-wider`}
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                  }}
                >
                  {t.item}
                </th>
                <th
                  className="text-center text-xs uppercase tracking-wider"
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                    width: '70px',
                  }}
                >
                  {t.qty}
                </th>
                <th
                  className="text-center text-xs uppercase tracking-wider"
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                    width: '80px',
                  }}
                >
                  {t.unit}
                </th>
                <th
                  className={`${isRtl ? 'text-left' : 'text-right'} text-xs uppercase tracking-wider`}
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                  }}
                >
                  {t.unitPrice}
                </th>
                <th
                  className="text-center text-xs uppercase tracking-wider"
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                    width: '70px',
                  }}
                >
                  {t.tva}
                </th>
                <th
                  className={`${isRtl ? 'text-left' : 'text-right'} text-xs uppercase tracking-wider`}
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                  }}
                >
                  {t.total}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((item, idx) => {
                const qty = Number.isFinite(item.qty) ? item.qty : 1;
                const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
                const tvaRate = Number.isFinite(item.tvaRate) ? item.tvaRate : 0;
                const base = qty * unitPrice;
                const tva = (base * tvaRate) / 100;
                const total = base + tva;
                const isStriped = idx % 2 === 1 && template.table.striped;

                return (
                  <tr
                    key={item.lineId}
                    style={{
                      backgroundColor: isStriped ? tableStyles.stripe.backgroundColor : '#ffffff',
                      borderTop: `${tableStyles.cell.borderWidth}px solid ${tableStyles.cell.borderColor}`,
                    }}
                  >
                    <td
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      <div className="font-medium text-slate-900">
                        {item.label || '—'}
                      </div>
                      {item.description && (
                        <div className="mt-1 text-xs text-slate-500">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td
                      className="text-center font-mono text-slate-700"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {qty}
                    </td>
                    <td
                      className="text-center text-slate-600"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {item.unit || '—'}
                    </td>
                    <td
                      className={`font-mono text-slate-700 ${isRtl ? 'text-left' : 'text-right'}`}
                      dir="ltr"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {formatMoney(locale, unitPrice)}
                    </td>
                    <td
                      className="text-center font-mono text-slate-500"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {tvaRate}%
                    </td>
                    <td
                      className={`font-mono font-semibold text-slate-900 ${isRtl ? 'text-left' : 'text-right'}`}
                      dir="ltr"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {formatMoney(locale, total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Totals ─── */}
      <div className="mt-6 flex justify-end px-5">
        <div
          className="w-full max-w-sm overflow-hidden rounded-xl"
          style={{
            backgroundColor: totalsStyles.container.backgroundColor,
            border: `1px solid ${totalsStyles.container.borderColor}`,
          }}
        >
          {/* Subtotal */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              fontSize: `${totalsStyles.row.fontSize}pt`,
              color: totalsStyles.row.color,
            }}
          >
            <span className="text-slate-600">{t.subtotal}</span>
            <span className="font-mono font-medium text-slate-900" dir="ltr">
              {formatMoney(locale, totals.subtotal)}
            </span>
          </div>

          {/* TVA */}
          <div
            className="flex items-center justify-between border-t px-4 py-3"
            style={{
              fontSize: `${totalsStyles.row.fontSize}pt`,
              borderColor: totalsStyles.container.borderColor,
            }}
          >
            <span className="text-slate-600">{t.tva}</span>
            <span className="font-mono font-medium text-slate-900" dir="ltr">
              {formatMoney(locale, totals.tvaTotal)}
            </span>
          </div>

          {/* Discount (if any) */}
          {totals.discountAmount > 0 && (
            <div
              className="flex items-center justify-between border-t px-4 py-3"
              style={{
                fontSize: `${totalsStyles.row.fontSize}pt`,
                borderColor: totalsStyles.container.borderColor,
              }}
            >
              <span className="text-slate-600">{t.discount}</span>
              <span className="font-mono font-medium text-red-600" dir="ltr">
                -{formatMoney(locale, totals.discountAmount)}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{
              backgroundColor: totalsStyles.grandTotal.backgroundColor,
              color: totalsStyles.grandTotal.color,
              fontSize: `${totalsStyles.grandTotal.fontSize}pt`,
            }}
          >
            <span className="font-semibold">{t.grandTotal}</span>
            <span
              className="font-mono"
              dir="ltr"
              style={{ fontWeight: totalsStyles.grandTotal.fontWeight }}
            >
              {formatMoney(locale, totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Amount in Words ─── */}
      {showTafqit && totals.total > 0 && (
        <div className="mt-5 px-5">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: cardStyles.backgroundColor,
              border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: template.accentColor }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {t.totalInWords}
              </span>
            </div>
            <div
              className="mt-2 font-arabic text-slate-800"
              style={{ fontSize: `${template.typography.body.fontSize}pt` }}
              dir="rtl"
            >
              {tafqit(Math.round(totals.total), { language: 'ar', currency: 'DZD' })} دينار جزائري
            </div>
          </div>
        </div>
      )}

      {/* ─── Notes ─── */}
      {draft.notes && (
        <div className="mt-4 px-5">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: cardStyles.backgroundColor,
              border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: template.accentColor }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.notes}
              </span>
            </div>
            <div
              className="mt-2 whitespace-pre-wrap text-slate-700"
              style={{ fontSize: `${template.typography.body.fontSize}pt` }}
            >
              {draft.notes}
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <div
        className="mt-6 px-5 py-4"
        style={{
          backgroundColor: template.footer.backgroundColor,
        }}
      >
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            {draft.seller?.name && (
              <span className="font-medium text-slate-600">
                {draft.seller.name}
              </span>
            )}
            {draft.seller?.phone && (
              <span className="ml-3">{draft.seller.phone}</span>
            )}
          </div>
          {template.footer.showPageNumbers && (
            <div className="opacity-50">{t.page} 1</div>
          )}
        </div>
      </div>
    </div>
  );
}
