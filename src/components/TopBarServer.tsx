import Link from 'next/link';
import BackButton from '@/components/BackButton';
import {createClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TopBarServer({locale}: {locale: string}) {
  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();

  return (
    <div className="no-print border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref={`/${locale}/documents`} />

          <Link href={`/${locale}/documents`} className="text-sm font-semibold">
            AtlasKit
          </Link>

          <div className="hidden text-xs opacity-60 sm:block">
            {user?.email ?? '—'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/documents/new`}
            className="rounded-xl bg-black px-3 py-2 text-sm text-white"
          >
            New
          </Link>

          <Link
            href={`/${locale}/clients`}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Clients
          </Link>

          <Link
            href={`/${locale}/templates`}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Templates
          </Link>

          <Link
            href={`/${locale}/logout`}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
