import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './useApi';
import { endpoints } from '@/config/env';
import { MatchStats, UseMatchStatsReturn, ApiResponse } from '@/types/api';

export const useMatchStats = (matchId: string): UseMatchStatsReturn => {
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { makeRequest } = useApi();
  const hasInitiallyLoadedRef = useRef(false);

  const fetchMatchStats = useCallback(async (isBackgroundRefetch = false) => {
    if (!isLoaded || !isSignedIn || !matchId) return;

    try {
      // Only show loading state for initial fetch, not background refetches
      if (!isBackgroundRefetch && !hasInitiallyLoadedRef.current) {
        setIsLoading(true);
      }
      setError(null);

      const response = await makeRequest<ApiResponse<MatchStats>>(
        endpoints.matchStats(matchId)
      );

      setMatchStats(response.response);
      hasInitiallyLoadedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch match statistics';
      setError(errorMessage);
      console.error('Error fetching match stats:', err);
    } finally {
      // Only set loading to false if this was the initial load
      if (!isBackgroundRefetch || !hasInitiallyLoadedRef.current) {
        setIsLoading(false);
      }
    }
  }, [matchId, isLoaded, isSignedIn, makeRequest]);

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