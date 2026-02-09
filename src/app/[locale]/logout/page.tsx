import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

export default async function LogoutPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}
