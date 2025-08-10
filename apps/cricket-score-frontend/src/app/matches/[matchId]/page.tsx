'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOptimizedRealTimeMatchStats } from '@/hooks/useOptimizedMatchStats';
import { FullPageLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Commentary } from '@/components/match/Commentary';
import { 
  InfoCard, 
  TeamScore, 
  BattingPlayer, 
  ErrorDisplay, 
  NotFoundDisplay 
} from '@/components/match';



export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  // Use optimized SSE-based hook (no polling by default)
  const { matchStats, isLoading, error, refetch } = useOptimizedRealTimeMatchStats(matchId);

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
    <div className="min-h-screen text-foreground antialiased bg-gradient-theme">
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

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold heading-gradient">
            {matchStats.matchName}
          </h1>

          <div className={`chip mt-4 ${matchStats.isLive ? 'chip-live' : 'chip-default'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${matchStats.isLive
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                : 'bg-muted-foreground'
              }`}></span>
            {matchStats.isLive ? 'Live' : 'Finished'}
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Main Scorecard and Commentary */}
          <div className="lg:col-span-2 space-y-6">
            <InfoCard title="Scorecard">
              {/* Team 1 Score */}
              {matchStats.team1 && (
                <TeamScore team={matchStats.team1} isBatting={matchStats.team1.isBatting} />
              )}

              <div className="my-4 text-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full soft-divider"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-card/70 text-muted-foreground font-medium uppercase text-xs tracking-wider rounded-full border border-border/40">vs</span>
                </div>
              </div>

              {/* Team 2 Score */}
              {matchStats.team2 && (
                <TeamScore team={matchStats.team2} isBatting={matchStats.team2.isBatting} />
              )}

              {/* Match Summary */}
              {matchStats.summary && (
                <div className="mt-6 pt-6 soft-divider text-center">
                  <p className="text-lg font-semibold text-summary bg-summary py-3 px-4 rounded-lg inline-block">
                    {matchStats.summary}
                  </p>
                </div>
              )}
            </InfoCard>

            {/* Commentary */}
            {matchStats.matchCommentary && matchStats.matchCommentary.length > 0 && (
              <Commentary commentary={matchStats.matchCommentary} />
            )}
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
                      <p className="text-sm font-medium text-muted-foreground">Current Run Rate</p>
                      <p className="text-xl font-extrabold text-green-400 ml-3 min-w-[3rem] text-right">
                        {matchStats.runRate.currentRunRate}
                      </p>
                    </div>
                  )}

                  {matchStats.runRate.requiredRunRate !== undefined && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-muted-foreground">Required Run Rate</p>
                      <p className="text-xl font-extrabold text-amber-400 ml-3 min-w-[3rem] text-right">
                        {matchStats.runRate.requiredRunRate}
                      </p>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Key Stats */}
            {matchStats.keyStats && Object.keys(matchStats.keyStats).length > 0 && (
              <InfoCard title="Key Stats">
                <div className="space-y-4">
                  {Object.entries(matchStats.keyStats).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground mt-0.5 flex-shrink-0">
                          <svg className="w-3 h-3" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                            {key.replace(':', '').trim()}
                          </p>
                          <p className="text-sm font-semibold text-foreground leading-relaxed break-words">
                            {value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Match Info */}
            <InfoCard title="Match Info">
              <ul className="space-y-4 text-sm divide-y divide-border">
                {matchStats.isLive !== undefined && (
                  <li className="flex items-center gap-3 pb-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground mb-0.5">Status</span>
                      <span className={`font-medium ${matchStats.isLive ? 'text-red-400' : 'text-foreground'}`}>
                        {matchStats.isLive ? 'Live' : 'Finished'}
                      </span>
                    </div>
                  </li>
                )}

                {matchStats.tournamentName && (
                  <li className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground mb-0.5">Tournament</span>
                      <span className="font-medium text-foreground">{matchStats.tournamentName}</span>
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