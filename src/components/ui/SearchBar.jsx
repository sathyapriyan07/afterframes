import { useState, useRef, useEffect } from 'react'
import { Search, X, Film, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import { moviesService } from '../../services/movies'
import { personsService } from '../../services/persons'
import { tmdbImage } from '../../services/tmdb'

export function SearchBar({ large = false, autoFocus = false }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ movies: [], persons: [] })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults({ movies: [], persons: [] }); return }
    setLoading(true)
    Promise.all([
      moviesService.search(debouncedQuery),
      personsService.search(debouncedQuery),
    ]).then(([movies, persons]) => {
      setResults({ movies: movies || [], persons: persons || [] })
      setOpen(true)
    }).finally(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  const hasResults = results.movies.length > 0 || results.persons.length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center ${large ? 'glass rounded-2xl' : 'glass-dark rounded-xl'}`}>
          <Search size={large ? 20 : 16} className="absolute left-4 text-dark-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => hasResults && setOpen(true)}
            placeholder="Search movies, people..."
            className={`w-full bg-transparent text-white placeholder-dark-400 focus:outline-none ${large ? 'pl-12 pr-12 py-4 text-lg' : 'pl-10 pr-10 py-2.5 text-sm'}`}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setOpen(false) }} className="absolute right-4">
              <X size={16} className="text-dark-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </form>

      {open && hasResults && (
        <div className="absolute top-full mt-2 w-full glass-dark rounded-2xl overflow-hidden z-50 shadow-2xl animate-fade-in">
          {results.movies.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-dark-400 font-medium uppercase tracking-wider border-b border-white/5">Movies</div>
              {results.movies.slice(0, 4).map(movie => (
                <button
                  key={movie.id}
                  onClick={() => { navigate(`/movie/${movie.id}`); setOpen(false); setQuery('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  {movie.backdrop_path ? (
                    <img src={tmdbImage(movie.backdrop_path, 'w92')} alt="" className="w-10 h-7 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-7 bg-dark-600 rounded flex items-center justify-center">
                      <Film size={12} className="text-dark-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-white">{movie.title}</div>
                    <div className="text-xs text-dark-400">{movie.release_date?.slice(0, 4)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results.persons.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-dark-400 font-medium uppercase tracking-wider border-b border-white/5">People</div>
              {results.persons.slice(0, 3).map(person => (
                <button
                  key={person.id}
                  onClick={() => { navigate(`/person/${person.id}`); setOpen(false); setQuery('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  {person.profile_path ? (
                    <img src={tmdbImage(person.profile_path, 'w45')} alt="" className="w-8 h-8 object-cover rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center">
                      <User size={12} className="text-dark-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-white">{person.name}</div>
                    <div className="text-xs text-dark-400">{person.department}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 text-sm text-accent hover:bg-white/5 transition-colors border-t border-white/5 text-left"
          >
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  )
}
