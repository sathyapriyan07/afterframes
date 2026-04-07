import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, Edit, Download, ExternalLink, Film } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '../../layouts/AdminLayout'
import { Modal } from '../../components/ui/Modal'
import { moviesService } from '../../services/movies'
import { personsService } from '../../services/persons'
import { tmdbService, tmdbImage } from '../../services/tmdb'
import { LazyImage } from '../../components/ui/LazyImage'

function ImportMovieModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [importing, setImporting] = useState(null)
  const qc = useQueryClient()

  const search = async () => {
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

      // Upsert movie
      const movie = await moviesService.upsertByTmdbId({
        tmdb_id: full.id,
        title: full.title,
        overview: full.overview,
        release_date: full.release_date,
        backdrop_path: full.backdrop_path,
        genres: full.genres?.map(g => g.name) || [],
        poster_url: full.poster_path ? tmdbImage(full.poster_path, 'w500') : null,
      })

      // Import cast & crew
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
        // Link person to movie
        const { supabase } = await import('../../lib/supabase')
        await supabase.from('movie_person').upsert(
          { movie_id: movie.id, person_id: person.id, role: p.role },
          { onConflict: 'movie_id,person_id' }
        )
      }))

      qc.invalidateQueries(['admin-movies'])
      qc.invalidateQueries(['admin-stats'])
      toast.success(`"${full.title}" imported successfully!`)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      setImporting(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Movie from TMDB" size="lg">
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search movie title..."
            className="input-field"
          />
          <button onClick={search} disabled={searching} className="btn-primary flex items-center gap-2 flex-shrink-0">
            <Search size={15} />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map(movie => (
            <div key={movie.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                <LazyImage
                  src={movie.poster_path ? tmdbImage(movie.poster_path, 'w92') : null}
                  alt={movie.title}
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                <p className="text-xs text-dark-400">{movie.release_date?.slice(0, 4)}</p>
                <p className="text-xs text-dark-500 line-clamp-1 mt-0.5">{movie.overview}</p>
              </div>
              <button
                onClick={() => importMovie(movie)}
                disabled={importing === movie.id}
                className="btn-primary text-xs flex-shrink-0 flex items-center gap-1.5"
              >
                {importing === movie.id ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Download size={13} />}
                Import
              </button>
            </div>
          ))}
          {results.length === 0 && query && !searching && (
            <p className="text-center text-dark-400 text-sm py-8">No results found</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function AdminMoviesPage() {
  const [importOpen, setImportOpen] = useState(false)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesService.getAll({ limit: 50 }),
  })

  const deleteMutation = useMutation({
    mutationFn: moviesService.delete,
    onSuccess: () => {
      qc.invalidateQueries(['admin-movies'])
      qc.invalidateQueries(['admin-stats'])
      toast.success('Movie deleted')
    },
    onError: () => toast.error('Delete failed'),
  })

  const movies = (data?.data || []).filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 max-w-xs">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter movies..."
              className="input-field text-sm"
            />
          </div>
          <button onClick={() => setImportOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Import Movie
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer h-16 rounded-xl" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-2">
            {movies.map(movie => (
              <div key={movie.id} className="glass-dark rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                  <LazyImage
                    src={movie.poster_url || (movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'w92') : null)}
                    alt={movie.title}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                  <p className="text-xs text-dark-400">{movie.release_date?.slice(0, 4)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/admin/movies/${movie.id}`}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Manage assets"
                  >
                    <Edit size={14} className="text-dark-300" />
                  </Link>
                  <a
                    href={`/movie/${movie.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink size={14} className="text-dark-300" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${movie.title}"?`)) deleteMutation.mutate(movie.id)
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-dark-400">
            <Film size={32} className="mx-auto mb-3 opacity-30" />
            <p>No movies yet. Import one from TMDB.</p>
          </div>
        )}
      </div>

      <ImportMovieModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </AdminLayout>
  )
}
