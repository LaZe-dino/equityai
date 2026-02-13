import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/offerings — List all offerings (admin only)
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

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use admin client to bypass RLS
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('offerings')
    .select('*, company:companies(name, sector, stage, founder:profiles(full_name, email))')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// PATCH /api/admin/offerings — Approve or reject an offering
export async function PATCH(request: NextRequest) {
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

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { offering_id, status } = body;

  if (!offering_id || !['live', 'draft', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('offerings')
    .update({ status })
    .eq('id', offering_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from('activity_log').insert({
    user_id: user.id,
    action: `offering_${status === 'live' ? 'approved' : 'rejected'}`,
    entity_type: 'offering',
    entity_id: offering_id,
  });

  return NextResponse.json({ data });
}
