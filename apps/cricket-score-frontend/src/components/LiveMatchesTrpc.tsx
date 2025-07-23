// src/components/LiveMatchesTrpc.tsx
'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MatchesListSkeleton } from '@/components/ui/LoadingSkeleton';
import { trpc } from '@/lib/trpc';
import { useQueryClient } from "@tanstack/react-query";

interface Match {
  matchId: string;
  matchName: string;
  matchUrl: string;
}

// Memoized match card component for better performance
const MatchCard = React.memo<{ match: Match; onViewDetails: (matchId: string) => void }>(
  ({ match, onViewDetails }) => (
    <motion.div
      key={match.matchId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      layout={false}
      className="p-6 border-2 border-border/60 rounded-xl shadow-2xl hover:shadow-3xl transition-all bg-card/40 backdrop-blur-lg transform hover:-translate-y-1 hover:border-primary/50 hover:bg-card/50 before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-xl before:-z-10 relative overflow-hidden"
    >
      <h3 className="text-xl font-semibold text-foreground mb-4 h-16 overflow-hidden leading-tight drop-shadow-md">
        {match.matchName}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        <span className="font-medium">Match ID:</span> {match.matchId}
      </p>
      <button
        onClick={() => onViewDetails(match.matchId)}
        className="mt-4 w-full text-sm text-primary-foreground bg-primary hover:bg-primary/90 py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-primary/50 focus:outline-none shadow-xl hover:shadow-primary/30 backdrop-blur-sm border border-primary/20"
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
    <div className="w-16 h-16 mx-auto bg-red-500/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border-2 border-red-500/50 shadow-xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-red-400 mb-3">Unable to Load Matches</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
    <button
      onClick={onRetry}
      className="px-6 py-3 bg-red-500/80 text-white font-medium rounded-lg hover:bg-red-500 transition-all transform hover:scale-[1.02] focus:ring-2 focus:ring-red-500/50 focus:outline-none shadow-lg"
    >
      Try Again
    </button>
  </motion.div>
);

// tRPC-powered component with automatic type inference
export default function LiveMatchesTrpc() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Use the generated trpc hook for type safety
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = trpc.getLiveMatches.useQuery(undefined, {
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  const handleViewDetails = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  const invalidateMatches = () => {
    queryClient.invalidateQueries({ queryKey: ['getLiveMatches'] });
  };

  const handleRetry = () => {
    invalidateMatches();
  };

  // Transform backend data with runtime type checking for safety
  const matches: Match[] = React.useMemo(() => {
    const matchesData = response?.response;
    if (!matchesData || typeof matchesData !== 'object') {
      return [];
    }

    return Object.entries(matchesData).map(([matchId, matchData]) => ({
      matchId: matchData.matchId || matchId,
      matchName: matchData.matchName,
      matchUrl: matchData.matchUrl,
    }));
  }, [response]);

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
        <div className="w-16 h-16 mx-auto bg-muted/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border-2 border-border shadow-xl">
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
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Live Matches
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Powered by tRPC with Auto Type Inference • {matches.length} match{matches.length !== 1 ? 'es' : ''} available
          </p>
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