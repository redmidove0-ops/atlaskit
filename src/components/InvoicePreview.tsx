import DevisPreview from '@/components/DevisPreview';
import {type DocDraft, type DevisDraft} from '@/lib/docDraft';

type Props = {
  locale: string;
  draft: DocDraft;
  template: 'classic' | 'modern';
};

export default function InvoicePreview({locale, draft, template}: Props) {
  // الآن InvoicePreview مجرد واجهة توافق قديمة، وتحتها DevisPreview
  return (
    <DevisPreview
      locale={locale}
      draft={draft as DevisDraft}
      template={template}
    />
  );
}
