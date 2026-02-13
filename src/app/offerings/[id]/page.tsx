import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, Users as UsersIcon, DollarSign, FileText, MapPin, Globe } from 'lucide-react';
import ExpressInterestButton from '@/components/offerings/express-interest';
import SaveOfferingButton from '@/components/offerings/save-button';

export default async function OfferingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: offering } = await supabase
    .from('offerings')
    .select('*, company:companies(*, founder:profiles(full_name, email))')
    .eq('id', id)
    .single();

  if (!offering) {
    notFound();
  }

  const company = offering.company as any;
  const founder = company?.founder;

  // Get interest count
  const { count: interestCount } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('offering_id', id);

  // Check if current user already expressed interest
  const { data: { user } } = await supabase.auth.getUser();
  let existingInterest = null;
  let userProfile = null;

  if (user) {
    const { data: interest } = await supabase
      .from('interests')
      .select('*')
      .eq('offering_id', id)
      .eq('investor_id', user.id)
      .single();
    existingInterest = interest;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }

  // Check if saved
  let isSaved = false;
  if (user) {
    const { data: savedData } = await supabase
      .from('saved_offerings')
      .select('offering_id')
      .eq('investor_id', user.id)
      .eq('offering_id', id)
      .single();
    isSaved = !!savedData;
  }

  const highlights = (offering.highlights as string[]) || [];
  const risks = (offering.risks as string[]) || [];
  const useOfFunds = (offering.use_of_funds as { category: string; percentage: number }[]) || [];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass-nav fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/offerings" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Offerings
          </Link>
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        {/* Header */}
        <div className="glass-card p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shrink-0">
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{offering.title}</h1>
                <span className="badge badge-live">{offering.status}</span>
              </div>
              <p className="mt-1 text-neutral-500">
                {company?.name} · {company?.sector} · {company?.stage}
              </p>
              {company?.location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.location}
                </p>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="stat-card">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <p className="mt-2 text-xl font-bold text-white">{formatCurrency(offering.target_raise)}</p>
              <p className="text-xs text-neutral-600">Target Raise</p>
            </div>
            <div className="stat-card">
              <DollarSign className="h-5 w-5 text-amber-400" />
              <p className="mt-2 text-xl font-bold text-white">{formatCurrency(offering.minimum_investment)}</p>
              <p className="text-xs text-neutral-600">Min. Investment</p>
            </div>
            <div className="stat-card">
              <FileText className="h-5 w-5 text-red-400" />
              <p className="mt-2 text-xl font-bold text-white capitalize">{offering.offering_type}</p>
              <p className="text-xs text-neutral-600">Type</p>
            </div>
            <div className="stat-card">
              <UsersIcon className="h-5 w-5 text-orange-400" />
              <p className="mt-2 text-xl font-bold text-gradient">{interestCount || 0}</p>
              <p className="text-xs text-neutral-600">Interested</p>
            </div>
          </div>

          {offering.valuation_cap && (
            <p className="mt-4 text-sm text-neutral-400">
              Valuation Cap: <span className="text-white font-semibold">{formatCurrency(offering.valuation_cap)}</span>
            </p>
          )}
          {offering.equity_percentage && (
            <p className="mt-1 text-sm text-neutral-400">
              Equity: <span className="text-white font-semibold">{offering.equity_percentage}%</span>
            </p>
          )}
          {offering.deadline && (
            <p className="mt-1 flex items-center gap-1 text-sm text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              Deadline: <span className="text-white">{formatDate(offering.deadline)}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">About This Offering</h2>
              <p className="text-sm leading-relaxed text-neutral-400 whitespace-pre-wrap">
                {offering.description}
              </p>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use of Funds */}
            {useOfFunds.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Use of Funds</h2>
                <div className="space-y-3">
                  {useOfFunds.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-400">{item.category}</span>
                        <span className="text-white font-medium">{item.percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.05]">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {risks.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Risk Factors</h2>
                <ul className="space-y-2">
                  {risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Button */}
            {user && userProfile?.role === 'investor' && (
              <SaveOfferingButton offeringId={offering.id} isSaved={isSaved} />
            )}

            {/* Express Interest */}
            {userProfile?.role === 'investor' && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Invest</h3>
                <ExpressInterestButton
                  offeringId={offering.id}
                  minimumInvestment={offering.minimum_investment}
                  existingInterest={existingInterest}
                />
              </div>
            )}

            {/* Company Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Name</p>
                  <p className="text-sm font-medium text-white">{company?.name}</p>
                </div>
                {company?.description && (
                  <div>
                    <p className="text-sm text-neutral-600">About</p>
                    <p className="text-sm text-neutral-400 line-clamp-3">{company.description}</p>
                  </div>
                )}
                {company?.website && (
                  <div>
                    <p className="text-sm text-neutral-600">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {company?.team_size && (
                  <div>
                    <p className="text-sm text-neutral-600">Team Size</p>
                    <p className="text-sm text-white">{company.team_size} people</p>
                  </div>
                )}
                {company?.founded_year && (
                  <div>
                    <p className="text-sm text-neutral-600">Founded</p>
                    <p className="text-sm text-white">{company.founded_year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            {founder && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Founder</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white">
                    {founder.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{founder.full_name}</p>
                    <p className="text-xs text-neutral-500">{founder.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
