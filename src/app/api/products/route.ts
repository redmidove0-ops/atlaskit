import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  unit: string | null;
  price: string | number | null;
  tva: string | number | null;
  created_at?: string | null;
};

function toNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get('q') ?? '').trim();
  const q = qRaw.replace(/[%_]/g, '');

  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ok: false, error: 'unauthorized', data: []}, {status: 401});
  }

  let query = supabase
    .from('products')
    .select('id, name, description, unit, price, tva, created_at')
    .order('created_at', {ascending: false})
    .limit(50);

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,unit.ilike.%${q}%`);
  }

  const {data, error} = await query;

  if (error) {
    return NextResponse.json({ok: false, error: error.message, data: []}, {status: 500});
  }

  const products = (data ?? []).map((p: ProductRow) => ({
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    unit: p.unit ?? 'pcs',
    price: toNumber(p.price ?? 0),
    tva: toNumber(p.tva ?? 0)
  }));

  return NextResponse.json({ok: true, error: null, data: products});
}
