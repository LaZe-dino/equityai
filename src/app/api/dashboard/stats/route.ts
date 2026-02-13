import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/dashboard/stats — Dashboard metrics
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'founder') {
    return getFounderStats(supabase, user.id);
  } else if (profile?.role === 'investor') {
    return getInvestorStats(supabase, user.id);
  } else if (profile?.role === 'admin') {
    return getAdminStats(supabase);
  }

  return NextResponse.json({ data: {} });
}

async function getFounderStats(supabase: any, userId: string) {
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('founder_id', userId)
    .single();

  if (!company) {
    return NextResponse.json({ data: { has_company: false } });
  }

  const { count: totalOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id);

  const { count: liveOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('status', 'live');

  const { data: offerings } = await supabase
    .from('offerings')
    .select('id')
    .eq('company_id', company.id);

  const offeringIds = offerings?.map((o: any) => o.id) || [];
  let totalInterests = 0;
  let totalAmount = 0;
  let pendingInterests = 0;

  if (offeringIds.length > 0) {
    const { data: interests } = await supabase
      .from('interests')
      .select('amount, status')
      .in('offering_id', offeringIds);

    totalInterests = interests?.length || 0;
    totalAmount = interests?.reduce((s: number, i: any) => s + (i.amount || 0), 0) || 0;
    pendingInterests = interests?.filter((i: any) => i.status === 'pending').length || 0;
  }

  return NextResponse.json({
    data: {
      has_company: true,
      total_offerings: totalOfferings || 0,
      live_offerings: liveOfferings || 0,
      total_interests: totalInterests,
      total_amount: totalAmount,
      pending_interests: pendingInterests,
    },
  });
}

async function getInvestorStats(supabase: any, userId: string) {
  const { count: totalInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId);

  const { count: pendingInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId)
    .eq('status', 'pending');

  const { count: acceptedInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId)
    .eq('status', 'accepted');

  const { count: savedCount } = await supabase
    .from('saved_offerings')
    .select('*', { count: 'exact', head: true })
    .eq('investor_id', userId);

  const { count: liveOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live');

  return NextResponse.json({
    data: {
      total_interests: totalInterests || 0,
      pending_interests: pendingInterests || 0,
      accepted_interests: acceptedInterests || 0,
      saved_count: savedCount || 0,
      live_offerings: liveOfferings || 0,
    },
  });
}

async function getAdminStats(supabase: any) {
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true });

  const { count: pendingReview } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'under-review');

  const { count: liveOfferings } = await supabase
    .from('offerings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live');

  const { count: totalInterests } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    data: {
      total_users: totalUsers || 0,
      total_offerings: totalOfferings || 0,
      pending_review: pendingReview || 0,
      live_offerings: liveOfferings || 0,
      total_interests: totalInterests || 0,
    },
  });
}
