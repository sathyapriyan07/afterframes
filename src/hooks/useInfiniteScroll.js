import { useEffect, useRef, useState } from 'react'

export function useInfiniteScroll(fetchFn, deps = []) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef(null)

  const loadMore = async (p = page) => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const { data, count } = await fetchFn(p)
      setItems(prev => p === 1 ? data : [...prev, ...data])
      setHasMore(items.length + data.length < count)
      setPage(p + 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    loadMore(1)
  }, deps)

  const sentinelRef = (node) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    })
    observerRef.current.observe(node)
  }

  return { items, loading, hasMore, sentinelRef }
}
