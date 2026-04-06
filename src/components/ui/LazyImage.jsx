import { useState } from 'react'
import { useInView } from 'react-intersection-observer'

export function LazyImage({ src, alt, className = '', fallback = null }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' })

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 shimmer" />
      )}
      {inView && !error && src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {(error || !src) && (
        <div className="absolute inset-0 bg-dark-700 flex items-center justify-center">
          {fallback || <span className="text-dark-400 text-xs">No image</span>}
        </div>
      )}
    </div>
  )
}
