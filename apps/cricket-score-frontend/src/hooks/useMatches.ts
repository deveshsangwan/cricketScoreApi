import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './useApi';
import { useMatchPreFetch } from './useMatchPreFetch';
import { endpoints } from '@/config/env';
import { Match, LiveMatchesResponse, UseMatchesReturn, ApiResponse } from '@/types/api';

export const useMatches = (): UseMatchesReturn => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { makeRequest } = useApi();
  const { preFetchTopMatches } = useMatchPreFetch();
  const preFetchRef = useRef(preFetchTopMatches);
  
  // Keep the ref updated but don't cause re-renders
  preFetchRef.current = preFetchTopMatches;

  const fetchMatches = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await makeRequest<ApiResponse<LiveMatchesResponse>>(
        endpoints.liveMatches
      );

      // Transform the response data
      const matchesArray = Object.entries(response.response).map(([matchId, value]) => ({
        matchId,
        matchName: value.matchName,
        matchUrl: value.matchUrl,
      }));

      setMatches(matchesArray);

      // Pre-fetch top 3 matches for instant loading (use ref to avoid dependency)
      if (matchesArray.length > 0) {
        const topMatchIds = matchesArray.slice(0, 3).map(match => match.matchId);
        preFetchRef.current(topMatchIds).catch(error => {
          console.warn('Pre-fetching failed, but main matches loading succeeded:', error);
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matches';
      setError(errorMessage);
      console.error('Error fetching matches:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, makeRequest]);

  const refetch = useCallback(async () => {
    await fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchMatches();
    }
  }, [isLoaded, isSignedIn, fetchMatches]);

  return {
    matches,
    isLoading,
    error,
    refetch,
  };
}; 