import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/offerings/[id]/interests — List interests for an offering
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('interests')
    .select('*, investor:profiles(id, full_name, email, avatar_url)')
    .eq('offering_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/offerings/[id]/interests — Express interest in an offering
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is investor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'investor') {
    return NextResponse.json({ error: 'Only investors can express interest' }, { status: 403 });
  }

  // Check offering exists and is live
  const { data: offering } = await supabase
    .from('offerings')
    .select('id, status, minimum_investment')
    .eq('id', id)
    .single();

  if (!offering || offering.status !== 'live') {
    return NextResponse.json({ error: 'Offering not available' }, { status: 404 });
  }

  const body = await request.json();

  if (body.amount && body.amount < offering.minimum_investment) {
    return NextResponse.json(
      { error: `Minimum investment is ${offering.minimum_investment}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('interests')
    .insert({
      investor_id: user.id,
      offering_id: id,
      amount: body.amount || null,
      message: body.message || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already expressed interest' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'interest_submitted',
    entity_type: 'offering',
    entity_id: id,
    metadata: { amount: body.amount },
  });

  return NextResponse.json({ data }, { status: 201 });
}
