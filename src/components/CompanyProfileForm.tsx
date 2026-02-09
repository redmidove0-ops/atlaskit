'use client';

import {useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';

type Profile = {
  user_id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  rc?: string;
  nif?: string;
};

export default function CompanyProfileForm({
  locale,
  userId,
  initialProfile
}: {
  locale: string;
  userId: string;
  initialProfile: Profile | null;
}) {
  const supabase = createClient();

  const [form, setForm] = useState<Profile>({
    user_id: userId,
    name: initialProfile?.name ?? '',
    address: initialProfile?.address ?? '',
    phone: initialProfile?.phone ?? '',
    email: initialProfile?.email ?? '',
    rc: initialProfile?.rc ?? '',
    nif: initialProfile?.nif ?? ''
  });

  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setState('saving');
    setErr(null);

    const {error} = await supabase
      .from('profiles')
      .upsert({
        user_id: form.user_id,
        name: form.name ?? '',
        address: form.address ?? '',
        phone: form.phone ?? '',
        email: form.email ?? '',
        rc: form.rc ?? '',
        nif: form.nif ?? '',
        updated_at: new Date().toISOString()
      });

    if (error) {
      setState('error');
      setErr(error.message);
      return;
    }
    setState('saved');
    setTimeout(() => setState('idle'), 1200);
  }

  const status =
    state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved ✅' : state === 'error' ? 'Error' : '';

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Company Profile</h1>
          <p className="text-sm opacity-70">هذه المعلومات تُملأ تلقائيًا في أي Devis جديد.</p>
        </div>
        <Link href={`/${locale}/documents`} className="rounded-xl border px-3 py-2 text-sm">
          ← Back to documents
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <Field label="Name *">
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
            placeholder="اسم الورشة / الشركة"
          />
        </Field>

        <Field label="Address">
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={form.address ?? ''}
            onChange={(e) => setForm((f) => ({...f, address: e.target.value}))}
            placeholder="العنوان"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Phone">
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={form.phone ?? ''}
              onChange={(e) => setForm((f) => ({...f, phone: e.target.value}))}
              placeholder="0550..."
            />
          </Field>
          <Field label="Email">
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={form.email ?? ''}
              onChange={(e) => setForm((f) => ({...f, email: e.target.value}))}
              placeholder="mail@..."
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="RC">
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={form.rc ?? ''}
              onChange={(e) => setForm((f) => ({...f, rc: e.target.value}))}
              placeholder="RC"
            />
          </Field>
          <Field label="NIF">
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={form.nif ?? ''}
              onChange={(e) => setForm((f) => ({...f, nif: e.target.value}))}
              placeholder="NIF"
            />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!form.name.trim() || state === 'saving'}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Save
          </button>
          <div className="text-xs opacity-70">{status}</div>
          {err ? <div className="text-xs text-red-600">{err}</div> : null}
        </div>
      </div>
    </div>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label className="block space-y-1">
      <div className="text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}
