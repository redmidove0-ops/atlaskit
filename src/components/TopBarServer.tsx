import Link from 'next/link';
import BackButton from '@/components/BackButton';
import {createClient} from '@/lib/supabase/server';
import {routes} from '@/lib/routes';

export const dynamic = 'force-dynamic';

export default async function TopBarServer({locale}: {locale: string}) {
  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();

  return (
    <div className="no-print border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref={routes.documents(locale)} />

          <Link href={routes.documents(locale)} className="text-sm font-semibold">
            AtlasKit
          </Link>

          <div className="hidden text-xs opacity-60 sm:block">
            {user?.email ?? '—'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={routes.documentNew(locale)}
            className="rounded-xl bg-black px-3 py-2 text-sm text-white"
          >
            New
          </Link>

          <Link
            href={routes.clients(locale)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Clients
          </Link>

          <Link
            href={routes.templates(locale)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Templates
          </Link>

          <Link
            href={routes.logout(locale)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
