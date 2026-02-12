'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {loadDocs, type SavedDoc} from '@/lib/localDocs';
import {routes} from '@/lib/routes';

export default function LocalDocumentsList() {
  const locale = useLocale();
  const t = useTranslations('documents');
  const [docs, setDocs] = useState<SavedDoc[]>([]);

  useEffect(() => {
    setDocs(loadDocs());
  }, []);

  if (docs.length === 0) return null;

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 text-sm font-semibold">{t('localSaved')}</div>

      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{d.number}</div>
            </div>

            <Link
              href={routes.documentPreviewPrint(locale)}
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() => {
                // put this doc into draft so preview prints it
                localStorage.setItem('atlaskit_draft_v1', JSON.stringify({draft: d, template: 'classic'}));
              }}
            >
              {t('print')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
