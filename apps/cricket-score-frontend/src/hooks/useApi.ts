import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { config } from '@/config/env';

interface UseApiOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export const useApi = (options: UseApiOptions = {}) => {
  const { getToken } = useAuth();
  const { timeout = config.api.timeout, retries = 3, retryDelay = 1000 } = options;

  const makeRequest = useCallback(async <T>(
    url: string,
    requestOptions: RequestInit = {}
  ): Promise<T> => {
    const token = await getToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const executeRequest = async (attempt: number = 1): Promise<T> => {
      try {
        const response = await fetchWithTimeout(url, {
          ...requestOptions,
          headers: {
            ...defaultHeaders,
            ...requestOptions.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        return await response.json();
      } catch (error) {
        // Retry logic for network errors or 5xx errors
        if (attempt < retries && shouldRetry(error)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return executeRequest(attempt + 1);
        }
        
        // Convert to ApiError if it's not already
        if (error instanceof ApiError) {
          throw error;
        }
        
        throw new ApiError(
          error instanceof Error ? error.message : 'An unknown error occurred',
          'NETWORK_ERROR',
          { originalError: error }
        );
      }
    };

    return executeRequest();
  }, [getToken, timeout, retries, retryDelay]);

  return { makeRequest };
};

// Helper function to determine if a request should be retried
const shouldRetry = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    // Retry on 5xx errors or network errors
    return (
      typeof error.code === 'number' && 
      error.code >= 500
    ) || error.code === 'NETWORK_ERROR';
  }
  
  // Retry on network errors
  return error instanceof TypeError && 
         (error.message.includes('fetch') || error.message.includes('network'));
};

class ApiError extends Error {
  constructor(
    message: string,
    public code?: string | number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 