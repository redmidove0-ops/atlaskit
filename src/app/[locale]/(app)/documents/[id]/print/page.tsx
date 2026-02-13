import {notFound, redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {createDefaultDraft, type DocDraft} from '@/lib/docDraft';
import PrintDocClient from '@/components/PrintDocClient';
import {routes} from '@/lib/routes';
import {isValidUuid} from '@/lib/uuid';

export default async function PrintDocumentPage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;

  // Validate UUID format before querying to avoid PostgreSQL type errors
  if (!isValidUuid(id)) return notFound();

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
    <div className="mx-auto max-w-3xl px-4 py-6">
      <PrintDocClient locale={locale} draft={draft} template={template} />
    </div>
  );
}
