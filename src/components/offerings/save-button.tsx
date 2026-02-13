'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';

export default function SaveOfferingButton({
  offeringId,
  isSaved: initialSaved,
}: {
  offeringId: string;
  isSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    if (saved) {
      const res = await fetch(`/api/saved?offering_id=${offeringId}`, { method: 'DELETE' });
      if (res.ok) setSaved(false);
    } else {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offering_id: offeringId }),
      });
      if (res.ok) setSaved(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
        saved
          ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
          : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white'
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
