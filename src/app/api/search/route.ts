import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/search — Search offerings and companies
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // 'all', 'offerings', 'companies'

  if (!q.trim()) {
    return NextResponse.json({ data: { offerings: [], companies: [] } });
  }

  const results: { offerings?: any[]; companies?: any[] } = {};

  if (type === 'all' || type === 'offerings') {
    const { data: offerings } = await supabase
      .from('offerings')
      .select('*, company:companies(name, sector, stage)')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(20);
    results.offerings = offerings || [];
  }

  if (type === 'all' || type === 'companies') {
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,sector.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    results.companies = companies || [];
  }

  return NextResponse.json({ data: results });
}
