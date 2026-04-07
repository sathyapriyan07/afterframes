import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit, ExternalLink, Film } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '../../layouts/AdminLayout'
import { moviesService } from '../../services/movies'
import { tmdbImage } from '../../services/tmdb'
import { LazyImage } from '../../components/ui/LazyImage'

export default function AdminMoviesPage() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesService.getAll({ limit: 100 }),
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

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter movies..."
            className="input-field text-sm max-w-xs"
          />
          <Link
            to="/admin/movies/import"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 active:scale-95 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)',
              boxShadow: '0 2px 12px rgba(10,132,255,0.3)',
            }}
          >
            <Plus size={15} /> Import Movie
          </Link>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
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
                <div className="flex items-center gap-1">
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
                    title="View on site"
                  >
                    <ExternalLink size={14} className="text-dark-300" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${movie.title}"?`)) deleteMutation.mutate(movie.id)
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-dark-400">
            <Film size={36} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No movies yet.</p>
            <Link to="/admin/movies/import" className="text-accent text-sm mt-2 inline-block hover:underline">
              Import your first movie →
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
