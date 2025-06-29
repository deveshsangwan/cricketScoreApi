// src/app/matches/[matchId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { MatchStats } from '@/types/matchStats';

export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchMatchStats = async () => {
      if (!isLoaded || !isSignedIn) return;

      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:3001/matchStats/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch match stats');
        }

        const data = await response.json();
        setMatchStats(data.response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchStats();
  }, [matchId, isLoaded, isSignedIn, getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-medium text-secondary animate-pulse">
          Loading match details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-medium text-red-500 bg-red-100 px-6 py-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!matchStats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-medium text-secondary">
          Match details not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">{matchStats.matchName}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="text-3xl font-semibold mb-6 text-center">Scorecard</h2>
          <div className="space-y-4">
            {matchStats.team1.name && (
              <div className="flex justify-between items-center bg-background p-4 rounded-lg">
                <p className="font-semibold text-lg">{matchStats.team1.name} {matchStats.team1.isBatting && '(Batting)'}</p>
                <p className="font-bold text-xl text-primary">
                  {matchStats.team1.score}/{matchStats.team1.wickets} {matchStats.team1.overs && `(${matchStats.team1.overs} overs)`}
                </p>
              </div>
            )}
            {matchStats.team2.name && (
              <div className="flex justify-between items-center bg-background p-4 rounded-lg">
                <p className="font-semibold text-lg">{matchStats.team2.name} {matchStats.team2.isBatting && '(Batting)'}</p>
                <p className="font-bold text-xl text-primary">
                  {matchStats.team2.score}/{matchStats.team2.wickets} {matchStats.team2.overs && `(${matchStats.team2.overs} overs)`}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="text-3xl font-semibold mb-6 text-center">Current Batting</h2>
          <div className="space-y-4">
            {matchStats.onBatting?.player1 && (
              <div className="flex justify-between items-center bg-background p-4 rounded-lg">
                <p className="font-semibold text-lg">{matchStats.onBatting.player1.name}</p>
                <p className="font-bold text-xl text-primary">
                  {matchStats.onBatting.player1.runs} ({matchStats.onBatting.player1.balls})
                </p>
              </div>
            )}
            {matchStats.onBatting?.player2 && (
              <div className="flex justify-between items-center bg-background p-4 rounded-lg">
                <p className="font-semibold text-lg">{matchStats.onBatting.player2.name}</p>
                <p className="font-bold text-xl text-primary">
                  {matchStats.onBatting.player2.runs} ({matchStats.onBatting.player2.balls})
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="text-3xl font-semibold mb-6 text-center">Run Rates</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-background p-4 rounded-lg">
              <p className="font-semibold text-lg">Current Run Rate</p>
              <p className="font-bold text-xl text-primary">{matchStats?.runRate?.currentRunRate}</p>
            </div>
            <div className="flex justify-between items-center bg-background p-4 rounded-lg">
              <p className="font-semibold text-lg">Required Run Rate</p>
              <p className="font-bold text-xl text-primary">{matchStats?.runRate?.requiredRunRate}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-8 rounded-xl shadow-lg border border-border">
          <h2 className="text-3xl font-semibold mb-6 text-center">Match Info</h2>
          <div className="space-y-4">
            <p><strong>Status:</strong> {matchStats.isLive ? 'Live' : 'Finished'}</p>
            <p><strong>Tournament:</strong> {matchStats.tournamentName}</p>
            <p><strong>Summary:</strong> {matchStats.summary}</p>
          </div>
        </div>
      </div>
    </div >
  );
}