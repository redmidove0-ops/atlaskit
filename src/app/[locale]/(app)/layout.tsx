import type {ReactNode} from 'react';
import TopBarServer from '@/components/TopBarServer';

// نخليه ديناميكي لأن الـTopBar يعتمد على المستخدم (Auth cookies)
export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <TopBarServer locale={locale} />

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
