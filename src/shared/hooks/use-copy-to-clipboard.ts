import { useCallback, useEffect, useState } from 'react'

export interface UseCopyToClipboardResult {
  copied: boolean
  copy: (value: string) => Promise<boolean>
}

export function useCopyToClipboard(resetMs = 2000): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), resetMs)
    return () => clearTimeout(timer)
  }, [copied, resetMs])

  const copy = useCallback(async (value: string) => {
    setCopied(true)
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      return false
    }
  }, [])

  return { copied, copy }
}
