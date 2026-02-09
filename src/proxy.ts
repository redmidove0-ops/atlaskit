import createMiddleware from 'next-intl/middleware';
import {NextRequest} from 'next/server';
import {updateSession} from '@/lib/supabase/proxy';

const handleI18nRouting = createMiddleware({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'fr'
});

export default async function proxy(request: NextRequest) {
  // 1) next-intl يعمل redirect/rewrites للّغة
  const response = handleI18nRouting(request);

  // 2) Supabase يحدث session cookies عند الحاجة
  return await updateSession(request, response);
}

// نفس matcher الموصى به من next-intl (يستثني api/_next والملفات الثابتة) :contentReference[oaicite:3]{index=3}
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
