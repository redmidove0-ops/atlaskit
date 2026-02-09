import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import {redirect} from 'next/navigation';

import {
  TEMPLATE_COOKIE,
  DEFAULT_TEMPLATE,
  templates,
  normalizeTemplate
} from '@/lib/templates';

export default async function TemplatesPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{saved?: string}>;
}) {
  const {locale} = await params;
  const sp = await searchParams;

  const t = await getTranslations('templates');

  const current = normalizeTemplate(
    (await cookies()).get(TEMPLATE_COOKIE)?.value ?? DEFAULT_TEMPLATE
  );

  async function setTemplate(formData: FormData) {
    'use server';
    const next = normalizeTemplate(formData.get('template'));

    (await cookies()).set(TEMPLATE_COOKIE, next, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365
    });

    redirect(`/${locale}/templates?saved=1`);
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm opacity-80">{t('subtitle')}</p>
      </div>

      {sp?.saved === '1' && (
        <div className="rounded-2xl border bg-black/5 px-4 py-3 text-sm">
          ✅ {t('saved')}
        </div>
      )}

      <form action={setTemplate} className="rounded-2xl border p-4">
        <div className="text-sm font-semibold">{t('current')}</div>
        <div className="mt-1 text-sm opacity-70">
          {t('currentValue')}: <span className="font-semibold">{current.toUpperCase()}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {templates.map((tpl) => (
            <label
              key={tpl.id}
              className={[
                'cursor-pointer rounded-2xl border p-4',
                tpl.id === current ? 'border-black' : 'hover:bg-black/5'
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{tpl.title}</div>
                  <div className="mt-1 text-sm opacity-70">{tpl.description}</div>
                </div>

                <input
                  type="radio"
                  name="template"
                  value={tpl.id}
                  defaultChecked={tpl.id === current}
                />
              </div>
            </label>
          ))}
        </div>

        <button type="submit" className="mt-4 rounded-xl bg-black px-4 py-2 text-sm text-white">
          {t('save')}
        </button>
      </form>
    </section>
  );
}
