'use client';

import {useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type ProfileForm = {
  user_id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rc: string;
  nif: string;
};

export default function CompanyProfileForm({
  locale,
  userId,
  initialProfile
}: {
  locale: string;
  userId: string;
  initialProfile: ProfileForm;
}) {
  const supabase = createClient();

  const [form, setForm] = useState<ProfileForm>({
    ...initialProfile,
    user_id: userId
  });

  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const name = form.name.trim();
    if (!name) {
      setState('error');
      setErr('Name is required');
      return;
    }

    setState('saving');
    setErr(null);

    const payload = {
      user_id: userId,
      name,
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      rc: form.rc.trim(),
      nif: form.nif.trim(),
      updated_at: new Date().toISOString()
    };

    const {error} = await supabase
      .from('profiles')
      .upsert(payload, {onConflict: 'user_id'});

    if (error) {
      setState('error');
      setErr(error.message);
      return;
    }

    setState('saved');
    setTimeout(() => setState('idle'), 1200);
  }

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Company / Seller name *"
          value={form.name}
          onChange={(v) => setForm((f) => ({...f, name: v}))}
        />
        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => setForm((f) => ({...f, phone: v}))}
        />
        <Field
          label="Address"
          value={form.address}
          onChange={(v) => setForm((f) => ({...f, address: v}))}
        />
        <Field
          label="Email"
          value={form.email}
          onChange={(v) => setForm((f) => ({...f, email: v}))}
        />
        <Field
          label="RC (optional)"
          value={form.rc}
          onChange={(v) => setForm((f) => ({...f, rc: v}))}
        />
        <Field
          label="NIF (optional)"
          value={form.nif}
          onChange={(v) => setForm((f) => ({...f, nif: v}))}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={state === 'saving'}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {state === 'saving' ? 'Saving…' : 'Save'}
        </button>

        <div className="text-xs opacity-70">
          {state === 'saved' ? 'Saved ✅' : state === 'idle' ? '' : ''}
        </div>

        {state === 'error' && err ? (
          <div className="text-xs text-red-600">{err}</div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-70">{label}</span>
      <input
        className="rounded-xl border px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
