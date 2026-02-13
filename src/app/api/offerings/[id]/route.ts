import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/offerings/[id] — Get offering detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: offering, error } = await supabase
    .from('offerings')
    .select('*, company:companies(*, founder:profiles(id, full_name, email, avatar_url))')
    .eq('id', id)
    .single();

  if (error || !offering) {
    return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
  }

  // Get interest count
  const { count: interestCount } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('offering_id', id);

  // Get total interest amount
  const { data: interests } = await supabase
    .from('interests')
    .select('amount')
    .eq('offering_id', id);

  const totalInterestAmount = interests?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

  return NextResponse.json({
    data: {
      ...offering,
      interest_count: interestCount || 0,
      total_interest_amount: totalInterestAmount,
    },
  });
}

// PATCH /api/offerings/[id] — Update offering
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Verify ownership
  const { data: offering } = await supabase
    .from('offerings')
    .select('*, company:companies(founder_id)')
    .eq('id', id)
    .single();

  if (!offering || (offering.company as any)?.founder_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('offerings')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'offering_updated',
    entity_type: 'offering',
    entity_id: id,
    metadata: { changes: Object.keys(body) },
  });

  return NextResponse.json({ data });
}

// DELETE /api/offerings/[id] — Delete offering
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('offerings')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
