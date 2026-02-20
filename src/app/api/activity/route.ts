import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/activity — Get activity feed for current user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Get user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Build activity query based on user role
  let query = supabase
    .from('activity_log')
    .select(`
      *,
      actor:profiles(id, full_name, avatar_url, role)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (profile?.role === 'founder') {
    // Founders see: interests in their offerings, offering status changes
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('founder_id', user.id)
      .single();

    if (company) {
      const { data: offeringIds } = await supabase
        .from('offerings')
        .select('id')
        .eq('company_id', company.id);

      const ids = offeringIds?.map(o => o.id) || [];
      
      query = query.or(
        `user_id.eq.${user.id},` +
        `and(entity_type.eq.offering,entity_id.in.(${ids.join(',')})),` +
        `action.eq.interest_submitted`
      );
    }
  } else if (profile?.role === 'investor') {
    // Investors see: their own activities, status updates on their interests
    const { data: interestIds } = await supabase
      .from('interests')
      .select('offering_id')
      .eq('investor_id', user.id);

    const offeringIds = interestIds?.map(i => i.offering_id) || [];
    
    query = query.or(
      `user_id.eq.${user.id},` +
      `and(action.in.(interest_accepted,interest_declined),entity_id.in.(${offeringIds.join(',')}))`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format activities for display
  const formattedActivities = data?.map(activity => {
    const actor = activity.actor as any;
    return {
      ...activity,
      actor_name: actor?.full_name || 'Someone',
      actor_avatar: actor?.avatar_url,
      actor_role: actor?.role,
      formatted_message: formatActivityMessage(activity),
      time_ago: getTimeAgo(activity.created_at),
    };
  }) || [];

  return NextResponse.json({ 
    data: formattedActivities,
    count,
    has_more: (data?.length || 0) >= limit
  });
}

// POST /api/activity — Log a new activity (internal use)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      user_id: user.id,
      action: body.action,
      entity_type: body.entity_type || null,
      entity_id: body.entity_id || null,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

function formatActivityMessage(activity: any): string {
  const actor = activity.actor?.full_name || 'Someone';
  
  switch (activity.action) {
    case 'interest_submitted':
      return `${actor} expressed interest in your offering`;
    case 'interest_accepted':
      return `Your interest was accepted by the founder`;
    case 'interest_declined':
      return `Your interest was declined`;
    case 'offering_created':
      return `${actor} created a new offering`;
    case 'offering_live':
      return `Your offering is now live`;
    case 'offering_funded':
      return `Congratulations! Your offering reached its target`;
    case 'profile_updated':
      return `${actor} updated their profile`;
    case 'document_uploaded':
      return `${actor} uploaded a document`;
    case 'offering_saved':
      return `${actor} saved an offering to watchlist`;
    default:
      return `${actor} performed an action`;
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
