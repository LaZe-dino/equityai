import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, FileText, DollarSign, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div className="flex items-center justify-center py-20"><p className="text-neutral-500">Loading...</p></div>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'founder') {
    return <FounderDashboard userId={user.id} />;
  }
  return <InvestorDashboard userId={user.id} />;
}

async function FounderDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  // Get founder's company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('founder_id', userId)
    .single();

  // Get offerings count
  const { count: offeringCount } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company?.id || '');

  // Get live offerings
  const { count: liveCount } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company?.id || '')
    .eq('status', 'live');

  // Get interests on founder's offerings
  const { data: offerings } = await supabase
    .from('offerings')
    .select('id')
    .eq('company_id', company?.id || '');

  const offeringIds = offerings?.map(o => o.id) || [];
  
  let interestCount = 0;
  let totalInterestAmount = 0;
  
  if (offeringIds.length > 0) {
    const { data: interests } = await supabase
      .from('interests')
      .select('amount')
      .in('offering_id', offeringIds);
    
    interestCount = interests?.length || 0;
    totalInterestAmount = interests?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
  }

  // Recent activity
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-neutral-500">
            {company ? `Welcome back, ${company.name}` : 'Get started by creating your company'}
          </p>
        </div>
        {company && (
          <Link href="/dashboard/offerings/new" className="btn-primary text-sm">
            New Offering
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {!company ? (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-white">Create Your Company Profile</h2>
          <p className="mt-2 text-neutral-500">
            Set up your company to start creating offerings and attracting investors.
          </p>
          <Link href="/dashboard/company" className="btn-primary mt-6 text-sm">
            Get Started
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Total Offerings"
              value={String(offeringCount || 0)}
              icon={<FileText className="h-5 w-5 text-orange-500" />}
            />
            <StatCard
              label="Live Offerings"
              value={String(liveCount || 0)}
              icon={<TrendingUp className="h-5 w-5 text-green-400" />}
            />
            <StatCard
              label="Interested Investors"
              value={String(interestCount)}
              icon={<Users className="h-5 w-5 text-amber-400" />}
            />
            <StatCard
              label="Total Interest"
              value={formatCurrency(totalInterestAmount)}
              icon={<DollarSign className="h-5 w-5 text-orange-400" />}
            />
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="table-row flex items-center gap-3 py-3">
                    <Clock className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm text-neutral-300">{activity.action}</span>
                    <span className="ml-auto text-xs text-neutral-600">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No recent activity yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

async function InvestorDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  // Get investor's interests
  const { data: interests } = await supabase
    .from('interests')
    .select('*, offering:offerings(*, company:companies(*))')
    .eq('investor_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get counts
  const { count: totalInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId);

  const { count: pendingInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId)
    .eq('status', 'pending');

  const { count: acceptedInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId)
    .eq('status', 'accepted');

  const { count: savedCount } = await supabase
    .from('saved_offerings')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId);

  // Get live offerings count
  const { count: liveOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-neutral-500">Discover and invest in promising startups</p>
        </div>
        <Link href="/offerings" className="btn-primary text-sm">
          Browse Offerings
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Live Offerings"
          value={String(liveOfferings || 0)}
          icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
        />
        <StatCard
          label="My Interests"
          value={String(totalInterests || 0)}
          icon={<Users className="h-5 w-5 text-amber-400" />}
        />
        <StatCard
          label="Accepted"
          value={String(acceptedInterests || 0)}
          icon={<DollarSign className="h-5 w-5 text-green-400" />}
        />
        <StatCard
          label="Saved"
          value={String(savedCount || 0)}
          icon={<FileText className="h-5 w-5 text-neutral-400" />}
        />
      </div>

      {/* Recent Interests */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Interests</h2>
        {interests && interests.length > 0 ? (
          <div className="space-y-3">
            {interests.map((interest) => {
              const offering = interest.offering as any;
              const company = offering?.company;
              return (
                <Link
                  key={interest.id}
                  href={`/offerings/${interest.offering_id}`}
                  className="table-row flex items-center gap-4 py-3 hover:bg-white/[0.02] rounded-lg px-3 -mx-3 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {offering?.title || 'Offering'}
                    </p>
                    <p className="text-xs text-neutral-500">{company?.name}</p>
                  </div>
                  <span className={`badge ${
                    interest.status === 'pending' ? 'badge-review' :
                    interest.status === 'accepted' ? 'badge-funded' :
                    'badge-draft'
                  }`}>
                    {interest.status}
                  </span>
                  {interest.amount && (
                    <span className="text-sm font-medium text-neutral-300">
                      {formatCurrency(interest.amount)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-neutral-600">No interests yet.</p>
            <Link href="/offerings" className="mt-3 inline-block text-sm text-orange-500 hover:text-orange-400">
              Browse live offerings →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
