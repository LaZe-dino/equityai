import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/offerings — List offerings with filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const sector = searchParams.get('sector');
  const stage = searchParams.get('stage');
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const status = searchParams.get('status') || 'live';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('offerings')
    .select('*, company:companies(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Only show live offerings to non-owners, unless specifically requesting other statuses
  if (status === 'all') {
    // Admin/owner view — will be filtered by RLS anyway
  } else {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (type) {
    query = query.eq('offering_type', type);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter by sector/stage on the joined company if needed
  let filtered = data || [];
  if (sector) {
    filtered = filtered.filter((o: any) => o.company?.sector === sector);
  }
  if (stage) {
    filtered = filtered.filter((o: any) => o.company?.stage === stage);
  }

  return NextResponse.json({ data: filtered, count });
}

// POST /api/offerings — Create a new offering
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Verify user has a company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('founder_id', user.id)
    .single();

  if (!company) {
    return NextResponse.json({ error: 'Create a company first' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('offerings')
    .insert({
      company_id: company.id,
      title: body.title,
      description: body.description,
      offering_type: body.offering_type,
      target_raise: body.target_raise,
      minimum_investment: body.minimum_investment,
      valuation_cap: body.valuation_cap || null,
      equity_percentage: body.equity_percentage || null,
      deadline: body.deadline || null,
      highlights: body.highlights || [],
      risks: body.risks || [],
      use_of_funds: body.use_of_funds || [],
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'offering_created',
    entity_type: 'offering',
    entity_id: data.id,
    metadata: { title: body.title },
  });

  return NextResponse.json({ data }, { status: 201 });
}
