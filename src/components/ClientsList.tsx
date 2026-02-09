'use client';

import {useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type ClientRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  created_at?: string;
};

export default function ClientsList({
  locale,
  userId,
  initialClients
}: {
  locale: string;
  userId: string;
  initialClients: ClientRow[];
}) {
  const supabase = createClient();

  const [clients, setClients] = useState<ClientRow[]>(initialClients);
  const [form, setForm] = useState({name: '', phone: '', address: '', email: ''});
  const [state, setState] = useState<'idle' | 'saving' | 'error' | 'done'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function addClient() {
    if (!form.name.trim()) return;

    setState('saving');
    setErr(null);

    // ✅ أهم سطر: user_id
    const payload = {
      user_id: userId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim()
    };

    const {data, error} = await supabase
      .from('clients')
      .insert(payload)
      .select('id, name, phone, address, email, created_at')
      .single();

    if (error) {
      setState('error');
      setErr(error.message);
      return;
    }

    setClients((prev) => [data as any, ...prev]);
    setForm({name: '', phone: '', address: '', email: ''});
    setState('done');
    setTimeout(() => setState('idle'), 900);
  }

  async function removeClient(id: string) {
    const ok = confirm('Delete this client?');
    if (!ok) return;

    const {error} = await supabase.from('clients').delete().eq('id', id);
    if (!error) setClients((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Add new client</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({...f, phone: e.target.value}))}
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({...f, address: e.target.value}))}
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({...f, email: e.target.value}))}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addClient}
            disabled={!form.name.trim() || state === 'saving'}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Add
          </button>

          <div className="text-xs opacity-70">
            {state === 'saving' ? 'Saving…' : state === 'done' ? 'Added ✅' : ''}
          </div>

          {err ? <div className="text-xs text-red-600">{err}</div> : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-4 text-sm opacity-70">No clients.</div>
        ) : (
          <div className="divide-y">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs opacity-70 truncate">
                    {[c.phone, c.address, c.email].filter(Boolean).join(' • ')}
                  </div>
                </div>
                <button
                  onClick={() => removeClient(c.id)}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
