'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { OFFERING_TYPES } from '@/types';
import { Save, Plus, X } from 'lucide-react';

export default function NewOfferingPage() {
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    offering_type: 'safe' as string,
    target_raise: '',
    minimum_investment: '',
    valuation_cap: '',
    equity_percentage: '',
    deadline: '',
  });
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [risks, setRisks] = useState<string[]>(['']);
  const [useOfFunds, setUseOfFunds] = useState<{ category: string; percentage: string }[]>([
    { category: '', percentage: '' },
  ]);

  useEffect(() => {
    const loadCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('founder_id', user.id)
        .single();
      if (data) setCompanyId(data.id);
    };
    loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setError('Please create a company first');
      return;
    }
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      company_id: companyId,
      title: form.title,
      description: form.description,
      offering_type: form.offering_type,
      target_raise: Math.round(parseFloat(form.target_raise) * 100),
      minimum_investment: Math.round(parseFloat(form.minimum_investment) * 100),
      valuation_cap: form.valuation_cap ? Math.round(parseFloat(form.valuation_cap) * 100) : null,
      equity_percentage: form.equity_percentage ? parseFloat(form.equity_percentage) : null,
      deadline: form.deadline || null,
      highlights: highlights.filter(h => h.trim()),
      risks: risks.filter(r => r.trim()),
      use_of_funds: useOfFunds
        .filter(u => u.category.trim() && u.percentage)
        .map(u => ({ category: u.category, percentage: parseFloat(u.percentage) })),
      status: 'draft',
    };

    const { error } = await supabase.from('offerings').insert(payload);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Log activity
    if (user) {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: 'offering_created',
        entity_type: 'company',
        entity_id: companyId,
        metadata: { title: form.title },
      });
    }

    router.push('/dashboard/offerings');
    router.refresh();
  };

  if (!companyId) {
    return (
      <div className="glass-card p-12 text-center">
        <h2 className="text-xl font-semibold text-white">Company Required</h2>
        <p className="mt-2 text-neutral-500">You need to create a company before creating offerings.</p>
        <a href="/dashboard/company" className="btn-primary mt-4 inline-flex text-sm">
          Create Company
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create Offering</h1>
        <p className="mt-1 text-neutral-500">Define your offering terms and submit for review</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Basics */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Basics</h2>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="glass-input"
              placeholder="Seed Round — $2M SAFE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={5}
              className="glass-input resize-none"
              placeholder="Describe your offering, what you're building, and why investors should be interested..."
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Offering Type *</label>
              <select
                value={form.offering_type}
                onChange={(e) => setForm({ ...form, offering_type: e.target.value })}
                className="glass-input"
              >
                {OFFERING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="glass-input"
              />
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Financial Terms</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Target Raise ($) *</label>
              <input
                type="number"
                value={form.target_raise}
                onChange={(e) => setForm({ ...form, target_raise: e.target.value })}
                required
                min="0"
                step="0.01"
                className="glass-input"
                placeholder="2000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Minimum Investment ($) *</label>
              <input
                type="number"
                value={form.minimum_investment}
                onChange={(e) => setForm({ ...form, minimum_investment: e.target.value })}
                required
                min="0"
                step="0.01"
                className="glass-input"
                placeholder="25000"
              />
            </div>

            {(form.offering_type === 'safe' || form.offering_type === 'convertible-note') && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Valuation Cap ($)</label>
                <input
                  type="number"
                  value={form.valuation_cap}
                  onChange={(e) => setForm({ ...form, valuation_cap: e.target.value })}
                  min="0"
                  step="0.01"
                  className="glass-input"
                  placeholder="10000000"
                />
              </div>
            )}

            {form.offering_type === 'equity' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Equity Percentage (%)</label>
                <input
                  type="number"
                  value={form.equity_percentage}
                  onChange={(e) => setForm({ ...form, equity_percentage: e.target.value })}
                  min="0"
                  max="100"
                  step="0.01"
                  className="glass-input"
                  placeholder="15"
                />
              </div>
            )}
          </div>
        </div>

        {/* Highlights */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Highlights</h2>
            <button
              type="button"
              onClick={() => setHighlights([...highlights, ''])}
              className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={h}
                onChange={(e) => {
                  const next = [...highlights];
                  next[i] = e.target.value;
                  setHighlights(next);
                }}
                className="glass-input"
                placeholder="Key selling point..."
              />
              {highlights.length > 1 && (
                <button
                  type="button"
                  onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                  className="text-neutral-600 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Risks */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Risk Factors</h2>
            <button
              type="button"
              onClick={() => setRisks([...risks, ''])}
              className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {risks.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={r}
                onChange={(e) => {
                  const next = [...risks];
                  next[i] = e.target.value;
                  setRisks(next);
                }}
                className="glass-input"
                placeholder="Risk factor..."
              />
              {risks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRisks(risks.filter((_, idx) => idx !== i))}
                  className="text-neutral-600 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Use of Funds */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Use of Funds</h2>
            <button
              type="button"
              onClick={() => setUseOfFunds([...useOfFunds, { category: '', percentage: '' }])}
              className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {useOfFunds.map((u, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={u.category}
                onChange={(e) => {
                  const next = [...useOfFunds];
                  next[i].category = e.target.value;
                  setUseOfFunds(next);
                }}
                className="glass-input flex-1"
                placeholder="Category (e.g. Engineering)"
              />
              <input
                type="number"
                value={u.percentage}
                onChange={(e) => {
                  const next = [...useOfFunds];
                  next[i].percentage = e.target.value;
                  setUseOfFunds(next);
                }}
                className="glass-input w-24"
                placeholder="%"
                min="0"
                max="100"
              />
              {useOfFunds.length > 1 && (
                <button
                  type="button"
                  onClick={() => setUseOfFunds(useOfFunds.filter((_, idx) => idx !== i))}
                  className="text-neutral-600 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Offering'}
          </button>
        </div>
      </form>
    </div>
  );
}
