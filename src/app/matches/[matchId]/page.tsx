'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRealTimeMatchStats } from '@/hooks/useMatchStats';
import { FullPageLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { MatchStats } from '@/types/api';

// Comprehensive cricket team to ISO country code mapping
// Based on ICC members and uses ISO 3166-1 alpha-2 country codes
const cricketTeamMapping = new Map<string, string>([
  // ICC Full Members
  ['Afghanistan', 'af'],
  ['Australia', 'au'],
  ['Bangladesh', 'bd'],
  ['England', 'gb'],
  ['India', 'in'],
  ['Ireland', 'ie'],
  ['New Zealand', 'nz'],
  ['Pakistan', 'pk'],
  ['South Africa', 'za'],
  ['Sri Lanka', 'lk'],
  ['West Indies', 'ag'],  // Using Antigua & Barbuda as representative
  ['Zimbabwe', 'zw'],
  
  // ICC Associate Members with frequent appearances
  ['Scotland', 'gb-sct'],
  ['Netherlands', 'nl'],
  ['Nepal', 'np'],
  ['Oman', 'om'],
  ['United Arab Emirates', 'ae'],
  ['Hong Kong', 'hk'],
  ['Canada', 'ca'],
  ['USA', 'us'],
  ['United States', 'us'],
  ['Papua New Guinea', 'pg'],
  ['Namibia', 'na'],
  ['Kenya', 'ke'],
  ['Uganda', 'ug'],
  ['Jersey', 'je'],
  ['Guernsey', 'gg'],
  ['Malaysia', 'my'],
  ['Singapore', 'sg'],
  ['Thailand', 'th'],
  ['Kuwait', 'kw'],
  ['Qatar', 'qa'],
  ['Bahrain', 'bh'],
  ['Bermuda', 'bm'],
  ['Cayman Islands', 'ky'],
  ['Denmark', 'dk'],
  ['Germany', 'de'],
  ['Italy', 'it'],
  ['France', 'fr'],
  ['Norway', 'no'],
  ['Sweden', 'se'],
  ['Austria', 'at'],
  ['Belgium', 'be'],
  ['Spain', 'es'],
  ['Portugal', 'pt'],
  ['Czech Republic', 'cz'],
  ['Finland', 'fi'],
  ['Estonia', 'ee'],
  ['Latvia', 'lv'],
  ['Lithuania', 'lt'],
  ['Poland', 'pl'],
  ['Brazil', 'br'],
  ['Argentina', 'ar'],
  ['Chile', 'cl'],
  ['Mexico', 'mx'],
  ['Peru', 'pe'],
  ['Japan', 'jp'],
  ['China', 'cn'],
  ['South Korea', 'kr'],
  ['Indonesia', 'id'],
  ['Philippines', 'ph'],
  ['Vietnam', 'vn'],
  ['Cambodia', 'kh'],
  ['Laos', 'la'],
  ['Myanmar', 'mm'],
  ['Israel', 'il'],
  ['Turkey', 'tr'],
  ['Greece', 'gr'],
  ['Cyprus', 'cy'],
  ['Malta', 'mt'],
  ['Gibraltar', 'gi'],
  ['Isle of Man', 'im'],
  ['Fiji', 'fj'],
  ['Vanuatu', 'vu'],
  ['Cook Islands', 'ck'],
  ['Samoa', 'ws'],
  ['Tanzania', 'tz'],
  ['Botswana', 'bw'],
  ['Ghana', 'gh'],
  ['Nigeria', 'ng'],
  ['Gambia', 'gm'],
  ['Sierra Leone', 'sl'],
  ['Rwanda', 'rw'],
  ['Malawi', 'mw'],
  ['Mozambique', 'mz'],
  ['Lesotho', 'ls'],
  ['Eswatini', 'sz'],
  ['Hungary', 'hu'],
  
  // Alternative/common name variations
  ['UAE', 'ae'],
  ['United States of America', 'us'],
  ['UK', 'gb'],
  ['Britain', 'gb'],
  ['Great Britain', 'gb'],
  ['Northern Ireland', 'gb'],
  ['Wales', 'gb'],
  ['Windies', 'ag'],
  ['WI', 'ag'],
  ['West Indies Cricket Team', 'ag'],
  ['South Korea', 'kr'],
  ['Republic of Korea', 'kr'],
  ['North Korea', 'kp'],
  ['Democratic Republic of Congo', 'cd'],
  ['Congo', 'cg'],
  ['Czech', 'cz'],
  ['Holland', 'nl'],
  ['Burma', 'mm'],
]);

// Enhanced flag URL generator with better fallback logic
const getTeamFlag = (teamName: string): string => {
  if (!teamName) {
    return generatePlaceholder('TBD');
  }

  // Clean and normalize team name
  const cleanTeamName = teamName.trim();
  
  // Direct mapping lookup
  const countryCode = cricketTeamMapping.get(cleanTeamName);
  
  if (countryCode) {
    return `https://flagcdn.com/w80/${countryCode}.png`;
  }

  // Fuzzy matching for partial names or different formats
  const fuzzyMatch = findFuzzyMatch(cleanTeamName);
  if (fuzzyMatch) {
    return `https://flagcdn.com/w80/${fuzzyMatch}.png`;
  }

  // Generate placeholder for unknown teams
  return generatePlaceholder(cleanTeamName);
};

// Helper function for fuzzy matching team names
const findFuzzyMatch = (teamName: string): string | null => {
  const lowerTeamName = teamName.toLowerCase();
  
  // Check if team name contains any mapped team name
  for (const [key, value] of cricketTeamMapping.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerTeamName.includes(lowerKey) || lowerKey.includes(lowerTeamName)) {
      return value;
    }
  }
  
  // Special cases for common variations
  const specialCases = new Map<string, string>([
    ['eng', 'gb'],
    ['aus', 'au'],
    ['ind', 'in'],
    ['aut', 'at'],
    ['pak', 'pk'],
    ['sa', 'za'],
    ['rsa', 'za'],
    ['nz', 'nz'],
    ['ban', 'bd'],
    ['sl', 'lk'],
    ['afg', 'af'],
    ['ire', 'ie'],
    ['zim', 'zw'],
    ['wi', 'ag'],
    ['sco', 'gb-sct'],
    ['ned', 'nl'],
    ['nep', 'np'],
    ['oma', 'om'],
    ['png', 'pg'],
    ['nam', 'na'],
    ['ken', 'ke'],
    ['uga', 'ug'],
  ]);
  
  return specialCases.get(lowerTeamName) || null;
};

// Generate placeholder image with team initials
const generatePlaceholder = (teamName: string): string => {
  const initials = teamName
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 3);
  
  // Using a more reliable placeholder service with better styling
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1e293b&color=ffffff&size=80&font-size=0.6&bold=true&format=png`;
};

// Reusable components
const InfoCard = React.memo<{ title: string; children: React.ReactNode; className?: string }>(
  ({ title, children, className = '' }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      layout={false}
      className={`bg-gradient-to-br from-[#142D3B] to-[#0f2230] border border-[#234354] rounded-2xl p-6 shadow-xl flex flex-col ${className}`}
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
        {title}
      </h2>
      <div className="flex-grow space-y-5">
        {children}
      </div>
    </motion.div>
  )
);

InfoCard.displayName = 'InfoCard';

const TeamScore = React.memo<{ team: any; isBatting?: boolean }>(
  ({ team, isBatting }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 backdrop-blur-sm transition-all hover:bg-slate-800/70">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={getTeamFlag(team.name)} 
            alt={`${team.name} Flag`} 
            className="w-12 h-12 object-cover rounded-full border-2 border-slate-600 shadow-lg" 
          />
          {isBatting && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
          )}
        </div>
        <div>
          <p className="text-xl font-bold text-white">
            {team.name}
            {team.isBatting && (
              <span className="ml-2 text-xs font-medium text-red-400 uppercase tracking-wider bg-red-500/10 py-1 px-2 rounded-full">
                Batting
              </span>
            )}
          </p>
          {team.overs !== undefined && (
            <p className="text-sm font-medium text-slate-400">
              <span className="inline-block mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              {team.overs} Overs
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {team.score !== undefined ? team.score : '0'}
          {team.wickets !== undefined && `/${team.wickets}`}
        </p>
      </div>
    </div>
  )
);

TeamScore.displayName = 'TeamScore';

const BattingPlayer = React.memo<{ player: any; isStriker?: boolean }>(
  ({ player, isStriker }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg ${isStriker ? 'bg-sky-950/40' : 'bg-slate-800/20'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isStriker ? 'bg-sky-400' : 'bg-slate-600'}`}></div>
        <p className={`font-semibold ${isStriker ? 'text-sky-300' : 'text-slate-300'}`}>
          {player.name} {isStriker && <span className="text-sky-500">*</span>}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="font-bold text-lg text-white">{player.runs}</p>
        <span className="text-xs font-normal text-slate-400">({player.balls})</span>
      </div>
    </div>
  )
);

BattingPlayer.displayName = 'BattingPlayer';

// Enhanced error component
const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md text-center bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl"
    >
      <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">Connection Error</h2>
      <p className="mt-2 text-slate-300">{error}</p>
      <div className="mt-6 flex gap-3 justify-center">
        <button 
          onClick={onRetry}
          className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-sky-500/25 focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.history.back()}
          className="bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-600 transition-all focus:ring-2 focus:ring-slate-500/50 focus:outline-none"
        >
          Go Back
        </button>
      </div>
    </motion.div>
  </div>
);

// Not found component
const NotFoundDisplay: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md text-center bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl"
    >
      <div className="w-16 h-16 mx-auto bg-slate-700/30 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">Match Not Found</h2>
      <p className="mt-2 text-slate-300">We couldn't find the details for this match.</p>
      <button 
        onClick={() => window.history.back()}
        className="mt-6 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-sky-500/25 focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
      >
        Go Back
      </button>
    </motion.div>
  </div>
);

export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  
  // Use real-time hook with 30-second polling for live matches
  const { matchStats, isLoading, error, refetch } = useRealTimeMatchStats(matchId, 30000);

  // Loading State
  if (isLoading) {
    return <FullPageLoadingSkeleton />;
  }

  // Error State
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  // Not Found State
  if (!matchStats) {
    return <NotFoundDisplay />;
  }

  // Main render with match data
  return (
    <div className="min-h-screen text-slate-200 antialiased bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
        {/* Header: Match Title and Status */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          layout={false}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 mb-3">
            {matchStats.tournamentName}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
            {matchStats.matchName}
          </h1>
          
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mt-4 ${
            matchStats.isLive 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              matchStats.isLive 
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                : 'bg-slate-400'
            }`}></span>
            {matchStats.isLive ? 'Live' : 'Finished'}
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Main Scorecard */}
          <div className="lg:col-span-2 space-y-6">
            <InfoCard title="Scorecard">
              {/* Team 1 Score */}
              {matchStats.team1 && (
                <TeamScore team={matchStats.team1} isBatting={matchStats.team1.isBatting} />
              )}

              <div className="my-4 text-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#142D3B] text-slate-500 font-medium uppercase text-xs tracking-wider">vs</span>
                </div>
              </div>

              {/* Team 2 Score */}
              {matchStats.team2 && (
                <TeamScore team={matchStats.team2} isBatting={matchStats.team2.isBatting} />
              )}

              {/* Match Summary */}
              {matchStats.summary && (
                <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                  <p className="text-lg font-semibold text-amber-400 bg-amber-400/10 py-3 px-4 rounded-lg inline-block">
                    {matchStats.summary}
                  </p>
                </div>
              )}
            </InfoCard>
          </div>

          {/* Right Column: Additional Info */}
          <div className="space-y-6">
            {/* Current Batting */}
            {matchStats.onBatting && (
              <InfoCard title="Current Batting">
                <div className="space-y-2">
                  {matchStats.onBatting.player1 && (
                    <BattingPlayer player={matchStats.onBatting.player1} isStriker={true} />
                  )}
                  {matchStats.onBatting.player2 && (
                    <BattingPlayer player={matchStats.onBatting.player2} />
                  )}
                </div>
              </InfoCard>
            )}

            {/* Run Rates */}
            {matchStats.runRate && (
              <InfoCard title="Run Rates">
                <div className="space-y-4">
                  {matchStats.runRate.currentRunRate !== undefined && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-400">Current Run Rate</p>
                        <p className="text-xl font-extrabold text-green-400 ml-3 min-w-[3rem] text-right">
                          {matchStats.runRate.currentRunRate}
                        </p>
                    </div>
                  )}
                  
                  {matchStats.runRate.requiredRunRate !== undefined && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-slate-400">Required Run Rate</p>
                        <p className="text-xl font-extrabold text-amber-400 ml-3 min-w-[3rem] text-right">
                          {matchStats.runRate.requiredRunRate}
                        </p>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Match Info */}
            <InfoCard title="Match Info">
              <ul className="space-y-4 text-sm divide-y divide-slate-800/70">
                {matchStats.isLive !== undefined && (
                  <li className="flex items-center gap-3 pb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800/70 flex items-center justify-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Status</span>
                      <span className={`font-medium ${matchStats.isLive ? 'text-red-400' : 'text-slate-300'}`}>
                        {matchStats.isLive ? 'Live' : 'Finished'}
                      </span>
                    </div>
                  </li>
                )}
                
                {matchStats.tournamentName && (
                  <li className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800/70 flex items-center justify-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 mb-0.5">Tournament</span>
                      <span className="font-medium text-slate-300">{matchStats.tournamentName}</span>
                    </div>
                  </li>
                )}
              </ul>
            </InfoCard>
          </div>
        </main>
      </div>
    </div>
  );
}