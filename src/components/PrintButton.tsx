'use client';

import {useRouter} from 'next/navigation';

export default function PrintButton() {
  const router = useRouter();

  return (
    <div className="no-print flex gap-2">
      <button
        onClick={() => window.print()}
        className="rounded-xl bg-black px-4 py-2 text-sm text-white"
      >
        Print / Save PDF
      </button>
      <button
        onClick={() => router.back()}
        className="rounded-xl border px-4 py-2 text-sm"
      >
        Back
      </button>
    </div>
  );
}
