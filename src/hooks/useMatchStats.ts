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

  const fetchMatchStats = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !matchId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await makeRequest<ApiResponse<MatchStats>>(
        endpoints.matchStats(matchId)
      );

      setMatchStats(response.response);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch match statistics';
      setError(errorMessage);
      console.error('Error fetching match stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, isLoaded, isSignedIn, makeRequest]);

  const refetch = useCallback(async () => {
    await fetchMatchStats();
  }, [fetchMatchStats]);

  useEffect(() => {
    if (isLoaded && isSignedIn && matchId) {
      fetchMatchStats();
    }
  }, [matchId, isLoaded, isSignedIn, fetchMatchStats]);

  return {
    matchStats,
    isLoading,
    error,
    refetch,
  };
};

// Hook for real-time updates with scroll-aware optimization
export const useRealTimeMatchStats = (
  matchId: string, 
  refreshInterval: number = 30000 // 30 seconds default
): UseMatchStatsReturn => {
  const baseHook = useMatchStats(matchId);
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
          refetch();
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