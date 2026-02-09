'use client';

import {useEffect, useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
};

export default function ClientPicker({
  valueId,
  onPick
}: {
  valueId?: string | null;
  onPick: (client: {name: string; phone?: string; address?: string; email?: string} | null) => void;
}) {
  const supabase = createClient();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {data, error} = await supabase
        .from('clients')
        .select('id, name, phone, address, email')
        .order('created_at', {ascending: false})
        .limit(200);

      if (!error) setClients((data ?? []) as any);
      setLoading(false);
    })();
  }, [supabase]);

  function handleChange(id: string) {
    if (!id) {
      onPick(null);
      return;
    }
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    onPick({
      name: c.name,
      phone: c.phone ?? '',
      address: c.address ?? '',
      email: c.email ?? ''
    });
  }

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">Client</div>
      <select
        className="w-full rounded-xl border px-3 py-2 text-sm"
        value={valueId ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading…' : 'Select a client…'}</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="text-xs opacity-60">
        Tip: manage clients in /clients
      </div>
    </div>
  );
}
