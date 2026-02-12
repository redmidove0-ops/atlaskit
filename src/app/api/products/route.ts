import {NextRequest, NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ProductRow = {
  id: string;
  user_id: string;
  name: string | null;
  description: string | null;
  unit: string | null;
  price: string | number | null; // numeric من Supabase قد يرجع string
  tva: string | number | null;   // numeric من Supabase قد يرجع string
  created_at: string | null;
};

function toNum(v: unknown, fallback = 0) {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}

// GET /api/products?q=...&limit=...
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {ok: false, error: 'Unauthorized', data: null},
      {status: 401}
    );
  }

  const {searchParams} = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const limit = Math.min(Math.max(toNum(searchParams.get('limit'), 50), 1), 200);

  let query = supabase
    .from('products')
    .select('id, user_id, name, description, unit, price, tva, created_at')
    .eq('user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(limit);

  if (q) {
    // بحث بسيط وفعّال
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,unit.ilike.%${q}%`
    );
  }

  const {data, error} = await query;

  if (error) {
    return NextResponse.json(
      {ok: false, error: error.message, data: null},
      {status: 400}
    );
  }

  const products = (data ?? []).map((p: ProductRow) => ({
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    unit: p.unit ?? 'pcs',
    price: toNum(p.price, 0),
    tva: toNum(p.tva, 0),
    created_at: p.created_at ?? ''
  }));

  return NextResponse.json({ok: true, error: null, data: products});
}

// POST /api/products  (إنشاء منتج/خدمة)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {ok: false, error: 'Unauthorized', data: null},
      {status: 401}
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {ok: false, error: 'Invalid JSON body', data: null},
      {status: 400}
    );
  }

  const b = body as Partial<{
    name: unknown;
    description: unknown;
    unit: unknown;
    price: unknown;
    tva: unknown;
  }>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const description =
    typeof b.description === 'string' ? b.description.trim() : '';
  const unit = typeof b.unit === 'string' ? b.unit.trim() : 'pcs';
  const price = toNum(b.price, 0);
  const tva = toNum(b.tva, 0);

  if (!name) {
    return NextResponse.json(
      {ok: false, error: 'Name is required', data: null},
      {status: 400}
    );
  }
  if (price < 0 || !Number.isFinite(price)) {
    return NextResponse.json(
      {ok: false, error: 'Invalid price', data: null},
      {status: 400}
    );
  }
  if (tva < 0 || tva > 100 || !Number.isFinite(tva)) {
    return NextResponse.json(
      {ok: false, error: 'Invalid TVA', data: null},
      {status: 400}
    );
  }

  const {data, error} = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      unit: unit || null,
      price,
      tva
    })
    .select('id, user_id, name, description, unit, price, tva, created_at')
    .single();

  if (error) {
    return NextResponse.json(
      {ok: false, error: error.message, data: null},
      {status: 400}
    );
  }

  return NextResponse.json({ok: true, error: null, data});
}
