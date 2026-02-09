import {DOCS_KEY, DRAFT_KEY} from '@/lib/storageKeys';
import type {DocDraft} from '@/lib/docDraft';

export type SavedDoc = DocDraft & {
  id: string;
  createdAt: string; // ISO
};

export function loadDraft(): {draft: DocDraft; template: 'classic' | 'modern'} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(payload: {draft: DocDraft; template: 'classic' | 'modern'}) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function loadDocs(): SavedDoc[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDocs(docs: SavedDoc[]) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
}

export function addDoc(draft: DocDraft): SavedDoc {
  const docs = loadDocs();
  const doc: SavedDoc = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  docs.unshift(doc);
  saveDocs(docs);
  return doc;
}
