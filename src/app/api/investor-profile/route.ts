import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/investor-profile — Get current investor profile
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('investor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || null });
}

// POST /api/investor-profile — Create or update investor profile
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Check if investor profile exists
  const { data: existing } = await supabase
    .from('investor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const payload = {
    user_id: user.id,
    accredited: body.accredited ?? false,
    investment_min: body.investment_min || null,
    investment_max: body.investment_max || null,
    sectors_of_interest: body.sectors_of_interest || [],
    stages_of_interest: body.stages_of_interest || [],
    portfolio_size: body.portfolio_size || 0,
  };

  let data, error;

  if (existing) {
    ({ data, error } = await supabase
      .from('investor_profiles')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from('investor_profiles')
      .insert(payload)
      .select()
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
