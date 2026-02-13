'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { OFFERING_TYPES } from '@/types';
import { Save, Plus, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditOfferingPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    offering_type: 'safe',
    target_raise: '',
    minimum_investment: '',
    valuation_cap: '',
    equity_percentage: '',
    deadline: '',
    status: 'draft',
  });
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [risks, setRisks] = useState<string[]>(['']);
  const [useOfFunds, setUseOfFunds] = useState<{ category: string; percentage: string }[]>([
    { category: '', percentage: '' },
  ]);

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    const { data } = await supabase
      .from('offerings')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setForm({
        title: data.title || '',
        description: data.description || '',
        offering_type: data.offering_type || 'safe',
        target_raise: data.target_raise ? (data.target_raise / 100).toString() : '',
        minimum_investment: data.minimum_investment ? (data.minimum_investment / 100).toString() : '',
        valuation_cap: data.valuation_cap ? (data.valuation_cap / 100).toString() : '',
        equity_percentage: data.equity_percentage?.toString() || '',
        deadline: data.deadline ? data.deadline.split('T')[0] : '',
        status: data.status,
      });
      const h = (data.highlights as string[]) || [];
      setHighlights(h.length > 0 ? h : ['']);
      const r = (data.risks as string[]) || [];
      setRisks(r.length > 0 ? r : ['']);
      const u = (data.use_of_funds as any[]) || [];
      setUseOfFunds(
        u.length > 0
          ? u.map(item => ({ category: item.category, percentage: item.percentage.toString() }))
          : [{ category: '', percentage: '' }]
      );
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
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
    };

    const res = await fetch(`/api/offerings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSuccess('Offering updated!');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update');
    }
    setSaving(false);
  };

  const submitForReview = async () => {
    const res = await fetch(`/api/offerings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'under-review' }),
    });
    if (res.ok) {
      setForm(prev => ({ ...prev, status: 'under-review' }));
      setSuccess('Submitted for review!');
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
        <Link href="/dashboard/offerings" className="text-sm text-neutral-500 hover:text-white flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Offerings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Offering</h1>
            <p className="mt-1 text-neutral-500">Update your offering details</p>
          </div>
          <span className={`badge ${
            form.status === 'live' ? 'badge-live' :
            form.status === 'under-review' ? 'badge-review' :
            form.status === 'funded' ? 'badge-funded' :
            'badge-draft'
          }`}>
            {form.status}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">{success}</div>
        )}

        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Basics</h2>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="glass-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} className="glass-input resize-none" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Type</label>
              <select value={form.offering_type} onChange={(e) => setForm({ ...form, offering_type: e.target.value })} className="glass-input">
                {OFFERING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="glass-input" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Financial Terms</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Target Raise ($) *</label>
              <input type="number" value={form.target_raise} onChange={(e) => setForm({ ...form, target_raise: e.target.value })} required className="glass-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Min Investment ($) *</label>
              <input type="number" value={form.minimum_investment} onChange={(e) => setForm({ ...form, minimum_investment: e.target.value })} required className="glass-input" />
            </div>
            {(form.offering_type === 'safe' || form.offering_type === 'convertible-note') && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Valuation Cap ($)</label>
                <input type="number" value={form.valuation_cap} onChange={(e) => setForm({ ...form, valuation_cap: e.target.value })} className="glass-input" />
              </div>
            )}
            {form.offering_type === 'equity' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Equity %</label>
                <input type="number" value={form.equity_percentage} onChange={(e) => setForm({ ...form, equity_percentage: e.target.value })} className="glass-input" />
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Highlights</h2>
            <button type="button" onClick={() => setHighlights([...highlights, ''])} className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={h} onChange={(e) => { const n = [...highlights]; n[i] = e.target.value; setHighlights(n); }} className="glass-input" placeholder="Key selling point..." />
              {highlights.length > 1 && (
                <button type="button" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))} className="text-neutral-600 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Use of Funds</h2>
            <button type="button" onClick={() => setUseOfFunds([...useOfFunds, { category: '', percentage: '' }])} className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {useOfFunds.map((u, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={u.category} onChange={(e) => { const n = [...useOfFunds]; n[i].category = e.target.value; setUseOfFunds(n); }} className="glass-input flex-1" placeholder="Category" />
              <input type="number" value={u.percentage} onChange={(e) => { const n = [...useOfFunds]; n[i].percentage = e.target.value; setUseOfFunds(n); }} className="glass-input w-24" placeholder="%" />
              {useOfFunds.length > 1 && (
                <button type="button" onClick={() => setUseOfFunds(useOfFunds.filter((_, idx) => idx !== i))} className="text-neutral-600 hover:text-red-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          {form.status === 'draft' && (
            <button type="button" onClick={submitForReview} className="btn-secondary text-sm">
              Submit for Review
            </button>
          )}
          <div className="ml-auto">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
