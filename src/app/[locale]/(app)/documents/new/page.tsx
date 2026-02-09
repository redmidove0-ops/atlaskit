import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {createClient} from '@/lib/supabase/server';
import {createDefaultDraft} from '@/lib/docDraft';

export const dynamic = 'force-dynamic';

export default async function NewDocumentPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const cookieStore = await cookies();
  const preferred = cookieStore.get('atlaskit_template')?.value;
  const template = preferred === 'classic' || preferred === 'modern' ? preferred : 'modern';

  const draft = createDefaultDraft();

  // ✅ جلب بروفايل الشركة وتطبيقه على seller
  const {data: profile} = await supabase
    .from('profiles')
    .select('name, address, phone, email, rc, nif')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile) {
    draft.seller = {
      name: profile.name ?? '',
      address: profile.address ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      rc: profile.rc ?? '',
      nif: profile.nif ?? ''
    };
  }

  const {data, error} = await supabase
    .from('documents')
    .insert({
      title: draft.number || 'Untitled',
      content: draft,
      template
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    return (
      <pre className="rounded-xl border bg-white p-4 text-sm text-red-700">
        Failed to create document:
        {'\n'}
        {error?.message ?? 'Unknown error'}
      </pre>
    );
  }

  redirect(`/${locale}/documents/${data.id}`);
}
