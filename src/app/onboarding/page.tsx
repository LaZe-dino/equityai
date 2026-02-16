'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { sendWelcomeEmail } from '@/lib/email';
import { SECTORS, STAGES } from '@/types';
import { ArrowRight, Building2, LineChart, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '',
    linkedin_url: '',
    bio: '',
  });
  const [investorForm, setInvestorForm] = useState({
    accredited: false,
    investment_min: '',
    investment_max: '',
    sectors_of_interest: [] as string[],
    stages_of_interest: [] as string[],
  });
  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    sector: '',
    stage: 'seed',
    website: '',
    location: '',
  });
  const [role, setRole] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  const loadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Try to get existing profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // If no profile, create one from auth metadata
    if (!profile) {
      const meta = user.user_metadata || {};
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: meta.full_name || user.email?.split('@')[0] || 'User',
          role: meta.role || 'investor',
        }, { onConflict: 'id' })
        .select('role')
        .single();

      if (error) {
        console.error('Failed to create profile:', error);
        return;
      }
      profile = newProfile;
    }

    if (profile) setRole(profile.role);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRole(); }, []);

  const saveProfile = async () => {
    setLoading(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    setStep(2);
    setLoading(false);
  };

  const saveInvestorProfile = async () => {
    setLoading(true);
    await fetch('/api/investor-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...investorForm,
        investment_min: investorForm.investment_min ? Math.round(parseFloat(investorForm.investment_min) * 100) : null,
        investment_max: investorForm.investment_max ? Math.round(parseFloat(investorForm.investment_max) * 100) : null,
      }),
    });
    await finishOnboarding();
  };

  const saveCompany = async () => {
    setLoading(true);
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyForm),
    });
    await finishOnboarding();
  };

  const finishOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get profile for welcome email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', user?.id)
      .single();

    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarded: true }),
    });

    // Send welcome email
    if (profile?.email && profile?.role) {
      sendWelcomeEmail(profile.email, profile.full_name, profile.role);
    }

    setLoading(false);
    router.push('/dashboard');
    router.refresh();
  };

  const toggleSector = (sector: string) => {
    setInvestorForm(prev => ({
      ...prev,
      sectors_of_interest: prev.sectors_of_interest.includes(sector)
        ? prev.sectors_of_interest.filter(s => s !== sector)
        : [...prev.sectors_of_interest, sector],
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="mt-2 text-neutral-500">Step {step} of 2</p>
          <div className="mt-4 flex gap-2 justify-center">
            <div className={`h-1 w-20 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-white/10'}`} />
            <div className={`h-1 w-20 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-white/10'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="glass-input"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">LinkedIn</label>
              <input
                type="url"
                value={profileForm.linkedin_url}
                onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                className="glass-input"
                placeholder="https://linkedin.com/in/you"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={3}
                className="glass-input resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <button onClick={saveProfile} disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Saving...' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => { setStep(2); }} className="w-full text-center text-sm text-neutral-500 hover:text-white">
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && role === 'investor' && (
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <LineChart className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-white">Investor Preferences</h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="accredited"
                checked={investorForm.accredited}
                onChange={(e) => setInvestorForm({ ...investorForm, accredited: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="accredited" className="text-sm text-neutral-300">I am an accredited investor</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Min Check ($)</label>
                <input type="number" value={investorForm.investment_min} onChange={(e) => setInvestorForm({ ...investorForm, investment_min: e.target.value })} className="glass-input" placeholder="10000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Max Check ($)</label>
                <input type="number" value={investorForm.investment_max} onChange={(e) => setInvestorForm({ ...investorForm, investment_max: e.target.value })} className="glass-input" placeholder="100000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">Sectors</label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSector(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      investorForm.sectors_of_interest.includes(s)
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06]'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <button onClick={saveInvestorProfile} disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Setting up...' : 'Go to Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={finishOnboarding} className="w-full text-center text-sm text-neutral-500 hover:text-white">
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && role === 'founder' && (
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-white">Your Company</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Company Name *</label>
              <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} required className="glass-input" placeholder="Acme Corp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Sector *</label>
                <select value={companyForm.sector} onChange={(e) => setCompanyForm({ ...companyForm, sector: e.target.value })} className="glass-input">
                  <option value="">Select...</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Stage *</label>
                <select value={companyForm.stage} onChange={(e) => setCompanyForm({ ...companyForm, stage: e.target.value })} className="glass-input">
                  {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
              <textarea value={companyForm.description} onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} rows={3} className="glass-input resize-none" placeholder="What does your company do?" />
            </div>

            <button onClick={saveCompany} disabled={loading || !companyForm.name || !companyForm.sector} className="btn-primary w-full py-3">
              {loading ? 'Creating...' : 'Go to Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={finishOnboarding} className="w-full text-center text-sm text-neutral-500 hover:text-white">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
