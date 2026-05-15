import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Sensitive health-adjacent data: don't refetch in background
        // unless the user is interacting.
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        staleTime: 30_000,
        retry: 2,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
