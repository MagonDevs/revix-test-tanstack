import type { AnyRouter } from '@tanstack/react-router'

/**
 * A module-level reference to the current router instance.
 *
 * TanStack Query's `QueryCache`/`MutationCache` `onError` callbacks run
 * outside React, so they have no access to `useNavigate()`. The router is
 * created once per request in `getRouter()` (src/router.tsx) — stashing a
 * reference here lets the query client's global 401 handler navigate
 * without threading the router through every call site. Client-side only:
 * on the server a stale reference from a previous request would be wrong,
 * and a 401 mid-SSR is already handled by `_authenticated`'s `beforeLoad`.
 */
let currentRouter: AnyRouter | undefined

export function setRouterRef(router: AnyRouter): void {
  if (typeof window !== 'undefined') currentRouter = router
}

export function getRouterRef(): AnyRouter | undefined {
  return typeof window !== 'undefined' ? currentRouter : undefined
}
