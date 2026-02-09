import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PUT(req: Request, ctx: any) {
  // ✅ Next.js 16: params قد تكون Promise
  const rawParams = ctx?.params;
  const params = rawParams && typeof rawParams.then === 'function' ? await rawParams : rawParams;

  const id = params?.id as string | undefined;

  if (!id || id === 'undefined' || !UUID_RE.test(id)) {
    return NextResponse.json(
      {ok: false, error: 'Invalid document id', received: id ?? null},
      {status: 400}
    );
  }

  const supabase = await createClient();

  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ok: false, error: 'Invalid JSON'}, {status: 400});
  }

  const title = (body.title ?? 'Untitled') as string;
  const content = body.content ?? {};
  const template = (body.template ?? 'modern') as string;

  const {error} = await supabase
    .from('documents')
    .update({title, content, template})
    .eq('id', id);

  if (error) {
    return NextResponse.json({ok: false, error: error.message}, {status: 400});
  }

  return NextResponse.json({ok: true});
}
