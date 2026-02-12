import {NextResponse, type NextRequest} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ClientRow = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at: string | null;
};

function sanitizeQ(q: string) {
  // تجنب مشاكل or() مع فواصل/رموز
  return q.replace(/[,%]/g, ' ').trim();
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ok: false, error: 'Unauthorized', data: null}, {status: 401});
  }

  const url = new URL(req.url);
  const q = sanitizeQ(url.searchParams.get('q') ?? '');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 200), 500);

  let query = supabase
    .from('clients')
    .select('id, name, phone, address, email, created_at')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(limit);

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,address.ilike.%${q}%`
    );
  }

  const {data, error} = await query;

  if (error) {
    return NextResponse.json({ok: false, error: error.message, data: null}, {status: 400});
  }

  const clients = (data ?? []).map((c: ClientRow) => ({
    id: c.id,
    name: c.name ?? '',
    phone: c.phone ?? '',
    address: c.address ?? '',
    email: c.email ?? ''
  }));

  return NextResponse.json({ok: true, error: null, data: clients});
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ok: false, error: 'Unauthorized', data: null}, {status: 401});
  }

  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ok: false, error: 'Invalid body', data: null}, {status: 400});
  }

  const name = typeof (body as any).name === 'string' ? (body as any).name.trim() : '';
  const phone = typeof (body as any).phone === 'string' ? (body as any).phone.trim() : '';
  const address = typeof (body as any).address === 'string' ? (body as any).address.trim() : '';
  const email = typeof (body as any).email === 'string' ? (body as any).email.trim() : '';

  if (!name) {
    return NextResponse.json({ok: false, error: 'Name is required', data: null}, {status: 400});
  }

  const {data, error} = await supabase
    .from('clients')
    .insert({user_id: user.id, name, phone, address, email})
    .select('id, name, phone, address, email')
    .single();

  if (error) {
    return NextResponse.json({ok: false, error: error.message, data: null}, {status: 400});
  }

  return NextResponse.json({ok: true, error: null, data});
}
