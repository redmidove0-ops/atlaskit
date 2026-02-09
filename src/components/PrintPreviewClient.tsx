'use client';

import {useEffect, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';

import InvoicePreview from '@/components/InvoicePreview';
import PrintButton from '@/components/PrintButton';
import {createDefaultDraft, type DocDraft} from '@/lib/docDraft';
import {DRAFT_KEY} from '@/lib/storageKeys';
type Payload = {
  draft: DocDraft;
  template: 'classic' | 'modern';
};

const STORAGE_KEY = DRAFT_KEY;

export default function PrintPreviewClient() {
  const locale = useLocale();
  const t = useTranslations('builder');

  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setPayload({draft: createDefaultDraft(), template: 'classic'});
        return;
      }
      const parsed = JSON.parse(raw) as Payload;
      setPayload(parsed);
    } catch {
      setPayload({draft: createDefaultDraft(), template: 'classic'});
    }
  }, []);

  const draft = payload?.draft;
  const template = payload?.template ?? 'classic';

  const ready = useMemo(() => Boolean(draft), [draft]);

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between gap-3">
        <div className="text-sm opacity-70">{t('printPreviewTitle')}</div>
        <PrintButton />
      </div>

      {!ready ? (
        <div className="rounded-2xl border p-6 text-sm opacity-70">
          {t('loading')}
        </div>
      ) : (
        <InvoicePreview locale={locale} draft={draft!} template={template} />
      )}
    </div>
  );
}
