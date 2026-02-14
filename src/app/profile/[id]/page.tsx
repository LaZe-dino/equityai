import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Globe, Building2, Calendar } from 'lucide-react';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    notFound();
  }

  // If founder, get their company
  let company = null;
  if (profile.role === 'founder') {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('founder_id', id)
      .single();
    company = data;
  }

  // If investor, get their investor profile
  let investorProfile = null;
  if (profile.role === 'investor') {
    const { data } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    investorProfile = data;
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="glass-nav fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/offerings" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <div className="glass-card p-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-2xl font-bold text-white shrink-0">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} width={80} height={80} className="h-full w-full rounded-full object-cover" />
              ) : (
                profile.full_name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <p className="mt-1 text-sm text-neutral-500 capitalize">{profile.role}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <h2 className="text-sm font-medium text-neutral-500 mb-2">About</h2>
              <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Founder: Company link */}
          {company && (
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <h2 className="text-sm font-medium text-neutral-500 mb-3">Company</h2>
              <Link
                href={`/company/${company.id}`}
                className="glass-card p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shrink-0">
                  <Building2 className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-white font-medium">{company.name}</p>
                  <p className="text-xs text-neutral-500">{company.sector} · {company.stage}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Investor: Preferences */}
          {investorProfile && (
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <h2 className="text-sm font-medium text-neutral-500 mb-3">Investment Interests</h2>
              <div className="space-y-3">
                {investorProfile.accredited && (
                  <p className="text-sm text-green-400">✓ Accredited Investor</p>
                )}
                {investorProfile.sectors_of_interest && investorProfile.sectors_of_interest.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-2">Sectors</p>
                    <div className="flex flex-wrap gap-2">
                      {investorProfile.sectors_of_interest.map((s: string) => (
                        <span key={s} className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs text-orange-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Member since */}
          <div className="mt-6 border-t border-white/[0.06] pt-6 flex items-center gap-2 text-xs text-neutral-600">
            <Calendar className="h-3.5 w-3.5" />
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
