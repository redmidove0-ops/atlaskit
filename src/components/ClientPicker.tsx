'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at?: string;
};

export default function ClientPicker({
  locale,
  valueId,
  onPick
}: {
  locale: string;
  valueId?: string | null;
  onPick: (picked: {id: string; client: {name: string; phone?: string; address?: string; email?: string}} | null) => void;
}) {
  const supabase = createClient();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const {data, error} = await supabase
        .from('clients')
        .select('id, name, phone, address, email, created_at')
        .order('created_at', {ascending: false})
        .limit(200);

      if (error) setErr(error.message);
      setClients((data ?? []) as any);
      setLoading(false);
    })();
  }, [supabase]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) =>
      [c.name, c.phone ?? '', c.address ?? '', c.email ?? '']
        .join(' ')
        .toLowerCase()
        .includes(s)
    );
  }, [clients, q]);

  function pick(id: string) {
    if (!id) {
      onPick(null);
      return;
    }
    const c = clients.find((x) => x.id === id);
    if (!c) return;

    onPick({
      id: c.id,
      client: {
        name: c.name,
        phone: c.phone ?? '',
        address: c.address ?? '',
        email: c.email ?? ''
      }
    });
  }

  return (
    <div className="mt-4 rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Client</div>
        <Link
          href={`/${locale}/clients`}
          className="rounded-xl border px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          Manage clients
        </Link>
      </div>

      <input
        className="w-full rounded-xl border px-3 py-2 text-sm"
        placeholder="Search client…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <select
        className="w-full rounded-xl border px-3 py-2 text-sm"
        value={valueId ?? ''}
        onChange={(e) => pick(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading…' : 'Select a client…'}</option>
        {filtered.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
