'use client';

import {useEffect} from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Documents error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
      <p className="mb-6 text-gray-600">
        {error.message || 'Failed to load documents'}
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Try again
        </button>
        <Link href="/" className="text-sm text-gray-600 underline hover:text-black">
          Go home
        </Link>
      </div>
    </div>
  );
}
