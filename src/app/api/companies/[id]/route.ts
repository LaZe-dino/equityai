import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/companies/[id] — Get company detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('companies')
    .select('*, founder:profiles(id, full_name, email, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  // Get offerings for this company
  const { data: offerings } = await supabase
    .from('offerings')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ data: { ...data, offerings: offerings || [] } });
}

// PATCH /api/companies/[id] — Update company
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

  const { data, error } = await supabase
    .from('companies')
    .update(body)
    .eq('id', id)
    .eq('founder_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
