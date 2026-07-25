import type { AnyRouter } from '@tanstack/react-router'

let currentRouter: AnyRouter | undefined

export function setRouterRef(router: AnyRouter): void {
  if (typeof window !== 'undefined') currentRouter = router
}

export function getRouterRef(): AnyRouter | undefined {
  return typeof window !== 'undefined' ? currentRouter : undefined
}
