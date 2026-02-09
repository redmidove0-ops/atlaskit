'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';

import InvoicePreview from '@/components/InvoicePreview';
import ClientPicker from '@/components/ClientPicker';
import {type DocDraft} from '@/lib/docDraft';

type Template = 'classic' | 'modern';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(v?: string | null): v is string {
  return !!v && UUID_RE.test(v);
}

export default function DocumentBuilder({
  docId,
  initialDraft,
  initialTemplate
}: {
  docId?: string; // نخليه optional باش ما يطيحش لو اتنادى من مكان آخر
  initialDraft: DocDraft;
  initialTemplate: Template;
}) {
  const locale = useLocale();
  const t = useTranslations('builder');
  const params = useParams<{id?: string}>();

  // ✅ خذ الـid إما من props أو من الـURL (أقوى)
  const effectiveId =
    isUuid(docId) ? docId : isUuid(params?.id) ? (params.id as string) : null;

  const [draft, setDraft] = useState<DocDraft>(initialDraft);
  const [template, setTemplate] = useState<Template>(initialTemplate);

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const title = useMemo(() => {
    const n = (draft as any)?.number?.trim?.();
    return n ? n : 'Untitled';
  }, [draft]);

  async function saveNow() {
    if (!effectiveId) {
      setSaveState('error');
      setSaveError('No valid document id. Open via /documents/new ثم انتقل لوثيقة بـ UUID.');
      return false;
    }

    setSaveState('saving');
    setSaveError(null);

    const res = await fetch(`/api/documents/${effectiveId}`, {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({title, content: draft, template})
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) {
      setSaveState('error');
      setSaveError(json?.error ?? 'Save failed');
      return false;
    }

    setSaveState('saved');
    return true;
  }

  // Auto-save (debounced) — ✅ لا يحفظ إذا ما عندنا UUID صحيح
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
    const w = window.open('about:blank', '_blank');
    (async () => {
      await saveNow();
      if (w) w.location.href = `/${locale}/documents/${effectiveId}/print`;
      else window.open(`/${locale}/documents/${effectiveId}/print`, '_blank');
    })();
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
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{t('title')}</div>

          <div className="flex items-center gap-2">
            <div className="text-xs opacity-70">{statusLabel}</div>
            {saveState === 'error' && saveError ? (
              <div className="text-xs text-red-600">{saveError}</div>
            ) : null}
          </div>
        </div>

        {/* مثال سريع لتعديل رقم الوثيقة */}
        <div className="grid gap-2">
          <label className="text-sm opacity-70">{t('docNumber')}</label>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            value={(draft as any).number ?? ''}
            onChange={(e) => setDraft((d) => ({...(d as any), number: e.target.value}))}
          />
        </div>

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
            disabled={!effectiveId}
            onClick={() => window.open(`/${locale}/documents/${effectiveId}/print`, '_blank')}
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

        <ClientPicker
          onPick={(c) => {
            if (!c) {
              setDraft((d) => ({...(d as any), client: {name: ''}}));
              return;
            }
            setDraft((d) => ({
              ...(d as any),
              client: {
                name: c.name,
                phone: c.phone,
                address: c.address,
                email: c.email
              }
            }));
          }}
        />

        {/* Debug صغير مفيد */}
        <div className="mt-3 text-xs opacity-50">docId: {effectiveId ?? '(missing)'}</div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-sm font-semibold">{t('preview')}</div>
        <InvoicePreview locale={locale} draft={draft} template={template} />
      </div>
    </div>
  );
}
