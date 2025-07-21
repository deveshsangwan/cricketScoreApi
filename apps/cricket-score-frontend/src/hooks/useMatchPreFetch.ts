import { useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './useApi';
import { endpoints } from '@/config/env';
import { MatchStats, ApiResponse } from '@/types/api';
import { useMatchCache } from '@/contexts/MatchCacheContext';

export const useMatchPreFetch = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { makeRequest } = useApi();
  const { setCachedMatch, getCachedMatch, isFreshCache } = useMatchCache();
  const preFetchingRef = useRef<Set<string>>(new Set());

  const preFetchMatchStats = useCallback(async (matchId: string): Promise<MatchStats | null> => {
    if (!isLoaded || !isSignedIn || !matchId) return null;
    
    // Check if already cached and fresh
    const cached = getCachedMatch(matchId);
    if (cached && isFreshCache(matchId)) {
      return cached.data;
    }

    // Check if already being fetched
    if (preFetchingRef.current.has(matchId)) return null;

    try {
      preFetchingRef.current.add(matchId);
      
      const response = await makeRequest<ApiResponse<MatchStats>>(
        endpoints.matchStats(matchId)
      );

      const matchStats = response.response;
      
      // Cache the result
      setCachedMatch(matchId, matchStats);
      
      return matchStats;
    } catch (error) {
      console.error(`Error pre-fetching match ${matchId}:`, error);
      return null;
    } finally {
      preFetchingRef.current.delete(matchId);
    }
  }, [isLoaded, isSignedIn, makeRequest, setCachedMatch, getCachedMatch, isFreshCache]);

  const preFetchTopMatches = useCallback(async (matchIds: string[]): Promise<void> => {
    if (!isLoaded || !isSignedIn || matchIds.length === 0) return;

    // Only pre-fetch first 3 matches
    const topThreeMatches = matchIds.slice(0, 3);
    
    console.log('🚀 Pre-fetching top 3 matches for instant loading:', topThreeMatches);

    // Pre-fetch matches in parallel for faster loading
    const preFetchPromises = topThreeMatches.map(matchId => 
      preFetchMatchStats(matchId)
        .then(result => ({ matchId, success: !!result }))
        .catch(error => ({ matchId, success: false, error }))
    );

    try {
      const results = await Promise.all(preFetchPromises);
      console.log('Batch pre-fetch results:', results);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        console.log(`✅ Successfully pre-fetched ${successful.length} matches:`, 
          successful.map(r => r.matchId));
      }
      
      if (failed.length > 0) {
        console.warn(`❌ Failed to pre-fetch ${failed.length} matches:`, 
          failed.map(r => r.matchId));
      }
    } catch (error) {
      console.error('Error in batch pre-fetching:', error);
    }
  }, [isLoaded, isSignedIn, preFetchMatchStats]);

  const preFetchSingleMatch = useCallback(async (matchId: string): Promise<boolean> => {
    const result = await preFetchMatchStats(matchId);
    return !!result;
  }, [preFetchMatchStats]);

  return {
    preFetchTopMatches,
    preFetchSingleMatch,
    isPreFetching: (matchId: string) => preFetchingRef.current.has(matchId)
  };
}; 