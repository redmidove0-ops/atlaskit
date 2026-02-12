'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at: string | null;
};

function isEmail(v: string) {
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ClientsManager({locale}: {locale: string}) {
  const t = useTranslations('clients');
  const tr = (k: string, fallback: string) => {
    try {
      return t(k as any);
    } catch {
      return fallback;
    }
  };

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<ClientRow[]>([]);

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const canSave = useMemo(() => {
    return name.trim().length >= 2 && isEmail(email.trim());
  }, [name, email]);

  async function loadClients(query: string) {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?q=${encodeURIComponent(query)}`, {cache: 'no-store'});
      const json = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setErr(tr('unauthorized', 'Please login first.'));
        setItems([]);
        return;
      }

      if (!res.ok || json?.ok === false) {
        setErr(json?.error ?? tr('loadFailed', 'Failed to load clients.'));
        setItems([]);
        return;
      }

      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setErr(e?.message ?? tr('loadFailed', 'Failed to load clients.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // initial load + debounce search
  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadClients(q.trim());
    }, 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function openCreate() {
    setMode('create');
    setEditId(null);
    setName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setOpen(true);
  }

  function openEdit(c: ClientRow) {
    setMode('edit');
    setEditId(c.id);
    setName(c.name ?? '');
    setPhone(c.phone ?? '');
    setAddress(c.address ?? '');
    setEmail(c.email ?? '');
    setOpen(true);
  }

  async function save() {
    if (!canSave) return;

    setErr(null);
    setLoading(true);

    try {
      if (mode === 'create') {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            email: email.trim()
          })
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.ok === false) {
          setErr(json?.error ?? tr('saveFailed', 'Save failed.'));
          return;
        }

        setItems((prev) => [json.data as ClientRow, ...prev]);
        setOpen(false);
        return;
      }

      // edit
      if (!editId) {
        setErr(tr('invalidId', 'Invalid id'));
        return;
      }

      const res = await fetch(`/api/clients/${editId}`, {
        method: 'PATCH',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          email: email.trim()
        })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        setErr(json?.error ?? tr('saveFailed', 'Save failed.'));
        return;
      }

      setItems((prev) => prev.map((x) => (x.id === editId ? (json.data as ClientRow) : x)));
      setOpen(false);
    } catch (e: any) {
      setErr(e?.message ?? tr('saveFailed', 'Save failed.'));
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    const ok = window.confirm(tr('confirmDelete', 'Delete this client?'));
    if (!ok) return;

    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${id}`, {method: 'DELETE'});
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.ok === false) {
        setErr(json?.error ?? tr('deleteFailed', 'Delete failed.'));
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e?.message ?? tr('deleteFailed', 'Delete failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tr('searchPlaceholder', 'Search clients…')}
          className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
        />

        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white"
        >
          {tr('addNew', 'Add new client')}
        </button>
      </div>

      {err ? (
        <div className="rounded-xl border bg-white p-3 text-sm text-red-700">
          {err}{' '}
          {err.toLowerCase().includes('login') ? (
            <Link className="underline" href={`/${locale}/login`}>
              {tr('goLogin', 'Go to login')}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 text-sm font-semibold">
          {tr('listTitle', 'Clients')}
          {loading ? <span className="ml-2 text-xs opacity-60">{tr('loading', 'Loading…')}</span> : null}
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-sm opacity-70">{tr('empty', 'No clients yet.')}</div>
        ) : (
          <div className="divide-y">
            {items.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="mt-1 text-xs opacity-70">
                    {[c.phone, c.email, c.address].filter(Boolean).join(' • ')}
                  </div>
                </div>

                <div className="shrink-0 space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="rounded-xl border px-3 py-2 text-sm"
                  >
                    {tr('edit', 'Edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(c.id)}
                    className="rounded-xl border px-3 py-2 text-sm"
                  >
                    {tr('delete', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative mx-auto mt-20 w-[95%] max-w-xl rounded-2xl border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="text-sm font-semibold">
                {mode === 'create' ? tr('createTitle', 'New client') : tr('editTitle', 'Edit client')}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-3 py-2 text-sm">
                {tr('close', 'Close')}
              </button>
            </div>

            <div className="grid gap-3 p-4">
              <div className="grid gap-1">
                <label className="text-xs opacity-70">{tr('name', 'Name')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs opacity-70">{tr('phone', 'Phone')}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs opacity-70">{tr('address', 'Address')}</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs opacity-70">{tr('email', 'Email')}</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                {!isEmail(email.trim()) ? (
                  <div className="text-xs text-red-600">{tr('emailInvalid', 'Invalid email')}</div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm">
                  {tr('cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={!canSave || loading}
                  onClick={() => void save()}
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {loading ? tr('saving', 'Saving…') : tr('save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
