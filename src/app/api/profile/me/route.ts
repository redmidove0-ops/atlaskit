import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {data: {user}} = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ok: false, error: 'Unauthorized', data: null}, {status: 401});
  }

  const {data, error} = await supabase
    .from('profiles')
    .select('name, address, phone, email, rc, nif')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ok: false, error: error.message, data: null}, {status: 400});
  }

  return NextResponse.json({ok: true, error: null, data: data ?? null});
}
