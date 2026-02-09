import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import CompanyProfileForm from '@/components/CompanyProfileForm';

export const dynamic = 'force-dynamic';

type ProfileRow = {
  user_id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  rc: string | null;
  nif: string | null;
};

export default async function CompanySettingsPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const {data: profile, error} = await supabase
    .from('profiles')
    .select('user_id, name, address, phone, email, rc, nif')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>();

  // ✅ إذا وقع خطأ في RLS أو أي شيء: نظهره بدل crash
  if (error) {
    return (
      <pre className="rounded-xl border bg-white p-4 text-sm text-red-700">
        Failed to load profile:
        {'\n'}
        {error.message}
      </pre>
    );
  }

  // ✅ نطبع null -> '' حتى ما يطيحش الفورم
  const normalized = profile
    ? {
        user_id: user.id,
        name: profile.name ?? '',
        address: profile.address ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        rc: profile.rc ?? '',
        nif: profile.nif ?? ''
      }
    : null;

  return (
    <CompanyProfileForm
      locale={locale}
      userId={user.id}
      initialProfile={normalized}
    />
  );
}
