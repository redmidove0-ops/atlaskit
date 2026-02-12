import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/lib/routes';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function TopBarServer({ locale }: { locale: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{user?.email ?? '—'}</span>
      </div>

      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.logout(locale)} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
