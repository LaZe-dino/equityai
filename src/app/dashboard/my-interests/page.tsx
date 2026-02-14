'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, Clock } from 'lucide-react';

export default function MyInterestsPage() {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInterests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('interests')
      .select('*, offering:offerings(*, company:companies(name, sector, stage, logo_url))')
      .eq('investor_id', user.id)
      .order('created_at', { ascending: false });

    setInterests(data || []);
    setLoading(false);
  };

  const withdraw = async (interestId: string) => {
    const res = await fetch(`/api/interests/${interestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'withdrawn' }),
    });
    if (res.ok) {
      setInterests(prev =>
        prev.map(i => i.id === interestId ? { ...i, status: 'withdrawn' } : i)
      );
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
        <h1 className="text-2xl font-bold text-white">My Interests</h1>
        <p className="mt-1 text-neutral-500">Track your investment interests</p>
      </div>

      {interests.length > 0 ? (
        <div className="space-y-4">
          {interests.map((interest) => {
            const offering = interest.offering as any;
            const company = offering?.company;
            return (
              <div key={interest.id} className="glass-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shrink-0">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/offerings/${interest.offering_id}`}
                      className="text-lg font-semibold text-white hover:text-orange-400 transition-colors"
                    >
                      {offering?.title || 'Offering'}
                    </Link>
                    <p className="text-sm text-neutral-500">
                      {company?.name} · {company?.sector} · {company?.stage}
                    </p>
                  </div>
                  <div className="text-right">
                    {interest.amount && (
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(interest.amount)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${
                        interest.status === 'pending' ? 'badge-review' :
                        interest.status === 'accepted' ? 'badge-funded' :
                        interest.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'badge-draft'
                      }`}>
                        {interest.status}
                      </span>
                    </div>
                  </div>
                </div>
                {interest.message && (
                  <p className="mt-3 text-sm text-neutral-400 border-t border-white/[0.04] pt-3">
                    {interest.message}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(interest.created_at)}
                  </span>
                  {interest.status === 'pending' && (
                    <button
                      onClick={() => withdraw(interest.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card py-16 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-neutral-700" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-400">No interests yet</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Browse offerings and express your interest to get started.
          </p>
          <Link href="/offerings" className="btn-primary mt-6 inline-flex text-sm">
            Browse Offerings
          </Link>
        </div>
      )}
    </div>
  );
}
