// src/components/templates/ClassicTemplate.tsx
// ────────────────────────────────────────────────────────────────
// AtlasKit — Classic Template Component
// Traditional government document style with green header
// ────────────────────────────────────────────────────────────────

'use client';

import { type DevisDraft, calcDevisTotals } from '@/lib/docDraft';
import {
  CLASSIC_TEMPLATE,
  getTemplateHeaderStyles,
  getTemplateTableStyles,
  getTemplateTotalsStyles,
  getTemplateCardStyles,
} from '@/lib/design';
import { tafqit } from '@/lib/tafqit';

interface ClassicTemplateProps {
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

export default function ClassicTemplate({
  locale,
  draft,
  showTafqit = true,
}: ClassicTemplateProps) {
  const template = CLASSIC_TEMPLATE;
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
      className="print-sheet bg-white"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isRtl
          ? 'var(--font-arabic)'
          : 'var(--font-latin)',
      }}
    >
      {/* ─── Header ─── */}
      <div
        className="flex items-center justify-between"
        style={{
          backgroundColor: headerStyles.backgroundColor,
          color: headerStyles.color,
          padding: `${headerStyles.paddingTop}px ${headerStyles.paddingRight}px ${headerStyles.paddingBottom}px ${headerStyles.paddingLeft}px`,
          borderBottom: headerStyles.borderBottom,
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div className="flex-1">
          <div
            className="font-bold"
            style={{
              fontSize: `${template.typography.title.fontSize}pt`,
              textTransform: template.typography.title.textTransform,
            }}
          >
            {docTitle}
          </div>
          <div
            className="mt-1 opacity-90"
            style={{ fontSize: `${template.typography.body.fontSize}pt` }}
          >
            {t.number}: {draft.number}
          </div>
        </div>
        <div
          className="text-end"
          style={{ fontSize: `${template.typography.body.fontSize}pt` }}
        >
          <div className="opacity-90">{t.date}</div>
          <div className="font-semibold">{formatDate(locale, draft.dateISO)}</div>
        </div>
      </div>

      {/* ─── Info Cards ─── */}
      <div className="mt-4 grid grid-cols-2 gap-4 px-4">
        {/* Seller */}
        <div
          style={{
            backgroundColor: cardStyles.backgroundColor,
            borderRadius: `${cardStyles.borderRadius}px`,
            border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
            padding: `${cardStyles.padding}px`,
          }}
        >
          <div
            className="mb-2 font-semibold"
            style={{
              fontSize: `${template.typography.sectionHeader.fontSize}pt`,
              color: template.typography.sectionHeader.color,
              borderBottom: template.typography.sectionHeader.borderBottom
                ? `${template.typography.sectionHeader.borderBottom.width}px solid ${template.typography.sectionHeader.borderBottom.color}`
                : undefined,
              paddingBottom: '4px',
            }}
          >
            {t.seller}
          </div>
          <div style={{ fontSize: `${template.typography.body.fontSize}pt` }}>
            <div className="font-medium">{draft.seller?.name || '—'}</div>
            <div className="mt-1 opacity-70">{draft.seller?.address || ''}</div>
            <div className="opacity-70">{draft.seller?.phone || ''}</div>
            {draft.seller?.rc && (
              <div className="mt-1 text-xs opacity-60">
                {t.rc}: {draft.seller.rc}
              </div>
            )}
            {draft.seller?.nif && (
              <div className="text-xs opacity-60">
                {t.nif}: {draft.seller.nif}
              </div>
            )}
          </div>
        </div>

        {/* Client */}
        <div
          style={{
            backgroundColor: cardStyles.backgroundColor,
            borderRadius: `${cardStyles.borderRadius}px`,
            border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
            padding: `${cardStyles.padding}px`,
          }}
        >
          <div
            className="mb-2 font-semibold"
            style={{
              fontSize: `${template.typography.sectionHeader.fontSize}pt`,
              color: template.typography.sectionHeader.color,
              borderBottom: template.typography.sectionHeader.borderBottom
                ? `${template.typography.sectionHeader.borderBottom.width}px solid ${template.typography.sectionHeader.borderBottom.color}`
                : undefined,
              paddingBottom: '4px',
            }}
          >
            {t.client}
          </div>
          <div style={{ fontSize: `${template.typography.body.fontSize}pt` }}>
            <div className="font-medium">{draft.client?.name || '—'}</div>
            <div className="mt-1 opacity-70">{draft.client?.address || ''}</div>
            <div className="opacity-70">{draft.client?.phone || ''}</div>
          </div>
        </div>
      </div>

      {/* ─── Items Table ─── */}
      <div className="mt-6 px-4">
        <div
          className="overflow-hidden rounded-lg"
          style={{ border: `${tableStyles.cell.borderWidth}px solid ${tableStyles.cell.borderColor}` }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: tableStyles.header.backgroundColor,
                  color: tableStyles.header.color,
                }}
              >
                <th
                  className={isRtl ? 'text-right' : 'text-left'}
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                  }}
                >
                  {t.item}
                </th>
                <th
                  className="text-center"
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                    width: '60px',
                  }}
                >
                  {t.qty}
                </th>
                <th
                  className="text-center"
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                    width: '70px',
                  }}
                >
                  {t.unit}
                </th>
                <th
                  className={isRtl ? 'text-left' : 'text-right'}
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                  }}
                >
                  {t.unitPrice}
                </th>
                <th
                  className="text-center"
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                    width: '60px',
                  }}
                >
                  {t.tva}
                </th>
                <th
                  className={isRtl ? 'text-left' : 'text-right'}
                  style={{
                    padding: `${tableStyles.header.paddingVertical}px ${tableStyles.header.paddingHorizontal}px`,
                    fontWeight: tableStyles.header.fontWeight,
                  }}
                >
                  {t.total}
                </th>
              </tr>
            </thead>
            <tbody>
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
                      backgroundColor: isStriped ? tableStyles.stripe.backgroundColor : undefined,
                      borderTop: `${tableStyles.cell.borderWidth}px solid ${tableStyles.cell.borderColor}`,
                    }}
                  >
                    <td
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      <div className="font-medium">{item.label || '—'}</div>
                      {item.description && (
                        <div className="mt-0.5 text-xs opacity-60">{item.description}</div>
                      )}
                    </td>
                    <td
                      className="text-center font-mono"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {qty}
                    </td>
                    <td
                      className="text-center"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {item.unit || '—'}
                    </td>
                    <td
                      className={`font-mono ${isRtl ? 'text-left' : 'text-right'}`}
                      dir="ltr"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {formatMoney(locale, unitPrice)}
                    </td>
                    <td
                      className="text-center font-mono"
                      style={{
                        padding: `${tableStyles.cell.paddingVertical}px ${tableStyles.cell.paddingHorizontal}px`,
                      }}
                    >
                      {tvaRate}%
                    </td>
                    <td
                      className={`font-mono font-medium ${isRtl ? 'text-left' : 'text-right'}`}
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
      <div className="mt-6 flex justify-end px-4">
        <div
          className="w-full max-w-xs rounded-lg"
          style={{
            backgroundColor: totalsStyles.container.backgroundColor,
            border: `1px solid ${totalsStyles.container.borderColor}`,
            overflow: 'hidden',
          }}
        >
          {/* Subtotal */}
          <div
            className="flex justify-between px-4 py-2"
            style={{
              fontSize: `${totalsStyles.row.fontSize}pt`,
              color: totalsStyles.row.color,
            }}
          >
            <span>{t.subtotal}</span>
            <span className="font-mono" dir="ltr">
              {formatMoney(locale, totals.subtotal)}
            </span>
          </div>

          {/* TVA */}
          <div
            className="flex justify-between border-t px-4 py-2"
            style={{
              fontSize: `${totalsStyles.row.fontSize}pt`,
              color: totalsStyles.row.color,
              borderColor: totalsStyles.container.borderColor,
            }}
          >
            <span>{t.tva}</span>
            <span className="font-mono" dir="ltr">
              {formatMoney(locale, totals.tvaTotal)}
            </span>
          </div>

          {/* Discount (if any) */}
          {totals.discountAmount > 0 && (
            <div
              className="flex justify-between border-t px-4 py-2"
              style={{
                fontSize: `${totalsStyles.row.fontSize}pt`,
                color: totalsStyles.row.color,
                borderColor: totalsStyles.container.borderColor,
              }}
            >
              <span>{t.discount}</span>
              <span className="font-mono text-red-600" dir="ltr">
                -{formatMoney(locale, totals.discountAmount)}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div
            className="flex justify-between px-4 py-3"
            style={{
              backgroundColor: totalsStyles.grandTotal.backgroundColor,
              color: totalsStyles.grandTotal.color,
              fontSize: `${totalsStyles.grandTotal.fontSize}pt`,
              fontWeight: totalsStyles.grandTotal.fontWeight,
            }}
          >
            <span>{t.grandTotal}</span>
            <span className="font-mono" dir="ltr">
              {formatMoney(locale, totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Amount in Words ─── */}
      {showTafqit && totals.total > 0 && (
        <div
          className="mx-4 mt-4 rounded-lg p-3"
          style={{
            backgroundColor: cardStyles.backgroundColor,
            border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
          }}
        >
          <div
            className="text-xs font-semibold opacity-70"
            style={{ marginBottom: '4px' }}
          >
            {t.totalInWords}
          </div>
          <div
            className="font-arabic"
            style={{ fontSize: `${template.typography.body.fontSize}pt` }}
            dir="rtl"
          >
            {tafqit(Math.round(totals.total), { language: 'ar', currency: 'DZD' })} دينار جزائري
          </div>
        </div>
      )}

      {/* ─── Notes ─── */}
      {draft.notes && (
        <div
          className="mx-4 mt-4 rounded-lg p-3"
          style={{
            backgroundColor: cardStyles.backgroundColor,
            border: `${cardStyles.borderWidth}px solid ${cardStyles.borderColor}`,
          }}
        >
          <div
            className="text-xs font-semibold opacity-70"
            style={{ marginBottom: '4px' }}
          >
            {t.notes}
          </div>
          <div
            className="whitespace-pre-wrap"
            style={{ fontSize: `${template.typography.body.fontSize}pt` }}
          >
            {draft.notes}
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <div
        className="mt-6 px-4 py-3 text-center text-xs"
        style={{
          color: template.footer.textColor,
          borderTop: template.footer.borderTop
            ? `${template.footer.borderTop.width}px solid ${template.footer.borderTop.color}`
            : undefined,
        }}
      >
        {draft.seller?.name && (
          <div className="opacity-70">{draft.seller.name}</div>
        )}
        {draft.seller?.phone && (
          <div className="opacity-50">{draft.seller.phone}</div>
        )}
      </div>
    </div>
  );
}
