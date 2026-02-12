'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';
import {routes} from '@/lib/routes';

export default function LoginForm() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const supabase = createClient();

    try {
      const res =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({email, password})
          : await supabase.auth.signUp({email, password});

      if (res.error) {
        setErr(res.error.message); // رسائل Supabase تبقى EN حاليا (لاحقًا نترجمها)
        return;
      }

      router.push(routes.documents(locale));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="grid gap-1 text-sm">
        <span className="opacity-70">{t('email')}</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="opacity-70">{t('password')}</span>
        <input
          className="rounded-xl border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
      </label>

      {err ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        type="submit"
      >
        {loading ? t('loading') : mode === 'login' ? t('login') : t('createAccount')}
      </button>

      <button
        type="button"
        className="w-full rounded-xl border px-4 py-2 text-sm"
        onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
      >
        {mode === 'login' ? t('needAccount') : t('haveAccount')}
      </button>
    </form>
  );
}
