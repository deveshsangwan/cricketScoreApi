import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './useApi';
import { endpoints } from '@/config/env';
import { MatchStats, UseMatchStatsReturn, ApiResponse } from '@/types/api';
import { useMatchCache } from '@/contexts/MatchCacheContext';

export const useOptimizedMatchStats = (matchId: string): UseMatchStatsReturn => {
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { makeRequest } = useApi();
  const { getCachedMatch, setCachedMatch, isFreshCache } = useMatchCache();
  const hasInitiallyLoadedRef = useRef(false);

  const fetchMatchStats = useCallback(async (isBackgroundRefetch = false) => {
    if (!isLoaded || !isSignedIn || !matchId) return;

    try {
      // Check cache first for instant loading
      const cached = getCachedMatch(matchId);
      
      if (cached && isFreshCache(matchId)) {
        // Use cached data immediately for instant loading
        console.log(`⚡ Using cached data for match ${matchId} - instant load!`);
        setMatchStats(cached.data);
        setError(null);
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
        return;
      }

      // If we have stale cached data, show it immediately while fetching fresh data
      if (cached && !hasInitiallyLoadedRef.current) {
        console.log(`🔄 Using stale cached data for match ${matchId} while fetching fresh data`);
        setMatchStats(cached.data);
        setError(null);
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
        // Continue to fetch fresh data in background
      }

      // Only show loading state for initial fetch without cache
      if (!isBackgroundRefetch && !hasInitiallyLoadedRef.current && !cached) {
        setIsLoading(true);
      }
      
      setError(null);

      console.log(`🌐 Fetching fresh data for match ${matchId}`);
      const response = await makeRequest<ApiResponse<MatchStats>>(
        endpoints.matchStats(matchId)
      );

      const freshMatchStats = response.response;
      
      // Update cache with fresh data
      setCachedMatch(matchId, freshMatchStats);
      
      // Update state with fresh data
      setMatchStats(freshMatchStats);
      hasInitiallyLoadedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch match statistics';
      
      // Only set error if we don't have any cached data to show
      if (!getCachedMatch(matchId)) {
        setError(errorMessage);
      } else {
        // Log error but continue showing cached data
        console.warn(`Error fetching fresh data for match ${matchId}, using cached data:`, err);
      }
    } finally {
      // Only set loading to false if this was the initial load
      if (!isBackgroundRefetch || !hasInitiallyLoadedRef.current) {
        setIsLoading(false);
      }
    }
  }, [matchId, isLoaded, isSignedIn, makeRequest, getCachedMatch, setCachedMatch, isFreshCache]);

  const refetch = useCallback(async (isBackgroundRefetch = false) => {
    await fetchMatchStats(isBackgroundRefetch);
  }, [fetchMatchStats]);

  useEffect(() => {
    if (isLoaded && isSignedIn && matchId) {
      fetchMatchStats(false); // Initial fetch
    }
  }, [matchId, isLoaded, isSignedIn, fetchMatchStats]);

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