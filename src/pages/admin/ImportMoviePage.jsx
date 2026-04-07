import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Search, Download, Film, Star, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '../../layouts/AdminLayout'
import { moviesService } from '../../services/movies'
import { personsService } from '../../services/persons'
import { tmdbService, tmdbImage } from '../../services/tmdb'
import { supabase } from '../../lib/supabase'

export default function ImportMoviePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [importing, setImporting] = useState(null)
  const [imported, setImported] = useState([]) // track imported tmdb ids
  const qc = useQueryClient()
  const navigate = useNavigate()

  const search = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const data = await tmdbService.searchMovies(query)
      setResults(data || [])
    } catch {
      toast.error('TMDB search failed. Check your API key.')
    } finally {
      setSearching(false)
    }
  }

  const importMovie = async (tmdbMovie) => {
    setImporting(tmdbMovie.id)
    try {
      const full = await tmdbService.getMovie(tmdbMovie.id)

      const movie = await moviesService.upsertByTmdbId({
        tmdb_id: full.id,
        title: full.title,
        overview: full.overview,
        release_date: full.release_date,
        backdrop_path: full.backdrop_path,
        genres: full.genres?.map(g => g.name) || [],
        poster_url: full.poster_path ? tmdbImage(full.poster_path, 'w500') : null,
      })

      const credits = full.credits
      const people = [
        ...(credits?.cast?.slice(0, 20).map(p => ({ ...p, role: 'cast' })) || []),
        ...(credits?.crew?.filter(p => ['Director', 'Producer', 'Music'].includes(p.job)).map(p => ({ ...p, role: 'crew' })) || []),
      ]

      await Promise.all(people.map(async (p) => {
        const person = await personsService.upsertByTmdbId({
          tmdb_id: p.id,
          name: p.name,
          profile_path: p.profile_path,
          department: p.known_for_department || p.department || 'Acting',
        })
        await supabase.from('movie_person').upsert(
          { movie_id: movie.id, person_id: person.id, role: p.role },
          { onConflict: 'movie_id,person_id' }
        )
      }))

      qc.invalidateQueries(['admin-movies'])
      qc.invalidateQueries(['admin-stats'])
      setImported(prev => [...prev, tmdbMovie.id])
      toast.success(`"${full.title}" imported!`)
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      setImporting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin/movies" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="text-dark-300" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-white">Import Movie</h2>
            <p className="text-xs text-dark-400 mt-0.5">Search TMDB and import movie data, cast & crew</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={search} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movie title..."
              className="input-field pl-10 text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="btn-primary flex items-center gap-2 text-sm flex-shrink-0 disabled:opacity-50"
          >
            {searching
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Search size={15} />
            }
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">
              {results.length} results for "{query}"
            </p>
            <div className="space-y-2">
              {results.map(movie => {
                const isImported = imported.includes(movie.id)
                const isImporting = importing === movie.id
                const posterUrl = movie.poster_path ? tmdbImage(movie.poster_path, 'w185') : null
                const backdropUrl = movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'w300') : null

                return (
                  <div
                    key={movie.id}
                    className="glass-dark rounded-2xl overflow-hidden flex gap-0"
                  >
                    {/* Poster */}
                    <div className="w-20 flex-shrink-0 bg-dark-700 relative">
                      {posterUrl ? (
                        <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                      ) : backdropUrl ? (
                        <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={20} className="text-dark-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex items-center gap-4 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {movie.release_date && (
                            <span className="flex items-center gap-1 text-xs text-dark-400">
                              <Calendar size={11} />
                              {movie.release_date.slice(0, 4)}
                            </span>
                          )}
                          {movie.vote_average > 0 && (
                            <span className="flex items-center gap-1 text-xs text-dark-400">
                              <Star size={11} className="text-yellow-400" />
                              {movie.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {movie.overview && (
                          <p className="text-xs text-dark-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {movie.overview}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0">
                        {isImported ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                              ✓ Imported
                            </div>
                            <Link
                              to="/admin/movies"
                              className="text-xs text-accent hover:underline"
                            >
                              Manage →
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() => importMovie(movie)}
                            disabled={isImporting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 active:scale-95 disabled:opacity-60"
                            style={{
                              background: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)',
                              boxShadow: '0 2px 12px rgba(10,132,255,0.3)',
                            }}
                          >
                            {isImporting ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Download size={14} />
                                Import
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!searching && results.length === 0 && query && (
          <div className="text-center py-16 text-dark-400">
            <Film size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No results found for "{query}"</p>
          </div>
        )}

        {/* Initial state */}
        {results.length === 0 && !query && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <Film size={28} className="text-dark-400" />
            </div>
            <p className="text-dark-400 text-sm">Search for a movie title above</p>
            <p className="text-dark-600 text-xs mt-1">Imports title, overview, genres, cast & crew from TMDB</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
