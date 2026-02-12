'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';

import InvoicePreview from '@/components/InvoicePreview';
import ClientPicker from '@/components/ClientPicker';
import LineItemsEditor from '@/components/LineItemsEditor';
import ProductPickerModal, {type CatalogProduct} from '@/components/ProductPickerModal';

import {
  type DocDraft,
  type Template,
  genLineId,
  normalizeDevisDraft
} from '@/lib/docDraft';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(v?: string | null): v is string {
  return !!v && UUID_RE.test(v);
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function DocumentBuilder({
  docId,
  initialDraft,
  initialTemplate
}: {
  docId?: string; // optional (أحيانًا الصفحة تمرره وأحيانًا نأخذه من الـURL)
  initialDraft: DocDraft;
  initialTemplate: Template;
}) {
  const locale = useLocale();
  const t = useTranslations('builder');
  const params = useParams<{id?: string}>();

  // ✅ خذ الـid إمّا من props أو من URL
  const effectiveId = useMemo(() => {
    const fromProp = isUuid(docId) ? docId : null;
    const fromUrl = isUuid(params?.id) ? (params.id as string) : null;
    return fromProp ?? fromUrl;
  }, [docId, params]);

  const [draft, setDraft] = useState<DocDraft>(() => normalizeDevisDraft(initialDraft));
  const [template, setTemplate] = useState<Template>(initialTemplate);

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  // Catalog modal
  const [catalogOpen, setCatalogOpen] = useState(false);

  // title مبني على رقم الوثيقة
  const title = useMemo(() => {
    const n = draft.number.trim();
    return n ? n : 'Untitled';
  }, [draft.number]);

  async function saveNow(): Promise<boolean> {
    if (!effectiveId) {
      setSaveState('error');
      setSaveError('Invalid document id. Please open a document with a valid UUID.');
      return false;
    }

    setSaveState('saving');
    setSaveError(null);

    const res = await fetch(`/api/documents/${effectiveId}`, {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        title,
        content: draft,
        template
      })
    });

    const json: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        typeof json === 'object' && json && 'error' in json && typeof (json as any).error === 'string'
          ? (json as any).error
          : 'Save failed';
      setSaveState('error');
      setSaveError(errMsg);
      return false;
    }

    // في بعض APIs ترجع {ok:false}
    if (typeof json === 'object' && json && 'ok' in json && (json as any).ok === false) {
      const errMsg =
        'error' in json && typeof (json as any).error === 'string' ? (json as any).error : 'Save failed';
      setSaveState('error');
      setSaveError(errMsg);
      return false;
    }

    setSaveState('saved');
    return true;
  }

  // Auto-save (debounced) — ✅ فقط إذا عندنا UUID صحيح
  useEffect(() => {
    if (!effectiveId) return;

    setSaveState('saving');
    setSaveError(null);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      await saveNow();
    }, 700);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, template, effectiveId]);

  function openPrintPreview() {
    if (!effectiveId) return;

    // نفتح نافذة أولاً لتفادي pop-up block
    const w = window.open('about:blank', '_blank');

    (async () => {
      const ok = await saveNow();
      if (!ok) {
        if (w) w.close();
        return;
      }
      const url = `/${locale}/documents/${effectiveId}/print`;
      if (w) w.location.href = url;
      else window.open(url, '_blank');
    })();
  }

  function quickPrint() {
    if (!effectiveId) return;
    window.open(`/${locale}/documents/${effectiveId}/print`, '_blank');
  }

  const statusLabel =
    saveState === 'saving'
      ? t('saving')
      : saveState === 'saved'
      ? t('saved')
      : saveState === 'error'
      ? t('saveError')
      : '';

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left: Editor */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{t('title')}</div>

          <div className="flex items-center gap-3">
            <div className="text-xs opacity-70">{statusLabel}</div>
            {saveState === 'error' && saveError ? (
              <div className="max-w-[320px] truncate text-xs text-red-600" title={saveError}>
                {saveError}
              </div>
            ) : null}

            <button
              type="button"
              disabled={!effectiveId || saveState === 'saving'}
              onClick={saveNow}
              className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            >
              {t('save')}
            </button>
          </div>
        </div>

        {/* Doc Number */}
        <div className="grid gap-2">
          <label className="text-sm opacity-70">{t('docNumber')}</label>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            value={draft.number}
            onChange={(e) => setDraft((d) => ({...d, number: e.target.value}))}
          />
        </div>

        {/* Actions: Print + Template */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPrintPreview}
            disabled={!effectiveId}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {t('openPrintPreview')}
          </button>

          <button
            type="button"
            onClick={quickPrint}
            disabled={!effectiveId}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
          >
            {t('quickPrint')}
          </button>

          <select
            className="ml-auto rounded-xl border px-3 py-2 text-sm"
            value={template}
            onChange={(e) => setTemplate(e.target.value as Template)}
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
          </select>
        </div>

        {/* Client Picker */}
        <div className="mt-4">
          <ClientPicker
            onPick={(c) => {
              if (!c) {
                setDraft((d) => ({
                  ...d,
                  client: {name: '', phone: '', address: '', email: ''}
                }));
                return;
              }

              setDraft((d) => ({
                ...d,
                client: {
                  name: c.name ?? '',
                  phone: c.phone ?? '',
                  address: c.address ?? '',
                  email: c.email ?? ''
                }
              }));
            }}
          />
        </div>

        {/* Line Items Editor + Catalog */}
        <div className="mt-4">
          <LineItemsEditor
            locale={locale}
            items={draft.items}
            onChange={(items) => setDraft((d) => ({...d, items}))}
            onOpenCatalog={() => setCatalogOpen(true)}
          />
        </div>

        {/* Notes */}
        <div className="mt-4 grid gap-2">
          <label className="text-sm opacity-70">{t('notes')}</label>
          <textarea
            className="min-h-[90px] rounded-xl border px-3 py-2 text-sm"
            value={draft.notes ?? ''}
            onChange={(e) => setDraft((d) => ({...d, notes: e.target.value}))}
          />
        </div>

        {/* Debug */}
        <div className="mt-3 text-xs opacity-50">docId: {effectiveId ?? '(missing)'}</div>

        {/* Catalog Modal */}
        <ProductPickerModal
          open={catalogOpen}
          locale={locale}
          onClose={() => setCatalogOpen(false)}
          onPick={(p: CatalogProduct) => {
            setDraft((d) => ({
              ...d,
              items: [
                {
                  lineId: genLineId(),
                  productRefId: p.id,
                  label: p.name,
                  description: p.description,
                  qty: 1,
                  unit: p.unit,
                  unitPrice: Number(p.price ?? 0),
                  tvaRate: Number(p.tva ?? 0)
                },
                ...d.items
              ]
            }));
            setCatalogOpen(false);
          }}
        />
      </div>

      {/* Right: Preview */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-sm font-semibold">{t('preview')}</div>
        <InvoicePreview locale={locale} draft={draft} template={template} />
      </div>
    </div>
  );
}
