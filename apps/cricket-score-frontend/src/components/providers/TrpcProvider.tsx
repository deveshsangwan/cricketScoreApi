'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpSubscriptionLink, loggerLink, retryLink, splitLink } from '@trpc/client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { trpc } from '@/lib/trpc';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { config } from '@/config/env';
interface TrpcProviderProps {
  children: React.ReactNode;
}

export function TrpcProvider({ children }: TrpcProviderProps) {
  const { getToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        ...(config.isDevelopment ? [loggerLink()] : []),
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: [
            retryLink({
              retry: (opts) => {
                const code = opts.error.data?.code;
                return code === 'UNAUTHORIZED' || code === 'FORBIDDEN';
              },
            }),
            httpSubscriptionLink({
            url: `${config.api.baseUrl}/trpc`,
            // Use EventSource polyfill to allow custom headers on SSE
            EventSource: EventSourcePolyfill,
            eventSourceOptions: async () => {
              const token = await getToken();
              return {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              };
            },
          })],
          false: httpBatchLink({
            url: `${config.api.baseUrl}/trpc`,
            headers: async () => {
              const token = await getToken();
              return {
                ...(token && { Authorization: `Bearer ${token}` }),
              };
            },
          }),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
} 