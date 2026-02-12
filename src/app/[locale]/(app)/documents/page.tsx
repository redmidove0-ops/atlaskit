import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {routes} from '@/lib/routes';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({
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
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) redirect(routes.login(locale));

  let query = supabase
    .from('documents')
    .select('id, title, template, created_at')
    .order('created_at', {ascending: false})
    .limit(50);

  if (q) query = query.ilike('title', `%${q}%`);

  const {data, error} = await query;

  if (error) {
    return (
      <pre className="rounded-xl border bg-white p-4 text-sm text-red-700">
        {error.message}
      </pre>
    );
  }

  const docs = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <form className="flex-1" action={routes.documents(locale)} method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search documents…"
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
          />
        </form>

        <Link
          href={routes.documentNew(locale)}
          className="rounded-xl bg-black px-3 py-2 text-sm text-white"
        >
          New
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-xl border bg-white p-4 text-sm opacity-70">
          No documents yet. Click <b>New</b>.
        </div>
      ) : (
        <div className="grid gap-3">
          {docs.map((d) => (
            <Link
              key={d.id}
              href={routes.document(locale, d.id)}
              className="block rounded-xl border bg-white p-4 hover:bg-gray-50"
            >
              <div className="text-sm font-semibold">{d.title ?? 'Untitled'}</div>
              <div className="mt-1 text-xs opacity-60">
                {d.template ?? 'modern'} • {new Date(d.created_at).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
