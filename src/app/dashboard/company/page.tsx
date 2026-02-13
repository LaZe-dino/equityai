'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SECTORS, STAGES } from '@/types';
import { Building2, Save } from 'lucide-react';

export default function CompanyPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sector: '',
    stage: 'seed' as string,
    website: '',
    founded_year: '',
    team_size: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('founder_id', user.id)
      .single();

    if (data) {
      setCompany(data);
      setForm({
        name: data.name || '',
        description: data.description || '',
        sector: data.sector || '',
        stage: data.stage || 'seed',
        website: data.website || '',
        founded_year: data.founded_year?.toString() || '',
        team_size: data.team_size?.toString() || '',
        location: data.location || '',
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      founder_id: user.id,
      name: form.name,
      description: form.description,
      sector: form.sector,
      stage: form.stage,
      website: form.website || null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      team_size: form.team_size ? parseInt(form.team_size) : null,
      location: form.location || null,
    };

    if (company) {
      const { error } = await supabase
        .from('companies')
        .update(payload)
        .eq('id', company.id);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Company updated successfully!');
      }
    } else {
      const { error } = await supabase
        .from('companies')
        .insert(payload);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Company created successfully!');
        router.refresh();
        loadCompany();
      }
    }
    setSaving(false);
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
        <h1 className="text-2xl font-bold text-white">
          {company ? 'Edit Company' : 'Create Company'}
        </h1>
        <p className="mt-1 text-neutral-500">
          {company ? 'Update your company information' : 'Set up your company profile to start creating offerings'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="glass-input"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Sector *
              </label>
              <select
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                required
                className="glass-input"
              >
                <option value="">Select sector...</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Stage *
              </label>
              <select
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                required
                className="glass-input"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="glass-input"
                placeholder="https://yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Founded Year
              </label>
              <input
                type="number"
                value={form.founded_year}
                onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                className="glass-input"
                placeholder="2024"
                min="1900"
                max="2030"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Team Size
              </label>
              <input
                type="number"
                value={form.team_size}
                onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                className="glass-input"
                placeholder="10"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="glass-input"
                placeholder="Austin, TX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="glass-input resize-none"
              placeholder="Tell investors about your company, mission, and what makes you unique..."
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
