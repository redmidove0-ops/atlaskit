// src/components/DevisPreview.tsx
// ────────────────────────────────────────────────────────────────
// AtlasKit — Document Preview Component
// Renders document preview using template system
// ────────────────────────────────────────────────────────────────

import { type DevisDraft } from '@/lib/docDraft';
import { type TemplateId } from '@/lib/design';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';

interface DevisPreviewProps {
  locale: string;
  draft: DevisDraft;
  template: TemplateId;
  showTafqit?: boolean;
}

export default function DevisPreview({
  locale,
  draft,
  template,
  showTafqit = true,
}: DevisPreviewProps) {
  // Route to the appropriate template component
  if (template === 'modern') {
    return (
      <ModernTemplate
        locale={locale}
        draft={draft}
        showTafqit={showTafqit}
      />
    );
  }

  // Default to classic template
  return (
    <ClassicTemplate
      locale={locale}
      draft={draft}
      showTafqit={showTafqit}
    />
  );
}
