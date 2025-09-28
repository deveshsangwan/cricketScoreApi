// src/components/LiveMatchesTrpc.tsx
'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MatchesListSkeleton } from '@/components/ui/LoadingSkeleton';
import { trpc } from '@/lib/trpc';
import { useMatchPreFetch } from '@/hooks/useMatchPreFetch';


import { Match } from '@cricket-score/shared-types';

// Memoized match card component for better performance
const MatchCard = React.memo<{ match: Match; onViewDetails: (matchId: string) => void }>(
  ({ match, onViewDetails }) => (
    <motion.div
      key={match.matchId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      layout={false}
      className="p-6 rounded-xl glass-card hover:bg-card/40 transition-all transform hover:-translate-y-1"
    >
      <h3 className="text-xl font-semibold text-foreground mb-4 h-16 overflow-hidden leading-tight">
        {match.matchName}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        <span className="font-medium">Match ID:</span> {match.matchId}
      </p>
      <button
        onClick={() => onViewDetails(match.matchId)}
        className="btn btn-primary mt-4 w-full text-sm py-2.5 px-4 transform hover:scale-[1.02]"
      >
        View Match Details
      </button>
    </motion.div>
  )
);

MatchCard.displayName = 'MatchCard';

// Enhanced error component
const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    layout={false}
    className="flex flex-col items-center justify-center min-h-[400px] text-center p-8"
  >
    <div className="w-16 h-16 mx-auto bg-red-500/30 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/50 shadow-xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-foreground mb-4 drop-shadow-md">Failed to Load Matches</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
    <button
      onClick={onRetry}
      className="btn btn-primary px-6 py-3"
    >
      Try Again
    </button>
  </motion.div>
);



/**
 * LiveMatches Component with tRPC and Robust Pre-fetching
 * 
 * This component replicates the old component functionality with enhanced prefetching:
 * - Uses tRPC for data fetching with proper error handling
 * - Automatically pre-fetches the top 3 matches for instant loading
 * - Pre-fetched matches will load instantly when users click "View Details"
 * - Cached data is stored for 28 seconds and provides instant loading
 * - Background prefetching runs in parallel without blocking the UI
 * - Handles prefetch failures gracefully (some matches may be removed/invalid)
 * - Shows detailed prefetch status with success/failure counts
 * - Continues to work even if some matches can't be pre-fetched
 */
export default function LiveMatches() {
  const router = useRouter();
  const { preFetchTopMatchesWithStats } = useMatchPreFetch();
  const preFetchRef = React.useRef(preFetchTopMatchesWithStats);
  const [isPrefetching, setIsPrefetching] = React.useState(false);
  const [prefetchStats, setPrefetchStats] = React.useState<{
    successful: number;
    total: number;
    hasErrors: boolean;
  } | null>(null);

  // Keep the ref updated but don't cause re-renders
  preFetchRef.current = preFetchTopMatchesWithStats;

  // Use the generated trpc hook for type safety
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.getLiveMatches.useQuery(undefined, {
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    retry: 2
  });

  const handleViewDetails = React.useCallback((matchId: string) => {
    router.push(`/matches/${matchId}`);
  }, [router]);

  const handleRetry = () => {
    refetch();
  };

  // Transform backend data with runtime type checking for safety
  const matches: Match[] = React.useMemo(() => {
    const matchesData = response?.response;
    if (!matchesData || typeof matchesData !== 'object') {
      return [];
    }

    return Object.entries(matchesData).map(([matchId, matchData]) => {
      const typedMatchData = matchData as Match;
      return {
        matchId: typedMatchData.matchId || matchId,
        matchName: typedMatchData.matchName,
        matchUrl: typedMatchData.matchUrl,
      };
    });
  }, [response]);

  // Pre-fetch top 3 matches for instant loading when matches data changes
  React.useEffect(() => {
    if (matches.length > 0) {
      const topMatchIds = matches.slice(0, 3).map(match => match.matchId);
      console.log('🚀 Triggering pre-fetch for top 3 matches:', topMatchIds);

      setIsPrefetching(true);
      setPrefetchStats(null);

      // Use ref to avoid dependency issues and run prefetch in background
      preFetchRef.current(topMatchIds)
        .then((stats) => {
          console.log('✅ Pre-fetching completed with stats:', stats);
          setPrefetchStats({
            successful: stats.successful,
            total: stats.total,
            hasErrors: stats.failed > 0 || stats.notFound > 0
          });
          setIsPrefetching(false);
          return;
        })
        .catch(error => {
          console.warn('Pre-fetching failed, but main matches loading succeeded:', error);
          setPrefetchStats({
            successful: 0,
            total: Math.min(3, matches.length),
            hasErrors: true
          });
          setIsPrefetching(false);
        });
    } else {
      setPrefetchStats(null);
    }
  }, [matches]);

  if (isLoading) {
    return <MatchesListSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error.message} onRetry={handleRetry} />;
  }

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        layout={false}
        className="flex flex-col items-center justify-center min-h-[400px] text-center p-8"
      >
        <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-6 border border-border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">No Live Matches</h3>
        <p className="text-muted-foreground max-w-md">
          There are currently no live cricket matches. Check back later for live scores and updates.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      layout={false}
      className="max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold heading-gradient">
            Live Matches
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Powered by tRPC with Auto Pre-fetching • {matches.length} match{matches.length !== 1 ? 'es' : ''} available
            {matches.length > 0 && (
              <span className={`ml-2 ${isPrefetching
                  ? 'text-yellow-500'
                  : prefetchStats?.hasErrors
                    ? 'text-orange-500'
                    : 'text-green-500'
                }`}>
                {isPrefetching ? (
                  '🔄 Pre-fetching top 3...'
                ) : prefetchStats ? (
                  prefetchStats.hasErrors ? (
                    `⚠️ ${prefetchStats.successful}/${prefetchStats.total} pre-fetched`
                  ) : (
                    `⚡ ${prefetchStats.successful}/${prefetchStats.total} pre-fetched`
                  )
                ) : (
                  '⚡ Prefetch ready'
                )}
              </span>
            )}
          </p>
          {prefetchStats?.hasErrors && (
            <p className="text-xs text-orange-400 mt-1">
              Some matches couldn&apos;t be pre-fetched (likely removed or invalid). Successfully pre-fetched matches will load instantly.
            </p>
          )}
        </div>

        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all transform hover:scale-[1.02] focus:ring-2 focus:ring-primary/50 focus:outline-none shadow-lg text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard
            key={match.matchId}
            match={match}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </motion.div>
  );
} 