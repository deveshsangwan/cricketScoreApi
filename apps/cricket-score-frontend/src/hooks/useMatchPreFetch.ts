import { useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { MatchStats } from '@cricket-score/shared-types';
import { useMatchCache } from '@/contexts/MatchCacheContext';

export const useMatchPreFetch = () => {
  const { setCachedMatch, getCachedMatch, isFreshCache } = useMatchCache();
  const preFetchingRef = useRef<Set<string>>(new Set());
  const trpcUtils = trpc.useUtils();

  const preFetchMatchStats = useCallback(async (matchId: string): Promise<MatchStats | null> => {
    if (!matchId) return null;

    // Check if already cached and fresh
    const cached = getCachedMatch(matchId);
    if (cached && isFreshCache(matchId)) {
      console.log(`⚡ Using cached data for match ${matchId}`);
      return cached.data;
    }

    // Check if already being fetched
    if (preFetchingRef.current.has(matchId)) {
      console.log(`⏳ Match ${matchId} is already being pre-fetched`);
      return null;
    }

    try {
      preFetchingRef.current.add(matchId);
      console.log(`🚀 Starting pre-fetch for match ${matchId}`);

      // Use tRPC's prefetch capability
      await trpcUtils.getMatchStatsById.prefetch({ matchId });

      // Get the prefetched data from cache
      const prefetchedData = trpcUtils.getMatchStatsById.getData({ matchId });

      if (prefetchedData?.response) {
        const matchStats = prefetchedData.response as MatchStats;

        // Cache the result in our custom cache
        setCachedMatch(matchId, matchStats);
        console.log(`✅ Successfully pre-fetched match ${matchId}`);

        return matchStats;
      }

      console.warn(`⚠️ No data returned for match ${matchId} after prefetch`);
      return null;
    } catch (error: unknown) {
      // Handle specific error cases
      const errorObj = error as { message?: string; code?: string };
      if (errorObj?.message?.includes('No match found with id:')) {
        console.warn(`🔍 Match ${matchId} not found - likely removed or invalid ID`);
      } else if (errorObj?.code === 'INTERNAL_SERVER_ERROR') {
        console.warn(`🔧 Server error pre-fetching match ${matchId}:`, errorObj.message);
      } else {
        console.error(`❌ Unexpected error pre-fetching match ${matchId}:`, error);
      }
      return null;
    } finally {
      preFetchingRef.current.delete(matchId);
    }
  }, [setCachedMatch, getCachedMatch, isFreshCache, trpcUtils.getMatchStatsById]);

  const preFetchTopMatches = useCallback(async (matchIds: string[]): Promise<void> => {
    if (matchIds.length === 0) {
      console.log('📭 No matches to pre-fetch');
      return;
    }

    // Only pre-fetch first 3 matches
    const topThreeMatches = matchIds.slice(0, 3);

    console.log('🚀 Pre-fetching top 3 matches for instant loading:', topThreeMatches);

    // Pre-fetch all matches in parallel using tRPC
    const preFetchPromises = topThreeMatches.map(async (matchId) => {
      try {
        const result = await preFetchMatchStats(matchId);
        return { matchId, result, status: 'success' };
      } catch (error) {
        console.error(`Failed to pre-fetch match ${matchId}:`, error);
        return { matchId, result: null, status: 'error', error };
      }
    });

    const results = await Promise.allSettled(preFetchPromises);

    // Count different result types
    let successful = 0;
    let failed = 0;
    let notFound = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { value } = result;
        if (value.result !== null) {
          successful++;
        } else if (value.status === 'error') {
          const errorMsg = value.error?.message || '';
          if (errorMsg.includes('No match found with id:')) {
            notFound++;
          } else {
            failed++;
          }
        }
      } else {
        failed++;
      }
    });

    // Log detailed results
    console.log(`📊 Pre-fetch Summary: ${successful} successful, ${failed} failed, ${notFound} not found (${topThreeMatches.length} total)`);

    if (notFound > 0) {
      console.warn(`⚠️ ${notFound} matches not found - this is normal if matches were removed or are invalid`);
    }

    if (failed > 0) {
      console.error(`❌ ${failed} matches failed with unexpected errors`);
    }

    if (successful > 0) {
      console.log(`🎉 ${successful} matches are now pre-loaded for instant access!`);
    }
  }, [preFetchMatchStats]);

  const preWarmMatch = useCallback(async (matchId: string): Promise<void> => {
    if (!matchId || preFetchingRef.current.has(matchId)) return;

    try {
      console.log(`🔥 Pre-warming match ${matchId}`);
      await preFetchMatchStats(matchId);
    } catch (error) {
      console.error(`Error pre-warming match ${matchId}:`, error);
    }
  }, [preFetchMatchStats]);

  // Version that returns statistics for UI feedback
  const preFetchTopMatchesWithStats = useCallback(async (matchIds: string[]): Promise<{
    successful: number;
    failed: number;
    notFound: number;
    total: number;
  }> => {
    if (matchIds.length === 0) {
      console.log('📭 No matches to pre-fetch');
      return { successful: 0, failed: 0, notFound: 0, total: 0 };
    }

    // Only pre-fetch first 3 matches
    const topThreeMatches = matchIds.slice(0, 3);

    console.log('🚀 Pre-fetching top 3 matches for instant loading:', topThreeMatches);

    // Pre-fetch all matches in parallel using tRPC
    const preFetchPromises = topThreeMatches.map(async (matchId) => {
      try {
        const result = await preFetchMatchStats(matchId);
        return { matchId, result, status: 'success' };
      } catch (error) {
        console.error(`Failed to pre-fetch match ${matchId}:`, error);
        return { matchId, result: null, status: 'error', error };
      }
    });

    const results = await Promise.allSettled(preFetchPromises);

    // Count different result types
    let successful = 0;
    let failed = 0;
    let notFound = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { value } = result;
        if (value.result !== null) {
          successful++;
        } else if (value.status === 'error') {
          const errorMsg = value.error?.message || '';
          if (errorMsg.includes('No match found with id:')) {
            notFound++;
          } else {
            failed++;
          }
        }
      } else {
        failed++;
      }
    });

    // Log detailed results
    console.log(`📊 Pre-fetch Summary: ${successful} successful, ${failed} failed, ${notFound} not found (${topThreeMatches.length} total)`);

    if (notFound > 0) {
      console.warn(`⚠️ ${notFound} matches not found - this is normal if matches were removed or are invalid`);
    }

    if (failed > 0) {
      console.error(`❌ ${failed} matches failed with unexpected errors`);
    }

    if (successful > 0) {
      console.log(`🎉 ${successful} matches are now pre-loaded for instant access!`);
    }

    return { successful, failed, notFound, total: topThreeMatches.length };
  }, [preFetchMatchStats]);

  return {
    preFetchMatchStats,
    preFetchTopMatches,
    preFetchTopMatchesWithStats,
    preWarmMatch,
  };
}; 