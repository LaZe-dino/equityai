'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Shield, Users, FileText, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'offerings' | 'users'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [statsRes, offeringsRes, usersRes] = await Promise.all([
      fetch('/api/dashboard/stats'),
      fetch('/api/admin/offerings'),
      fetch('/api/admin/users'),
    ]);

    if (statsRes.ok) {
      const data = await statsRes.json();
      setStats(data.data);
    }
    if (offeringsRes.ok) {
      const data = await offeringsRes.json();
      setOfferings(data.data || []);
    }
    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(data.data || []);
    }
    setLoading(false);
  };

  const updateOfferingStatus = async (offeringId: string, status: string) => {
    const res = await fetch('/api/admin/offerings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offering_id: offeringId, status }),
    });
    if (res.ok) {
      setOfferings(prev =>
        prev.map(o => o.id === offeringId ? { ...o, status } : o)
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
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="mt-1 text-neutral-500">Manage users, offerings, and platform settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Total Users</span>
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{stats?.total_users || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Total Offerings</span>
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{stats?.total_offerings || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Pending Review</span>
            <TrendingUp className="h-5 w-5 text-red-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{stats?.pending_review || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Live Offerings</span>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{stats?.live_offerings || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(['overview', 'offerings', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t
                ? 'bg-orange-500/10 text-orange-500'
                : 'text-neutral-500 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Offerings Tab */}
      {tab === 'offerings' && (
        <div className="glass-card divide-y divide-white/[0.04]">
          {offerings.length > 0 ? offerings.map((offering) => {
            const company = offering.company as any;
            const founder = company?.founder;
            return (
              <div key={offering.id} className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shrink-0">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{offering.title}</p>
                  <p className="text-xs text-neutral-500">
                    {company?.name} · {founder?.full_name} · {formatCurrency(offering.target_raise)}
                  </p>
                </div>
                <span className={`badge ${
                  offering.status === 'live' ? 'badge-live' :
                  offering.status === 'under-review' ? 'badge-review' :
                  offering.status === 'funded' ? 'badge-funded' :
                  'badge-draft'
                }`}>
                  {offering.status}
                </span>
                {offering.status === 'under-review' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOfferingStatus(offering.id, 'live')}
                      className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateOfferingStatus(offering.id, 'draft')}
                      className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="p-8 text-center text-neutral-600">No offerings yet</div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="glass-card divide-y divide-white/[0.04]">
          {users.length > 0 ? users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white shrink-0">
                {user.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{user.full_name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <span className={`badge ${
                user.role === 'admin' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                user.role === 'founder' ? 'badge-live' :
                'badge-funded'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-neutral-600">{formatDate(user.created_at)}</span>
            </div>
          )) : (
            <div className="p-8 text-center text-neutral-600">No users yet</div>
          )}
        </div>
      )}

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pending Review</h2>
            {offerings.filter(o => o.status === 'under-review').length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {offerings.filter(o => o.status === 'under-review').map((offering) => (
                  <div key={offering.id} className="flex items-center gap-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{offering.title}</p>
                      <p className="text-xs text-neutral-500">{(offering.company as any)?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateOfferingStatus(offering.id, 'live')} className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-green-400 hover:bg-green-500/20">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => updateOfferingStatus(offering.id, 'draft')} className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-red-400 hover:bg-red-500/20">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No offerings pending review</p>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Users</h2>
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-xs font-bold text-white">
                  {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{user.full_name}</p>
                  <p className="text-xs text-neutral-600">{user.email}</p>
                </div>
                <span className="text-xs capitalize text-neutral-500">{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
