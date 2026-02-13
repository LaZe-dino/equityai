import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
      </div>
      <div className="relative z-10 text-center">
        <h1 className="text-8xl font-extrabold text-gradient">404</h1>
        <p className="mt-4 text-xl text-neutral-400">Page not found</p>
        <p className="mt-2 text-sm text-neutral-600">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="btn-primary mt-8 inline-flex text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
