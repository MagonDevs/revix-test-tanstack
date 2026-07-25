import { setResponseHeader } from '@tanstack/react-start/server'

export function relayCookie(response: Response): void {
  const setCookie = response.headers.get('set-cookie')
  if (setCookie) setResponseHeader('set-cookie', setCookie)
}
