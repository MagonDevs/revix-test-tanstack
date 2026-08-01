import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useCopyToClipboard } from './use-copy-to-clipboard'

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
}

describe('useCopyToClipboard', () => {
  it('writes the value to the clipboard and flags copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('https://adopta.test/pets/1')
    })

    expect(writeText).toHaveBeenCalledWith('https://adopta.test/pets/1')
    expect(result.current.copied).toBe(true)
  })

  it('clears the copied flag after the reset delay', async () => {
    stubClipboard(() => Promise.resolve())

    const { result } = renderHook(() => useCopyToClipboard(10))

    await act(async () => {
      await result.current.copy('https://adopta.test/pets/1')
    })

    await waitFor(() => expect(result.current.copied).toBe(false))
  })
})
