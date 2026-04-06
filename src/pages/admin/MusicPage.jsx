import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Music, ExternalLink, Edit } from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { moviesService } from '../../services/movies'
import { musicService } from '../../services/movies'
import { tmdbImage } from '../../services/tmdb'

export default function AdminMusicPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesService.getAll({ limit: 100 }),
  })

  const movies = (data?.data || []).filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Music Links</h2>
          <p className="text-dark-400 text-sm">Manage OST & BGM links for each movie</p>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter movies..."
          className="input-field text-sm max-w-xs"
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-2">
            {movies.map(movie => (
              <MusicMovieRow key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-dark-400">
            <Music size={32} className="mx-auto mb-3 opacity-30" />
            <p>No movies found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function MusicMovieRow({ movie }) {
  const { data: links = [] } = useQuery({
    queryKey: ['music-links', movie.id],
    queryFn: () => musicService.getByMovie(movie.id),
  })

  return (
    <div className="glass-dark rounded-xl p-3 flex items-center gap-3">
      <div className="w-10 h-14 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
        {movie.backdrop_path && (
          <img src={tmdbImage(movie.backdrop_path, 'w92')} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{movie.title}</p>
        <div className="flex items-center gap-2 mt-1">
          {links.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {links.map(link => (
                <span key={link.id} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize">
                  {link.type} · {link.platform.replace('_', ' ')}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-dark-500">No music links</span>
          )}
        </div>
      </div>
      <Link
        to={`/admin/movies/${movie.id}`}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
        title="Edit music links"
      >
        <Edit size={14} className="text-dark-300" />
      </Link>
    </div>
  )
}
