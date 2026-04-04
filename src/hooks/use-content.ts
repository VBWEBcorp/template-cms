'use client'

import { useEffect, useState } from 'react'

export function useContent<T extends Record<string, any>>(
  pageId: string,
  defaults: T
): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(defaults)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${pageId}`)
        const result = await response.json()

        if (result.content && Object.keys(result.content).length > 0) {
          setData({ ...defaults, ...result.content })
        }
      } catch (error) {
        console.error(`Failed to load content for ${pageId}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  return { data, loading }
}
