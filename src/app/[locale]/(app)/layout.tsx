import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import AppSidebar from '@/components/AppSidebar';
import TopBarServer from '@/components/TopBarServer';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="no-print">
          <AppSidebar />
        </div>
        <SidebarInset className="flex flex-1 flex-col">
          {/* Top bar */}
          <header className="app-chrome no-print flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ms-2" />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <TopBarServer locale={locale} />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}
