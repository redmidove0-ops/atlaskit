'use client';

import {useRouter} from 'next/navigation';

export default function BackButton({fallbackHref}: {fallbackHref: string}) {
  const router = useRouter();

  function goBack() {
    // إذا ما كانش History كافي، ارجع للرابط الآمن
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
      title="Back"
    >
      ← Back
    </button>
  );
}
