import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,            // turn off automatic retries for auth‑related queries
      refetchOnWindowFocus: false,
    },
  },
});
