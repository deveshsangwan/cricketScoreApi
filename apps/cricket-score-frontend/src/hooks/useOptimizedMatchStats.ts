import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { MatchStats, UseMatchStatsReturn } from '@cricket-score/shared-types';
import { useMatchCache } from '@/contexts/MatchCacheContext';

export const useOptimizedMatchStats = (matchId: string): UseMatchStatsReturn => {
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCachedMatch, setCachedMatch, isFreshCache } = useMatchCache();
  const hasInitiallyLoadedRef = useRef(false);

  // Use tRPC for fetching match stats by ID with optimistic caching
  const {
    data,
    isLoading: isTrpcLoading,
    error: trpcError,
    refetch: trpcRefetch,
  } = trpc.getMatchStatsById.useQuery(
    { matchId },
    {
      enabled: !!matchId,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // 1 minute
      retry: 2,
    }
  );

  // Handle cache initialization
  useEffect(() => {
    if (!matchId) return;

    const cached = getCachedMatch(matchId);
    if (cached && !hasInitiallyLoadedRef.current) {
      if (isFreshCache(matchId)) {
        console.log(`⚡ Using cached data for match ${matchId} - instant load!`);
        setMatchStats(cached.data);
        setError(null);
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
      } else {
        console.log(`🔄 Using stale cached data for match ${matchId} while fetching fresh data`);
        setMatchStats(cached.data);
        setError(null);
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
      }
    }
  }, [matchId, getCachedMatch, isFreshCache]);

  // Handle tRPC data changes
  useEffect(() => {
    if (data?.response) {
      const freshMatchStats = data.response as MatchStats;

      console.log(`🌐 Received fresh data for match ${matchId}`);

      // Update cache with fresh data
      setCachedMatch(matchId, freshMatchStats);

      // Update state with fresh data
      setMatchStats(freshMatchStats);
      setError(null);
      hasInitiallyLoadedRef.current = true;
    }
  }, [data, matchId, setCachedMatch]);

  // Handle tRPC loading state
  useEffect(() => {
    const cached = getCachedMatch(matchId);
    // Only show loading if we don't have cached data and this is the initial load
    setIsLoading(isTrpcLoading && !hasInitiallyLoadedRef.current && !cached);
  }, [isTrpcLoading, matchId, getCachedMatch]);

  // Handle tRPC errors
  useEffect(() => {
    if (trpcError) {
      // Only set error if we don't have any cached data to show
      const cached = getCachedMatch(matchId);
      if (!cached) {
        setError(trpcError.message);
      } else {
        // Log error but continue showing cached data
        console.warn(`Error fetching fresh data for match ${matchId}, using cached data:`, trpcError);
      }
      setIsLoading(false);
    }
  }, [trpcError, matchId, getCachedMatch]);

  const refetch = useCallback(async (isBackgroundRefetch = false) => {
    const cached = getCachedMatch(matchId);

    if (!isBackgroundRefetch && !hasInitiallyLoadedRef.current && !cached) {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log(`🔄 Refreshing data for match ${matchId}`);
      await trpcRefetch();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to fetch match statistics';

      // Only set error if we don't have cached data
      if (!cached) {
        setError(errorMessage);
      } else {
        console.warn(`Error refreshing data for match ${matchId}, using cached data:`, err);
      }
    } finally {
      if (!isBackgroundRefetch || !hasInitiallyLoadedRef.current) {
        setIsLoading(false);
      }
    }
  }, [trpcRefetch, matchId, getCachedMatch]);

  return {
    matchStats,
    isLoading,
    error,
    refetch,
  };
};

// Hook for real-time updates with cache optimization
export const useOptimizedRealTimeMatchStats = (
  matchId: string,
  refreshInterval: number = 30000 // 30 seconds default
): UseMatchStatsReturn => {
  const baseHook = useOptimizedMatchStats(matchId);
  const { matchStats, refetch } = baseHook;
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track scrolling to pause updates during scroll
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150); // Stop considering it scrolling after 150ms of no scroll
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    // Only set up polling for live matches
    if (matchStats?.isLive && refreshInterval > 0) {
      const id = setInterval(() => {
        // Only refetch if not currently scrolling
        if (!isScrollingRef.current) {
          // Pass true to indicate this is a background refetch
          refetch(true);
        }
      }, refreshInterval);

      setIntervalId(id);

      return () => {
        clearInterval(id);
        setIntervalId(null);
      };
    }
  }, [matchStats?.isLive, refreshInterval, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [intervalId]);

  return baseHook;
}; 