# TanStack Start API notes — pinned versions

Pinned: `@tanstack/react-start@1.168.32`, `@tanstack/react-router@1.170.18`.

- No separate `client.tsx`/`server.tsx` entry files in this line — SSR is fully owned by the `tanstackStart()` Vite plugin (`vite.config.ts`) and `src/router.tsx`'s `getRouter()`. Doc 02's diagram assumes an older entry shape; the plugin covers it.
- `createRootRouteWithContext<T>()` is the way to type router context (`{ queryClient }`) so `beforeLoad`/`loader` see it — used in `src/routes/__root.tsx`.
- `setupRouterSsrQueryIntegration` from `@tanstack/react-router-ssr-query` wires TanStack Query dehydration/hydration; called once per router instance inside `getRouter()`, which itself must be called per-request so no `QueryClient` leaks across requests.
- `getRequestHeaders` / server-route `handlers: { GET, POST, ... }` signature to be verified against the pinned version when Phase 2 (mock API routes) starts — not yet exercised at Phase 0.
- Server function shape (`createServerFn({ method }).inputValidator(schema).handler(fn)`) is the current stable API per the CLI-generated starter; confirm exact validator method name (`inputValidator` vs `validator`) when writing the first `*.server.ts` in Phase 2/3.

## Phase 2 findings

- Server-route file-based routing under `src/routes/api/v1/**` works as documented for ordinary segments (dots → path separators, `$param` → dynamic segment), confirmed against every real resource route (`pets.index.ts`, `pets.$petId.ts`, `auth.login.ts`, etc — all curl-verified 200).
- **Deviation from doc03 §3.9**: a leading double-underscore path segment (`__mock`) is unroutable server-side on this pinned version — the client-generated `routeTree.gen.ts` lists `/api/v1/__mock/config` correctly (so `Route.useSearch()`-style typing looks fine), but the actual HTTP server request matcher 404s on it, falling through to the SPA's `notFoundComponent`. A single leading underscore (`_mock`) has the same problem. Root cause looks like a reserved-prefix collision with the framework's own internal route ids (`__root__`, `$tsr`, etc.), not a routing rule we control from application code.
  - **Fix applied**: mock-only control routes live at `/api/v1/mock/reset`, `/api/v1/mock/config`, `/api/v1/mock/login-as` (no underscore) instead of the spec's literal `/__mock/*`. These are test-support endpoints only (gated by `MOCK_API=true`, never part of the real API surface per doc03 §3.9), so the path deviates without touching the actual product contract. Playwright fixtures (Phase 8/E2E) and any manual testing must use the non-underscore path. If a future Start version fixes the underscore-prefix routing, these three files can be renamed back with no other code changes.
