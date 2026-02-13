import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { SECTORS, STAGES } from '@/types';
import { TrendingUp, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function OfferingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; stage?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('offerings')
    .select('*, company:companies(*)')
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (params.sector) {
    query = query.eq('company.sector', params.sector);
  }
  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  const { data: offerings } = await query;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass-nav fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Equity<span className="text-gradient">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Live Offerings</h1>
          <p className="mt-2 text-neutral-500">
            Discover and invest in promising seed-stage companies
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card mb-8 p-4">
          <form className="flex flex-wrap items-center gap-4" method="GET">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                name="search"
                defaultValue={params.search}
                className="glass-input pl-10"
                placeholder="Search offerings..."
              />
            </div>
            <select name="sector" defaultValue={params.sector} className="glass-input w-auto">
              <option value="">All Sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select name="stage" defaultValue={params.stage} className="glass-input w-auto">
              <option value="">All Stages</option>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </form>
        </div>

        {/* Offerings Grid */}
        {offerings && offerings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offerings.map((offering) => {
              const company = offering.company as any;
              return (
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
                  <p className="mt-1 text-sm text-neutral-500">
                    {company?.name} · {company?.sector} · {company?.stage}
                  </p>

                  <p className="mt-3 text-sm text-neutral-400 line-clamp-2">
                    {offering.description}
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4">
                    <div>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(offering.target_raise)}
                      </p>
                      <p className="text-xs text-neutral-600">Target</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(offering.minimum_investment)}
                      </p>
                      <p className="text-xs text-neutral-600">Min.</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gradient capitalize">
                        {offering.offering_type}
                      </p>
                      <p className="text-xs text-neutral-600">Type</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass-card py-16 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-neutral-700" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-400">No offerings yet</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Check back soon — new opportunities are added regularly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
