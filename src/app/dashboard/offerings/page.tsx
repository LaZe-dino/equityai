import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { FileText, ArrowUpRight, PlusCircle } from 'lucide-react';

export default async function MyOfferingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="glass-card py-16 text-center"><p className="text-neutral-500">Please sign in.</p></div>;
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('founder_id', user.id)
    .single();

  const { data: offerings } = company
    ? await supabase
        .from('offerings')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Offerings</h1>
          <p className="mt-1 text-neutral-500">Manage your investment offerings</p>
        </div>
        <Link href="/dashboard/offerings/new" className="btn-primary text-sm">
          <PlusCircle className="h-4 w-4" />
          New Offering
        </Link>
      </div>

      {offerings && offerings.length > 0 ? (
        <div className="space-y-4">
          {offerings.map((offering) => (
            <div key={offering.id} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{offering.title}</h3>
                    <p className="text-sm text-neutral-500">
                      {formatCurrency(offering.target_raise)} · {offering.offering_type} · Created {formatDate(offering.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${
                    offering.status === 'live' ? 'badge-live' :
                    offering.status === 'draft' ? 'badge-draft' :
                    offering.status === 'under-review' ? 'badge-review' :
                    offering.status === 'funded' ? 'badge-funded' :
                    'badge-draft'
                  }`}>
                    {offering.status}
                  </span>
                  <Link
                    href={`/dashboard/offerings/${offering.id}/edit`}
                    className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
                  >
                    Edit <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-neutral-700" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-400">No offerings yet</h3>
          <p className="mt-2 text-sm text-neutral-600">Create your first offering to start attracting investors.</p>
          <Link href="/dashboard/offerings/new" className="btn-primary mt-6 inline-flex text-sm">
            <PlusCircle className="h-4 w-4" />
            Create Offering
          </Link>
        </div>
      )}
    </div>
  );
}
