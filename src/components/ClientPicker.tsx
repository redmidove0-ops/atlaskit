'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';

export type ClientLite = {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
};

export default function ClientPicker({
  onPick
}: {
  onPick: (client: ClientLite | null) => void;
}) {
  const locale = useLocale();
  const t = useTranslations('builder');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientLite[]>([]);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/clients?limit=200`, {cache: 'no-store'});
      const json = (await res.json()) as {ok: boolean; error: string | null; data: ClientLite[] | null};
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Failed');
      setClients(json.data ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return clients;
    return clients.filter((c) => {
      const hay = `${c.name} ${c.phone} ${c.email} ${c.address}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [clients, q]);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{t('clientTitle')}</div>
          <div className="text-xs opacity-70">{t('clientHint')}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPick(null)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {t('clearClient')}
          </button>

          <Link href={`/${locale}/clients`} className="rounded-xl border px-3 py-2 text-sm">
            {t('manageClients')}
          </Link>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('pickClient')}
          className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
        />
        <button type="button" onClick={load} className="rounded-xl border px-3 py-2 text-sm">
          ↻
        </button>
      </div>

      {loading ? <div className="mt-3 text-sm opacity-70">…</div> : null}
      {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}

      <div className="mt-3 max-h-64 overflow-auto rounded-xl border">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm opacity-70">No clients.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{c.name || '—'}</div>
                  <div className="truncate text-xs opacity-70">
                    {[c.phone, c.email, c.address].filter(Boolean).join(' • ') || '—'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="rounded-xl bg-black px-3 py-2 text-sm text-white"
                >
                  {t('pick')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
