import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { MatchStats, UseMatchStatsReturn } from '@cricket-score/shared-types';
import { useMatchCache } from '@/contexts/MatchCacheContext';
import { config } from '@/config/env';

export const useOptimizedMatchStats = (matchId: string): UseMatchStatsReturn => {
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCachedMatch, setCachedMatch, isFreshCache } = useMatchCache();
  const hasInitiallyLoadedRef = useRef(false);
  const realTimeEnabled = config.features.realTime;
  

  // Use tRPC for initial fetch and fallback
  const {
    data,
    isLoading: isTrpcLoading,
    error: trpcError,
    refetch: trpcRefetch,
  } = trpc.getMatchStatsById.useQuery(
    { matchId },
    {
      // Disable automatic query when real-time is enabled to avoid double-fetch
      enabled: !!matchId && !realTimeEnabled,
      // staleTime: 30000, // 30 seconds
      refetchInterval: false, // we will rely on SSE for updates
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

  // Handle tRPC loading state when real-time is disabled
  useEffect(() => {
    if (realTimeEnabled) return;
    const cached = getCachedMatch(matchId);
    // Only show loading if we don't have cached data and this is the initial load
    setIsLoading(isTrpcLoading && !hasInitiallyLoadedRef.current && !cached);
  }, [isTrpcLoading, matchId, getCachedMatch, realTimeEnabled]);

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

  // Subscribe using tRPC SSE subscriptions for live updates
  trpc.subscribeMatchStatsById.useSubscription(
    matchId ? { matchId } : undefined,
    {
      enabled: !!matchId && realTimeEnabled,
      onStarted: () => {},
      onData: (data) => {
        const next = data?.response as MatchStats | undefined;
        if (!next) return;
        setCachedMatch(matchId, next);
        setMatchStats(next);
        setError(null);
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
      },
      onError: (err: unknown) => {
        const cached = getCachedMatch(matchId);
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Failed to subscribe for live updates');
        }
        setIsLoading(false);
      },
    }
  );

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
  refreshInterval: number = 0 // SSE handles updates; keep 0 to disable polling by default
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
    // Optional fallback polling if explicitly enabled via refreshInterval
    if (matchStats?.isLive && refreshInterval > 0) {
      const id = setInterval(() => {
        if (!isScrollingRef.current) {
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