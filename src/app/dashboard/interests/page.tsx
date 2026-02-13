'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function FounderInterestsPage() {
  const [interests, setInterests] = useState<any[]>([]);
  const [offeringMap, setOfferingMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('founder_id', user.id)
      .single();

    if (!company) { setLoading(false); return; }

    const { data: offerings } = await supabase
      .from('offerings')
      .select('id, title')
      .eq('company_id', company.id);

    const ids = offerings?.map(o => o.id) || [];
    setOfferingMap(new Map(offerings?.map(o => [o.id, o.title]) || []));

    if (ids.length > 0) {
      const { data } = await supabase
        .from('interests')
        .select('*, investor:profiles(id, full_name, email, avatar_url)')
        .in('offering_id', ids)
        .order('created_at', { ascending: false });
      setInterests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (interestId: string, status: string) => {
    const res = await fetch(`/api/interests/${interestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setInterests(prev =>
        prev.map(i => i.id === interestId ? { ...i, status } : i)
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

  const pendingCount = interests.filter(i => i.status === 'pending').length;
  const totalAmount = interests.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Incoming Interests</h1>
        <p className="mt-1 text-neutral-500">Manage interest from investors in your offerings</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Total</span>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{interests.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Pending</span>
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Total Amount</span>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {interests.length > 0 ? (
        <div className="glass-card divide-y divide-white/[0.04]">
          {interests.map((interest) => {
            const investor = interest.investor as any;
            return (
              <div key={interest.id} className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white shrink-0">
                  {investor?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{investor?.full_name}</p>
                  <p className="text-xs text-neutral-500">
                    {investor?.email} · {offeringMap.get(interest.offering_id) || 'Offering'}
                  </p>
                  {interest.message && (
                    <p className="mt-1 text-xs text-neutral-400 italic">&ldquo;{interest.message}&rdquo;</p>
                  )}
                </div>
                {interest.amount && (
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(interest.amount)}
                  </span>
                )}
                <span className={`badge ${
                  interest.status === 'pending' ? 'badge-review' :
                  interest.status === 'accepted' ? 'badge-funded' :
                  interest.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'badge-draft'
                }`}>
                  {interest.status}
                </span>
                {interest.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(interest.id, 'accepted')}
                      className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Accept"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(interest.id, 'declined')}
                      className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Decline"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card py-16 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-neutral-700" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-400">No interests yet</h3>
          <p className="mt-2 text-sm text-neutral-600">
            When investors express interest, they&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  );
}
