'use client';

import React, { createContext, useContext, useCallback, useRef, useMemo } from 'react';
import type { MatchStats } from '@/types/api';

interface CachedMatchData {
  data: MatchStats;
  timestamp: number;
  isStale?: boolean;
}

interface MatchCacheContextType {
  // Get cached match data
  getCachedMatch: (matchId: string) => CachedMatchData | null;
  // Set cached match data
  setCachedMatch: (matchId: string, data: MatchStats) => void;
  // Check if match is cached and fresh (less than 28 seconds old)
  isFreshCache: (matchId: string) => boolean;
  // Clear stale cache entries
  clearStaleCache: () => void;
  // Get cache statistics
  getCacheStats: () => { totalCached: number; freshEntries: number; staleEntries: number };
}

const MatchCacheContext = createContext<MatchCacheContextType | null>(null);

const CACHE_EXPIRY_TIME = 28 * 1000; // 28 seconds in milliseconds
const MAX_CACHE_SIZE = 10; // Maximum number of matches to cache

interface MatchCacheProviderProps {
  children: React.ReactNode;
}

export const MatchCacheProvider: React.FC<MatchCacheProviderProps> = ({ children }) => {
  const cacheRef = useRef<Map<string, CachedMatchData>>(new Map());
  //   const [cacheVersion, setCacheVersion] = useState(0); // Force re-renders when cache changes

  const getCachedMatch = useCallback((matchId: string): CachedMatchData | null => {
    return cacheRef.current.get(matchId) || null;
  }, []);

  const setCachedMatch = useCallback((matchId: string, data: MatchStats) => {
    // Check if the data is actually different to avoid unnecessary updates
    const existing = cacheRef.current.get(matchId);
    if (existing && existing.data === data) {
      return; // No change needed
    }

    // If cache is at max size, remove oldest entry
    if (cacheRef.current.size >= MAX_CACHE_SIZE && !cacheRef.current.has(matchId)) {
      const oldestKey = Array.from(cacheRef.current.keys())[0];
      cacheRef.current.delete(oldestKey);
    }

    cacheRef.current.set(matchId, {
      data,
      timestamp: Date.now(),
      isStale: false
    });

    // Trigger re-render only when cache actually changes
    // setCacheVersion(prev => prev + 1);
  }, []);

  const isFreshCache = useCallback((matchId: string): boolean => {
    const cachedData = cacheRef.current.get(matchId);
    if (!cachedData) return false;

    const age = Date.now() - cachedData.timestamp;
    return age < CACHE_EXPIRY_TIME;
  }, []);

  const clearStaleCache = useCallback(() => {
    const now = Date.now();
    let hasChanges = false;

    // Remove stale entries
    for (const [matchId, data] of cacheRef.current) {
      const age = now - data.timestamp;
      if (age >= CACHE_EXPIRY_TIME) {
        cacheRef.current.delete(matchId);
        hasChanges = true;
      }
    }

    // Only trigger re-render if something was actually removed
    if (hasChanges) {
      // setCacheVersion(prev => prev + 1);
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const now = Date.now();
    let freshEntries = 0;
    let staleEntries = 0;

    for (const data of cacheRef.current.values()) {
      const age = now - data.timestamp;
      if (age < CACHE_EXPIRY_TIME) {
        freshEntries++;
      } else {
        staleEntries++;
      }
    }

    return {
      totalCached: cacheRef.current.size,
      freshEntries,
      staleEntries
    };
  }, []); // Stats are computed fresh each time, no dependencies needed

  // Auto-cleanup stale cache entries every 5 minutes
  React.useEffect(() => {
    const cleanup = setInterval(clearStaleCache, 5 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, [clearStaleCache]);

  const value: MatchCacheContextType = useMemo(() => ({
    getCachedMatch,
    setCachedMatch,
    isFreshCache,
    clearStaleCache,
    getCacheStats
  }), [getCachedMatch, setCachedMatch, isFreshCache, clearStaleCache, getCacheStats]);

  return (
    <MatchCacheContext.Provider value={value}>
      {children}
    </MatchCacheContext.Provider>
  );
};

export const useMatchCache = (): MatchCacheContextType => {
  const context = useContext(MatchCacheContext);
  if (!context) {
    throw new Error('useMatchCache must be used within a MatchCacheProvider');
  }
  return context;
}; 