# TanStack Start API notes — pinned versions

Pinned: `@tanstack/react-start@1.168.32`, `@tanstack/react-router@1.170.18`.

- No separate `client.tsx`/`server.tsx` entry files in this line — SSR is fully owned by the `tanstackStart()` Vite plugin (`vite.config.ts`) and `src/router.tsx`'s `getRouter()`. Doc 02's diagram assumes an older entry shape; the plugin covers it.
- `createRootRouteWithContext<T>()` is the way to type router context (`{ queryClient }`) so `beforeLoad`/`loader` see it — used in `src/routes/__root.tsx`.
- `setupRouterSsrQueryIntegration` from `@tanstack/react-router-ssr-query` wires TanStack Query dehydration/hydration; called once per router instance inside `getRouter()`, which itself must be called per-request so no `QueryClient` leaks across requests.
- `getRequestHeaders` / server-route `handlers: { GET, POST, ... }` signature to be verified against the pinned version when Phase 2 (mock API routes) starts — not yet exercised at Phase 0.
- Server function shape (`createServerFn({ method }).inputValidator(schema).handler(fn)`) is the current stable API per the CLI-generated starter; confirm exact validator method name (`inputValidator` vs `validator`) when writing the first `*.server.ts` in Phase 2/3.
