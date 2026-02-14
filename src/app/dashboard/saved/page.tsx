'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, Bookmark, X } from 'lucide-react';

export default function SavedOfferingsPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('saved_offerings')
      .select('*, offering:offerings(*, company:companies(name, sector, stage, logo_url))')
      .eq('investor_id', user.id)
      .order('created_at', { ascending: false });

    setSaved(data || []);
    setLoading(false);
  };

  const unsave = async (offeringId: string) => {
    const res = await fetch(`/api/saved?offering_id=${offeringId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setSaved(prev => prev.filter(s => s.offering_id !== offeringId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Saved Offerings</h1>
        <p className="mt-1 text-neutral-500">Offerings you&apos;ve bookmarked for later</p>
      </div>

      {saved.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {saved.map((item) => {
            const offering = item.offering as any;
            const company = offering?.company;
            return (
              <div key={item.offering_id} className="glass-card p-6 relative group">
                <button
                  onClick={() => unsave(item.offering_id)}
                  className="absolute top-4 right-4 text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shrink-0">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <span className="badge badge-live text-xs">
                      {offering?.status || 'live'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/offerings/${item.offering_id}`}
                  className="mt-4 block text-lg font-semibold text-white hover:text-orange-400 transition-colors"
                >
                  {offering?.title}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">
                  {company?.name} · {company?.sector}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.04] pt-4">
                  <div>
                    <p className="text-base font-bold text-white">{formatCurrency(offering?.target_raise || 0)}</p>
                    <p className="text-xs text-neutral-600">Target</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{formatCurrency(offering?.minimum_investment || 0)}</p>
                    <p className="text-xs text-neutral-600">Min.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card py-16 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-neutral-700" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-400">Nothing saved yet</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Save offerings you&apos;re interested in to review them later.
          </p>
          <Link href="/offerings" className="btn-primary mt-6 inline-flex text-sm">
            Browse Offerings
          </Link>
        </div>
      )}
    </div>
  );
}
