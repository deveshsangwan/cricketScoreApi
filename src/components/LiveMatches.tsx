'use client';

import { useState, useEffect } from "react";
import { useToken } from "@/hooks/useToken";
import { useRouter } from 'next/navigation';

interface Match {
  matchId: string;
  matchName: string;
  matchUrl: string;
}

export default function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useToken();
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:3001/liveMatches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data: Record<string, any> = await response.json();
        const matchesArray = Object.entries(data.response).map(([matchId, value]) => ({
          matchId,
          matchName: (value as { matchName: string }).matchName,
          matchUrl: (value as { matchUrl: string }).matchUrl
        }));
        setMatches(matchesArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token]);

  const handleViewMatchDetails = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg font-medium text-secondary animate-pulse">
          Loading matches...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg font-medium text-red-500 bg-red-100 px-6 py-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold text-foreground mb-8">Live Matches</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <div 
            key={match.matchId} 
            className="p-6 border border-border rounded-xl shadow-lg hover:shadow-2xl transition-shadow bg-card transform hover:-translate-y-1"
          >
            <h3 className="text-xl font-semibold text-foreground mb-4 h-16 overflow-hidden">{match.matchName}</h3>
            <p className="text-sm text-secondary mb-4">
              <span className="font-medium">Match ID:</span> {match.matchId}
            </p>
            <button 
              onClick={() => handleViewMatchDetails(match.matchId)}
              className="mt-4 w-full text-sm text-white bg-primary hover:bg-opacity-90 py-2 px-4 rounded-lg transition-all"
            >
              View Match Details
            </button>
          </div>
        ))}
      </div>
      {matches.length === 0 && (
        <div className="text-center text-secondary py-12">
          No live matches available at the moment.
        </div>
      )}
    </section>
  );
}