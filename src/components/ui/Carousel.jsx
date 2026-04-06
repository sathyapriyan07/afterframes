import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Carousel({ title, children, viewAllLink }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="section-title mb-0">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllLink && (
            <a href={viewAllLink} className="text-sm text-accent hover:text-accent-hover transition-colors mr-2">
              See All
            </a>
          )}
          <button
            onClick={() => scroll(-1)}
            className="p-1.5 rounded-full glass hover:bg-white/10 transition-colors hidden md:flex"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-1.5 rounded-full glass hover:bg-white/10 transition-colors hidden md:flex"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar px-4 md:px-0 pb-2"
      >
        {children}
      </div>
    </section>
  )
}
