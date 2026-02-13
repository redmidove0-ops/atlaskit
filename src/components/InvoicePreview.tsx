// src/components/InvoicePreview.tsx
// ────────────────────────────────────────────────────────────────
// AtlasKit — Invoice Preview Component (Legacy Wrapper)
// Wraps DevisPreview for backwards compatibility
// ────────────────────────────────────────────────────────────────

import DevisPreview from '@/components/DevisPreview';
import { type DocDraft, type DevisDraft } from '@/lib/docDraft';
import { type TemplateId } from '@/lib/design';

type Props = {
  locale: string;
  draft: DocDraft;
  template: TemplateId;
  showTafqit?: boolean;
};

export default function InvoicePreview({
  locale,
  draft,
  template,
  showTafqit = true,
}: Props) {
  return (
    <DevisPreview
      locale={locale}
      draft={draft as DevisDraft}
      template={template}
      showTafqit={showTafqit}
    />
  );
}
