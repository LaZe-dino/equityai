'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
      </div>
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-extrabold text-gradient">Oops</h1>
        <p className="mt-4 text-xl text-neutral-400">Something went wrong</p>
        <p className="mt-2 text-sm text-neutral-600">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-secondary text-sm">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link href="/" className="btn-primary text-sm">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
