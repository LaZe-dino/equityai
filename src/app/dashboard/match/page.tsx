'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Offering } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Building2, DollarSign, ArrowRight, Target } from 'lucide-react';

interface MatchedOffering extends Offering {
  match_score: number;
  match_reasons: string[];
}

export default function MatchPage() {
  const [matches, setMatches] = useState<MatchedOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const res = await fetch('/api/match');
      const json = await res.json();
      if (json.data) {
        setMatches(json.data);
        setHasPreferences(json.has_preferences);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  }

  function getScoreLabel(score: number): string {
    if (score >= 70) return 'Strong Match';
    if (score >= 40) return 'Good Match';
    return 'Potential Match';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-orange-500" />
            Recommended For You
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized offering matches based on your investment preferences
          </p>
        </div>
        {!hasPreferences && (
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">
              <Target className="h-4 w-4 mr-2" />
              Set Preferences
            </Link>
          </Button>
        )}
      </div>

      {!hasPreferences && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Complete Your Investor Profile</h3>
                <p className="text-muted-foreground mt-1">
                  Add your preferred sectors, stages, and investment range to get better personalized recommendations.
                </p>
                <Button asChild className="mt-4 bg-gradient-to-r from-orange-500 to-red-500">
                  <Link href="/dashboard/settings">
                    Update Preferences
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {matches.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No matches yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              We&apos;ll show personalized recommendations here once there are live offerings that match your profile.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/offerings">Browse All Offerings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {matches.slice(0, 10).map((offering) => (
            <Card key={offering.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getScoreColor(offering.match_score)} text-white`}>
                        {offering.match_score}% {getScoreLabel(offering.match_score)}
                      </Badge>
                      {offering.company?.sector && (
                        <Badge variant="secondary">{offering.company.sector}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">
                      <Link 
                        href={`/offerings/${offering.id}`}
                        className="hover:text-orange-600 transition-colors"
                      >
                        {offering.title}
                      </Link>
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {offering.company?.name} • {offering.company?.stage?.replace('-', ' ')}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/offerings/${offering.id}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {offering.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Min: {formatCurrency(offering.minimum_investment)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Target: {formatCurrency(offering.target_raise)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">
                      {offering.offering_type.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {offering.match_reasons.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {offering.match_reasons.map((reason, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
