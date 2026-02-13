import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/companies — Create company
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('companies')
    .insert({
      founder_id: user.id,
      name: body.name,
      description: body.description || null,
      sector: body.sector,
      stage: body.stage,
      website: body.website || null,
      founded_year: body.founded_year || null,
      team_size: body.team_size || null,
      location: body.location || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: 'company_created',
    entity_type: 'company',
    entity_id: data.id,
    metadata: { name: body.name },
  });

  return NextResponse.json({ data }, { status: 201 });
}
