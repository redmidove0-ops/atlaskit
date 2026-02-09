import {notFound, redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import DocumentBuilder from '@/components/DocumentBuilder';
import {createDefaultDraft, type DocDraft} from '@/lib/docDraft';

export default async function DocumentPage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;

  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const {data: doc, error} = await supabase
    .from('documents')
    .select('id, content, template')
    .eq('id', id)
    .single();

  if (error || !doc) return notFound();

  const draft = (doc.content ?? createDefaultDraft()) as DocDraft;
  const template =
    doc.template === 'classic' || doc.template === 'modern' ? doc.template : 'modern';

  return (
    <DocumentBuilder docId={doc.id} initialDraft={draft} initialTemplate={template} />
  );
}
