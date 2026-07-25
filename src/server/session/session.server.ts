import { setResponseHeader } from '@tanstack/react-start/server'

/**
 * Relays a `set-cookie` header from the mock/real API's response onto the
 * outgoing server-function response.
 *
 * `apiRequest` (src/server/api-client/http.ts) only returns the parsed
 * body, by design — it's a typed description of the API, not a proxy. The
 * session cookie the auth endpoints set has to reach the browser some
 * other way, so `auth.server.ts` fetches those three endpoints directly
 * (bypassing `apiRequest`) and hands the raw `Response` here to forward
 * its cookie. Everything else about those calls (error normalisation,
 * schema parsing) still matches what `apiRequest` would do.
 */
export function relayCookie(response: Response): void {
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) setResponseHeader('set-cookie', setCookie)
}
