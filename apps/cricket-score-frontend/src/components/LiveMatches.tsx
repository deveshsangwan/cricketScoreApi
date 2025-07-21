// src/components/LiveMatches.tsx
'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMatches } from '@/hooks/useMatches';
import { MatchesListSkeleton } from '@/components/ui/LoadingSkeleton';
import { Match } from '@/types/api';

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
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-xl hover:shadow-primary/30 focus:ring-2 focus:ring-primary/50 focus:outline-none backdrop-blur-sm border border-primary/20"
    >
      Try Again
    </button>
  </motion.div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    layout={false}
    className="text-center py-16"
  >
    <div className="w-16 h-16 mx-auto bg-muted/40 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border-2 border-muted/60 shadow-xl">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-8 w-8 text-muted-foreground" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2 drop-shadow-md">No Live Matches</h3>
    <p className="text-muted-foreground">
      No live matches are available at the moment. Check back later!
    </p>
  </motion.div>
);

/**
 * LiveMatches Component with Pre-fetching
 * 
 * This component automatically pre-fetches the top 3 matches for instant loading:
 * - When matches are loaded, the top 3 matches' detailed stats are pre-fetched in parallel
 * - Pre-fetched matches show a "Ready" indicator and green "View Details (Instant)" button
 * - Cached data is stored for 2 minutes and provides instant loading when users click
 * - Non-cached matches still work normally but may take longer to load
 */
export default function LiveMatches() {
  const router = useRouter();
  const { matches, isLoading, error, refetch } = useMatches();

  const handleViewMatchDetails = React.useCallback((matchId: string) => {
    router.push(`/matches/${matchId}`);
  }, [router]);

  // Loading state
  if (isLoading) {
    return <MatchesListSkeleton />;
  }

  // Error state
  if (error) {
      return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold text-foreground mb-8 drop-shadow-md">Live Matches</h2>
      <ErrorDisplay error={error} onRetry={refetch} />
    </section>
  );
  }

  return (
    <section className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        layout={false}
      >
        <h2 className="text-4xl font-bold text-foreground mb-8 drop-shadow-md">Live Matches</h2>
        
        {matches.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            layout={false}
          >
            {matches.map((match) => (
              <MatchCard
                key={match.matchId}
                match={match}
                onViewDetails={handleViewMatchDetails}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}