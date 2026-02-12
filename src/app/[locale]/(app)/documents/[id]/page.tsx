import {notFound, redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import DocumentBuilder from '@/components/DocumentBuilder';
import {createDefaultDraft, type DocDraft} from '@/lib/docDraft';
import {routes} from '@/lib/routes';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function DocumentPage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;

  // Validate UUID format before querying to avoid PostgreSQL type errors
  if (!UUID_RE.test(id)) return notFound();

  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect(routes.login(locale));

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
