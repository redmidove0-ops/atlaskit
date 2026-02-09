import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ClientsList from '@/components/ClientsList';

export const dynamic = 'force-dynamic';

type ClientRow = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at: string | null;
};

export default async function ClientsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{q?: string}>;
}) {
  const {locale} = await params;
  const sp = await searchParams;
  const q = (sp?.q ?? '').trim();

  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  let query = supabase
    .from('clients')
    .select('id, name, phone, address, email, created_at')
    .order('created_at', {ascending: false})
    .limit(200);

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,address.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const {data, error} = await query;

  if (error) {
    return (
      <pre className="rounded-xl border bg-white p-4 text-sm text-red-700">
        Failed to load clients:
        {'\n'}
        {error.message}
      </pre>
    );
  }

  const clients = (data ?? []).map((c: ClientRow) => ({
    id: c.id,
    name: c.name ?? '',
    phone: c.phone ?? '',
    address: c.address ?? '',
    email: c.email ?? '',
    created_at: c.created_at ?? ''
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Clients</h1>
          <p className="text-sm opacity-70">دفتر الزبائن لاختيارهم بسرعة داخل Devis.</p>
        </div>

        <Link href={`/${locale}/documents`} className="rounded-xl border px-3 py-2 text-sm">
          ← Back
        </Link>
      </div>

      {/* بحث Server واحد (بدون تكرار) */}
      <form action={`/${locale}/clients`} method="get" className="flex items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search clients…"
          className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-xl border px-3 py-2 text-sm">
          Search
        </button>
        {q ? (
          <Link href={`/${locale}/clients`} className="rounded-xl border px-3 py-2 text-sm">
            Clear
          </Link>
        ) : null}
      </form>

      {/* ✅ نمرّر userId هنا */}
      <ClientsList locale={locale} userId={user.id} initialClients={clients} />
    </div>
  );
}
