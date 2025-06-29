// src/app/matches/[matchId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { MatchStats } from '@/types/matchStats'; // Assuming this type definition exists

// A simple map to get country codes for flags. You can expand this.
const teamToCountryCode: { [key: string]: string } = {
    'South Africa': 'za',
    'Zimbabwe': 'zw',
    'India': 'in',
    'Australia': 'au',
    'England': 'gb-eng',
    'New Zealand': 'nz',
    'Pakistan': 'pk',
    'Sri Lanka': 'lk',
    'West Indies': 'ag', // Using Antigua & Barbuda for West Indies
    'Bangladesh': 'bd',
};

// Helper to get the flag URL
const getTeamFlag = (teamName: string) => {
    const code = teamToCountryCode[teamName];
    if (code) {
        return `https://flagcdn.com/w80/${code}.png`;
    }
    // Fallback placeholder
    const placeholderText = teamName?.substring(0, 3).toUpperCase();
    return `https://placehold.co/48x48/1e293b/ffffff?text=${placeholderText}`;
};

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
        // IMPORTANT: Ensure your backend is running and accessible at this address.
        const response = await fetch(`http://localhost:3001/matchStats/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch match stats. Please check if the server is running.');
        }

        const data = await response.json();
        setMatchStats(data.response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if(isLoaded && isSignedIn) {
        fetchMatchStats();
    }
  }, [matchId, isLoaded, isSignedIn, getToken]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-950 text-slate-100">
          <svg className="animate-spin h-8 w-8 text-sky-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        <p className="text-lg font-medium text-slate-100">Loading Match Details...</p>
        <p className="text-sm text-slate-400">Please wait a moment.</p>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-900 p-4">
            <div className="w-full max-w-md text-center bg-slate-800/60 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-white">An Error Occurred</h2>
                <p className="mt-2 text-slate-300">{error}</p>
                 <button onClick={() => window.location.reload()} className="mt-6 bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors">
                    Try Again
                </button>
            </div>
      </div>
    );
  }

  // Enhanced "Not Found" State
  if (!matchStats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 p-4">
            <div className="w-full max-w-md text-center bg-slate-800/60 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-white">Match Not Found</h2>
                <p className="mt-2 text-slate-300">We couldn't find the details for this match.</p>
            </div>
      </div>
    );
  }

  // Main component render with the new design
  return (
    <div className="text-slate-200 antialiased">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            {/* Header: Match Title and Status */}
            <header className="mb-8 text-center">
                <p className="text-sm text-sky-400 font-semibold uppercase tracking-wider">{matchStats.tournamentName}</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2">{matchStats.matchName}</h1>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-4 ${matchStats.isLive ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${matchStats.isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {matchStats.isLive ? 'Live' : 'Finished'}
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                {/* Left Column: Main Scorecard */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/60 border border-slate-700 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Scorecard</h2>
                        
                        {/* Team 1 Score */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/50">
                            <div className="flex items-center gap-4">
                                <img src={getTeamFlag(matchStats.team1.name)} alt={`${matchStats.team1.name} Flag`} className="w-12 h-12 object-cover rounded-full border-2 border-slate-600" />
                                <div>
                                    <p className="text-xl font-bold text-white">
                                        {matchStats.team1.name} 
                                        {matchStats.team1.isBatting && <span className="text-sm font-medium text-slate-400"> (Batting)</span>}
                                    </p>
                                    <p className="text-lg font-medium text-slate-300">{matchStats.team1.overs} Overs</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-extrabold text-white">{matchStats.team1.score}/{matchStats.team1.wickets}</p>
                            </div>
                        </div>
                        
                        <div className="my-4 text-center font-bold text-slate-500">vs</div>

                        {/* Team 2 Score */}
                        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/50">
                            <div className="flex items-center gap-4">
                               <img src={getTeamFlag(matchStats.team2.name)} alt={`${matchStats.team2.name} Flag`} className="w-12 h-12 object-cover rounded-full border-2 border-slate-600" />
                                <div>
                                    <p className="text-xl font-bold text-white">
                                        {matchStats.team2.name}
                                        {matchStats.team2.isBatting && <span className="text-sm font-medium text-slate-400"> (Batting)</span>}
                                    </p>
                                     <p className="text-lg font-medium text-slate-300">{matchStats.team2.overs} Overs</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-extrabold text-white">{matchStats.team2.score}/{matchStats.team2.wickets}</p>
                            </div>
                        </div>

                        {/* Match Summary */}
                        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                            <p className="text-lg font-semibold text-amber-400">{matchStats.summary}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Additional Info */}
                <div className="space-y-6 mt-6 lg:mt-0">
                    {/* Current Batting */}
                    <div className="bg-slate-800/60 border border-slate-700 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Current Batting</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-sky-300">{matchStats.onBatting?.player1?.name} *</p>
                                <p className="font-bold text-lg text-white">
                                    {matchStats.onBatting?.player1?.runs} 
                                    <span className="text-sm font-normal text-slate-400"> ({matchStats.onBatting?.player1?.balls})</span>
                                </p>
                            </div>
                             <div className="flex justify-between items-center">
                                <p className="font-medium text-slate-300">{matchStats.onBatting?.player2?.name}</p>
                                <p className="font-bold text-lg text-white">
                                    {matchStats.onBatting?.player2?.runs} 
                                    <span className="text-sm font-normal text-slate-400"> ({matchStats.onBatting?.player2?.balls})</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Run Rates */}
                     <div className="bg-slate-800/60 border border-slate-700 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Run Rates</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-slate-300">Current Run Rate</p>
                                <p className="text-2xl font-extrabold text-green-400">{matchStats.runRate?.currentRunRate}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-slate-300">Required Run Rate</p>
                                <p className="text-2xl font-extrabold text-slate-500">{matchStats.runRate?.requiredRunRate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Match Info */}
                     <div className="bg-slate-800/60 border border-slate-700 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Match Info</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-slate-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span className="font-medium">Status:</span>
                                <span className="text-slate-300">{matchStats.isLive ? 'Live' : 'Finished'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-slate-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-12a2.25 2.25 0 01-2.25-2.25V3m12.75 11.25l-3-3m0 0l-3 3m3-3v6m-9-4.5h6" /></svg>
                                <span className="font-medium">Tournament:</span>
                                <span className="text-slate-300">{matchStats.tournamentName}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}
