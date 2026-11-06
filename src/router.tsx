import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        // Keep focus changes (switching between the page and DevTools) from
        // starting a burst of stale API requests while someone is typing.
        // Stale data still refreshes when its route/query is opened again.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL.replace(/\/+$/, "") || "/",
    context: { queryClient },
    scrollRestoration: true,
    // Avoid re-running route loaders on every pointer/focus intent. The query
    // client separately keeps API data fresh for five minutes.
    defaultPreloadStaleTime: 5 * 60 * 1000,
  });

  return router;
};
