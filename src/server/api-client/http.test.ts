import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { ApiError } from './api-error'
import { apiRequest } from './http'

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  vi.restoreAllMocks()
})

function mockFetchOnce(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  global.fetch = fetchMock as typeof fetch
  return fetchMock
}

describe('apiRequest', () => {
  it('serialises array query params as repeated keys, not comma-joined', async () => {
    const fetchMock = mockFetchOnce(new Response(null, { status: 204 }))
    await apiRequest({
      path: '/pets',
      query: { species: ['dog', 'cat'], page: 1 },
    })

    const calledUrl = new URL((fetchMock.mock.calls[0] as [URL])[0])
    expect(calledUrl.searchParams.getAll('species')).toEqual(['dog', 'cat'])
    expect(calledUrl.searchParams.get('page')).toBe('1')
  })

  it('drops undefined, null and empty-string query values', async () => {
    const fetchMock = mockFetchOnce(new Response(null, { status: 204 }))
    await apiRequest({
      path: '/pets',
      query: { q: undefined, city: null, sort: '' },
    })
    const calledUrl = new URL((fetchMock.mock.calls[0] as [URL])[0])
    expect([...calledUrl.searchParams.keys()]).toEqual([])
  })

  it('returns undefined for a 204 response without attempting to parse a body', async () => {
    mockFetchOnce(new Response(null, { status: 204 }))
    const result = await apiRequest({
      path: '/me/favourites/some-id',
      method: 'PUT',
    })
    expect(result).toBeUndefined()
  })

  it('parses a 2xx body against the given schema', async () => {
    mockFetchOnce(
      new Response(JSON.stringify({ id: '1', name: 'Nala' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const schema = z.object({ id: z.string(), name: z.string() })
    const result = await apiRequest({ path: '/pets/1', schema })
    expect(result).toEqual({ id: '1', name: 'Nala' })
  })

  it('throws ApiError.contract when the body does not match the schema', async () => {
    mockFetchOnce(
      new Response(JSON.stringify({ id: '1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const schema = z.object({ id: z.string(), name: z.string() })
    await expect(
      apiRequest({ path: '/pets/1', schema }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('maps a non-2xx response to ApiError with the envelope fields', async () => {
    mockFetchOnce(
      new Response(
        JSON.stringify({
          error: { code: 'not_found', message: 'Pet not found.' },
        }),
        { status: 404, headers: { 'content-type': 'application/json' } },
      ),
    )
    await expect(apiRequest({ path: '/pets/missing' })).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    })
  })

  it('wraps a network failure in ApiError.network', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('fetch failed')) as typeof fetch
    await expect(apiRequest({ path: '/pets' })).rejects.toBeInstanceOf(ApiError)
  })

  it('sends a FormData body without a content-type header so the browser sets the boundary', async () => {
    const fetchMock = mockFetchOnce(new Response(null, { status: 204 }))
    const form = new FormData()
    form.set('file', new Blob(['x']), 'x.png')
    await apiRequest({ path: '/uploads', method: 'POST', body: form })

    const init = (fetchMock.mock.calls[0] as [URL, RequestInit])[1]
    const headers = init.headers as Record<string, string>
    expect(headers['content-type']).toBeUndefined()
    expect(init.body).toBe(form)
  })
})
