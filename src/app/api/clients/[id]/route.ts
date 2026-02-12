import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function PATCH(req: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  if (!isUuid(id)) {
    return NextResponse.json({ok: false, error: 'Invalid id', data: null}, {status: 400});
  }

  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ok: false, error: 'Unauthorized', data: null}, {status: 401});
  }

  const body = await req.json().catch(() => ({}));
  const patch: any = {};
  if (body?.name != null) patch.name = String(body.name).trim();
  if (body?.phone != null) patch.phone = String(body.phone).trim() || null;
  if (body?.address != null) patch.address = String(body.address).trim() || null;
  if (body?.email != null) patch.email = String(body.email).trim() || null;

  if (patch.name !== undefined && !patch.name) {
    return NextResponse.json({ok: false, error: 'Name is required', data: null}, {status: 400});
  }

  const {data, error} = await supabase
    .from('clients')
    .update(patch)
    .eq('id', id)
    .select('id,name,phone,address,email,created_at')
    .single();

  if (error) {
    return NextResponse.json({ok: false, error: error.message, data: null}, {status: 400});
  }

  return NextResponse.json({ok: true, error: null, data});
}

export async function DELETE(_req: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  if (!isUuid(id)) {
    return NextResponse.json({ok: false, error: 'Invalid id', data: null}, {status: 400});
  }

  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ok: false, error: 'Unauthorized', data: null}, {status: 401});
  }

  const {error} = await supabase.from('clients').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ok: false, error: error.message, data: null}, {status: 400});
  }

  return NextResponse.json({ok: true, error: null, data: {id}});
}
