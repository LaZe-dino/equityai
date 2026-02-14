'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SECTORS, STAGES } from '@/types';
import { Save, User, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: '',
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
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (p) {
      setProfile(p);
      setForm({
        full_name: p.full_name || '',
        phone: p.phone || '',
        linkedin_url: p.linkedin_url || '',
        bio: p.bio || '',
      });
    }

    if (p?.role === 'investor') {
      const { data: ip } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (ip) {
        setInvestorForm({
          accredited: ip.accredited || false,
          investment_min: ip.investment_min ? (ip.investment_min / 100).toString() : '',
          investment_max: ip.investment_max ? (ip.investment_max / 100).toString() : '',
          sectors_of_interest: ip.sectors_of_interest || [],
          stages_of_interest: ip.stages_of_interest || [],
        });
      }
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess('Profile updated!');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update');
    }
    setSaving(false);
  };

  const handleSaveInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/investor-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...investorForm,
        investment_min: investorForm.investment_min ? Math.round(parseFloat(investorForm.investment_min) * 100) : null,
        investment_max: investorForm.investment_max ? Math.round(parseFloat(investorForm.investment_max) * 100) : null,
      }),
    });

    if (res.ok) {
      setSuccess('Investor profile updated!');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update');
    }
    setSaving(false);
  };

  const toggleSector = (sector: string) => {
    setInvestorForm(prev => ({
      ...prev,
      sectors_of_interest: prev.sectors_of_interest.includes(sector)
        ? prev.sectors_of_interest.filter(s => s !== sector)
        : [...prev.sectors_of_interest, sector],
    }));
  };

  const toggleStage = (stage: string) => {
    setInvestorForm(prev => ({
      ...prev,
      stages_of_interest: prev.stages_of_interest.includes(stage)
        ? prev.stages_of_interest.filter(s => s !== stage)
        : [...prev.stages_of_interest, stage],
    }));
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
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-neutral-500">Manage your profile and preferences</p>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Info */}
        <form onSubmit={handleSaveProfile}>
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-white">Profile</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="glass-input"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  className="glass-input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="glass-input resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>

        {/* Investor Preferences */}
        {profile?.role === 'investor' && (
          <form onSubmit={handleSaveInvestor}>
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-white">Investor Preferences</h2>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="accredited"
                  checked={investorForm.accredited}
                  onChange={(e) => setInvestorForm({ ...investorForm, accredited: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="accredited" className="text-sm text-neutral-300">
                  I am an accredited investor
                </label>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Min Check Size ($)</label>
                  <input
                    type="number"
                    value={investorForm.investment_min}
                    onChange={(e) => setInvestorForm({ ...investorForm, investment_min: e.target.value })}
                    className="glass-input"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Max Check Size ($)</label>
                  <input
                    type="number"
                    value={investorForm.investment_max}
                    onChange={(e) => setInvestorForm({ ...investorForm, investment_max: e.target.value })}
                    className="glass-input"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">Sectors of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => toggleSector(sector)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        investorForm.sectors_of_interest.includes(sector)
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06] hover:border-white/10'
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">Stages of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => toggleStage(stage.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        investorForm.stages_of_interest.includes(stage.value)
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06] hover:border-white/10'
                      }`}
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Account Info */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Email</span>
              <span className="text-white">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Role</span>
              <span className="text-white capitalize">{profile?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Joined</span>
              <span className="text-white">{new Date(profile?.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
