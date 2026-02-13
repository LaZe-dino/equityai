'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle } from 'lucide-react';

export default function ExpressInterestButton({
  offeringId,
  minimumInvestment,
  existingInterest,
}: {
  offeringId: string;
  minimumInvestment: number;
  existingInterest: any;
}) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (existingInterest) {
    return (
      <div className="text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
        <p className="mt-3 text-sm font-medium text-green-400">Interest Submitted</p>
        <p className="mt-1 text-xs text-neutral-500">
          Status: <span className="capitalize">{existingInterest.status}</span>
        </p>
        {existingInterest.amount && (
          <p className="mt-1 text-xs text-neutral-500">
            Amount: {formatCurrency(existingInterest.amount)}
          </p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents < minimumInvestment) {
      setError(`Minimum investment is ${formatCurrency(minimumInvestment)}`);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to invest');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('interests')
      .insert({
        investor_id: user.id,
        offering_id: offeringId,
        amount: amountCents,
        message: message || null,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'interest_submitted',
      entity_type: 'offering',
      entity_id: offeringId,
      metadata: { amount: amountCents },
    });

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
          Investment Amount ($)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={minimumInvestment / 100}
          step="0.01"
          className="glass-input"
          placeholder={`Min. ${formatCurrency(minimumInvestment)}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="glass-input resize-none"
          placeholder="Tell the founder why you're interested..."
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        <Send className="h-4 w-4" />
        {loading ? 'Submitting...' : 'Express Interest'}
      </button>

      <p className="text-xs text-neutral-600 text-center">
        This is a non-binding expression of interest
      </p>
    </form>
  );
}
