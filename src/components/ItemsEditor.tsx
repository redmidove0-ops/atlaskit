'use client';

import LineItemsEditor from '@/components/LineItemsEditor';
import type {LineItem} from '@/lib/docDraft';

export default function ItemsEditor(props: {
  locale: string;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  onOpenCatalog?: () => void;
}) {
  return <LineItemsEditor {...props} />;
}
