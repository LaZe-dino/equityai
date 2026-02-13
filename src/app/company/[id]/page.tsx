import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Globe, Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function CompanyPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from('companies')
    .select('*, founder:profiles(id, full_name, avatar_url)')
    .eq('id', id)
    .single();

  if (!company) {
    notFound();
  }

  const founder = company.founder as any;

  // Get live offerings for this company
  const { data: offerings } = await supabase
    .from('offerings')
    .select('*')
    .eq('company_id', id)
    .eq('status', 'live')
    .order('created_at', { ascending: false });

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
        {/* Company Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shrink-0">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <Building2 className="h-10 w-10 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{company.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="badge badge-live">{company.sector}</span>
                <span className="badge badge-draft capitalize">{company.stage}</span>
                {company.location && (
                  <span className="flex items-center gap-1 text-sm text-neutral-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="mt-6 text-neutral-400 leading-relaxed whitespace-pre-wrap">
              {company.description}
            </p>
          )}

          {/* Company Info Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {company.founded_year && (
              <div className="stat-card">
                <Calendar className="h-5 w-5 text-orange-500" />
                <p className="mt-2 text-lg font-bold text-white">{company.founded_year}</p>
                <p className="text-xs text-neutral-600">Founded</p>
              </div>
            )}
            {company.team_size && (
              <div className="stat-card">
                <Users className="h-5 w-5 text-amber-400" />
                <p className="mt-2 text-lg font-bold text-white">{company.team_size}</p>
                <p className="text-xs text-neutral-600">Team Size</p>
              </div>
            )}
            {company.website && (
              <div className="stat-card">
                <Globe className="h-5 w-5 text-orange-400" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-orange-500 hover:text-orange-400 truncate block"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
                <p className="text-xs text-neutral-600">Website</p>
              </div>
            )}
            <div className="stat-card">
              <FileText className="h-5 w-5 text-red-400" />
              <p className="mt-2 text-lg font-bold text-white">{offerings?.length || 0}</p>
              <p className="text-xs text-neutral-600">Live Offerings</p>
            </div>
          </div>

          {/* Founder */}
          {founder && (
            <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white">
                {founder.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <Link href={`/profile/${founder.id}`} className="text-sm font-medium text-white hover:text-orange-400 transition-colors">
                  {founder.full_name}
                </Link>
                <p className="text-xs text-neutral-500">Founder</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Offerings */}
        <h2 className="text-xl font-bold text-white mb-4">Live Offerings</h2>
        {offerings && offerings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {offerings.map((offering) => (
              <Link
                key={offering.id}
                href={`/offerings/${offering.id}`}
                className="glass-card group p-6 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <span className="badge badge-live">Live</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                  {offering.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-400 line-clamp-2">{offering.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4">
                  <div>
                    <p className="text-lg font-bold text-white">{formatCurrency(offering.target_raise)}</p>
                    <p className="text-xs text-neutral-600">Target</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{formatCurrency(offering.minimum_investment)}</p>
                    <p className="text-xs text-neutral-600">Min.</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gradient capitalize">{offering.offering_type}</p>
                    <p className="text-xs text-neutral-600">Type</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card py-12 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-neutral-700" />
            <p className="mt-3 text-neutral-500">No live offerings at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
