'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';
import InvoicePreview from '@/components/InvoicePreview';
import type {DocDraft} from '@/lib/docDraft';

type Template = 'classic' | 'modern';

type Props = {
  // نمررهم من السيرفر (أفضل)
  locale?: string;
  docId?: string;
  draft: DocDraft;
  template: Template;
};

export default function PrintDocClient({locale, docId, draft, template}: Props) {
  // ✅ fallback: إذا ما وصلوش من props نجيبوهم من URL
  const params = useParams<{locale?: string; id?: string}>();

  const effectiveLocale = locale ?? params?.locale ?? 'en';
  const effectiveId = docId ?? params?.id;

  const backHref = effectiveId
    ? `/${effectiveLocale}/documents/${effectiveId}`
    : `/${effectiveLocale}/documents`;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top bar: no-print */}
      <div className="no-print sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <div className="text-sm font-semibold">Print</div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-black px-3 py-2 text-sm text-white"
            >
              Print / Save PDF
            </button>

            {/* ✅ Back الصحيح: يرجع للمحرّر مباشرة (مش history) */}
            <Link
              href={backHref}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* InvoicePreview عندك صار Wrapper لـ DevisPreview */}
        <InvoicePreview locale={effectiveLocale} draft={draft} template={template} />
      </div>
    </div>
  );
}
