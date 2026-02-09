import {createServerClient} from '@supabase/ssr';
import {NextRequest, NextResponse} from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  if (!url || !key) throw new Error('Missing Supabase env vars');

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value, options}) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  // مهم: هذا يضمن التعامل الصحيح مع توكنات الجلسة على السيرفر
  await supabase.auth.getClaims();

  return response;
}
