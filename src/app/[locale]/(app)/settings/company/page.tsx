import Link from 'next/link';
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

  if (error) {
    return (
      <pre className="rounded-xl border bg-white p-4 text-sm text-red-700">
        Failed to load profile:
        {'\n'}
        {error.message}
      </pre>
    );
  }

  const initialProfile = profile
    ? {
        user_id: user.id,
        name: profile.name ?? '',
        address: profile.address ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        rc: profile.rc ?? '',
        nif: profile.nif ?? ''
      }
    : {
        user_id: user.id,
        name: '',
        address: '',
        phone: '',
        email: '',
        rc: '',
        nif: ''
      };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Company Settings</h1>
          <p className="text-sm opacity-70">
            املأ معلومات البائع مرة واحدة لتظهر تلقائيًا في كل Devis.
          </p>
        </div>

        <Link href={`/${locale}/documents`} className="rounded-xl border px-3 py-2 text-sm">
          ← Back
        </Link>
      </div>

      <CompanyProfileForm locale={locale} userId={user.id} initialProfile={initialProfile} />
    </div>
  );
}
