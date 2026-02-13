import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/interests/[id] — Update interest status
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
  const { status } = body;

  if (!['accepted', 'declined', 'withdrawn'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Get the interest
  const { data: interest } = await supabase
    .from('interests')
    .select('*, offering:offerings(*, company:companies(founder_id))')
    .eq('id', id)
    .single();

  if (!interest) {
    return NextResponse.json({ error: 'Interest not found' }, { status: 404 });
  }

  const founderId = (interest.offering as any)?.company?.founder_id;

  // Investors can only withdraw their own
  if (status === 'withdrawn' && interest.investor_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Founders can accept/decline interests on their offerings
  if (['accepted', 'declined'].includes(status) && founderId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('interests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: `interest_${status}`,
    entity_type: 'interest',
    entity_id: id,
    metadata: { offering_id: interest.offering_id },
  });

  return NextResponse.json({ data });
}
