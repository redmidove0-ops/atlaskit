import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  if (!url || !key) throw new Error('Missing Supabase env vars');

  const cookieStore = await cookies();

  // ✅ في Server Components: نقرأ cookies فقط (بدون set)
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // ممنوع تعديل cookies هنا في Next.js 16
      }
    }
  });
}
