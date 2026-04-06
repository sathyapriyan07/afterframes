import { Link } from 'react-router-dom'
import { LazyImage } from '../ui/LazyImage'
import { tmdbImage } from '../../services/tmdb'

export function MovieCard({ movie }) {
  const poster = movie.poster_url || (movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'w342') : null)

  return (
    <Link to={`/movie/${movie.id}`} className="flex-shrink-0 w-36 md:w-44 group card-hover block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-700">
        <LazyImage src={poster} alt={movie.title} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors">{movie.title}</p>
        <p className="text-xs text-dark-400 mt-0.5">{movie.release_date?.slice(0, 4)}</p>
      </div>
    </Link>
  )
}

export function MovieGridCard({ movie }) {
  const poster = movie.poster_url || (movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'w342') : null)

  return (
    <Link to={`/movie/${movie.id}`} className="group card-hover block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-700">
        <LazyImage src={poster} alt={movie.title} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-medium text-white truncate">{movie.title}</p>
          <p className="text-xs text-dark-300">{movie.release_date?.slice(0, 4)}</p>
        </div>
      </div>
    </Link>
  )
}
