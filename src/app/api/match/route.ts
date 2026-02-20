import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/match — Get personalized offering matches for logged-in investor
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get investor profile with preferences
  const { data: investorProfile } = await supabase
    .from('investor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get all live offerings with company details
  const { data: offerings, error } = await supabase
    .from('offerings')
    .select(`
      *,
      company:companies(*),
      interests:interests(count)
    `)
    .eq('status', 'live');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get user's existing interests to exclude
  const { data: userInterests } = await supabase
    .from('interests')
    .select('offering_id')
    .eq('investor_id', user.id);

  const interestedOfferingIds = new Set(userInterests?.map(i => i.offering_id) || []);

  // Score and rank offerings
  const scoredOfferings = offerings
    .filter(o => !interestedOfferingIds.has(o.id)) // Exclude already interested
    .map(offering => {
      let score = 0;
      const reasons: string[] = [];

      const company = offering.company as any;
      const sectors = investorProfile?.sectors_of_interest || [];
      const stages = investorProfile?.stages_of_interest || [];
      const minInvestment = investorProfile?.investment_min;
      const maxInvestment = investorProfile?.investment_max;

      // Sector match (40 points)
      if (sectors.length > 0 && company?.sector) {
        const sectorMatch = sectors.some(s => 
          company.sector.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(company.sector.toLowerCase())
        );
        if (sectorMatch) {
          score += 40;
          reasons.push(`Matches your interest in ${company.sector}`);
        }
      }

      // Stage match (30 points)
      if (stages.length > 0 && company?.stage) {
        if (stages.includes(company.stage)) {
          score += 30;
          reasons.push(`${company.stage.replace('-', ' ')} stage matches your preference`);
        }
      }

      // Investment amount fit (20 points)
      if (minInvestment != null && maxInvestment != null) {
        if (offering.minimum_investment >= minInvestment && 
            offering.minimum_investment <= maxInvestment) {
          score += 20;
          reasons.push('Minimum investment fits your range');
        } else if (offering.minimum_investment <= maxInvestment) {
          score += 10;
          reasons.push('Within your maximum investment capacity');
        }
      }

      // Social proof - popular offerings (10 points)
      const interestCount = offering.interests?.[0]?.count || 0;
      if (interestCount >= 5) {
        score += 10;
        reasons.push('Popular with other investors');
      } else if (interestCount >= 2) {
        score += 5;
        reasons.push('Gaining traction');
      }

      // New offering boost (up to 10 points, decays over 7 days)
      const createdAt = new Date(offering.created_at);
      const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 3) {
        score += 10;
        reasons.push('New listing');
      } else if (daysSinceCreated < 7) {
        score += 5;
      }

      return {
        ...offering,
        match_score: score,
        match_reasons: reasons,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);

  return NextResponse.json({ 
    data: scoredOfferings,
    total: scoredOfferings.length,
    has_preferences: !!investorProfile && 
      (investorProfile.sectors_of_interest?.length > 0 || 
       investorProfile.stages_of_interest?.length > 0)
  });
}
