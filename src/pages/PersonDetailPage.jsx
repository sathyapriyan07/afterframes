import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Film } from 'lucide-react'
import { MainLayout } from '../layouts/MainLayout'
import { WallpaperGrid } from '../components/movie/AssetGrid'
import { Skeleton } from '../components/ui/Skeleton'
import { personsService } from '../services/persons'
import { personAssetsService } from '../services/persons'
import { tmdbImage } from '../services/tmdb'

export default function PersonDetailPage() {
  const { id } = useParams()
  const [movieFilter, setMovieFilter] = useState(null)

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: () => personsService.getById(id),
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['person-assets', id],
    queryFn: () => personAssetsService.getByPerson(id),
    enabled: !!id,
  })

  const movies = person?.movie_person?.map(mp => mp.movies).filter(Boolean) || []

  const filteredAssets = movieFilter
    ? assets.filter(a => a.movie_id === movieFilter)
    : assets

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center gap-5 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!person) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-dark-400 text-lg">Person not found</p>
            <Link to="/" className="text-accent text-sm mt-2 inline-block">← Back to Home</Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const profileUrl = person.profile_path ? tmdbImage(person.profile_path, 'w185') : null

  return (
    <MainLayout>
      <Helmet>
        <title>{person.name} — MediaHub</title>
        <meta name="description" content={`Download wallpapers of ${person.name}`} />
      </Helmet>

      {/* Header */}
      <div className="pt-16 pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back
          </Link>

          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-dark-700 flex-shrink-0">
              {profileUrl ? (
                <img src={profileUrl} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-400 text-2xl font-bold">
                  {person.name[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">{person.name}</h1>
              {person.department && (
                <p className="text-dark-400 text-sm mt-1 capitalize">{person.department.toLowerCase()}</p>
              )}
              <p className="text-dark-500 text-xs mt-1">{assets.length} wallpapers</p>
            </div>
          </div>

          {/* Movie Filter */}
          {movies.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
              <button
                onClick={() => setMovieFilter(null)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                  !movieFilter ? 'bg-accent text-white' : 'glass text-dark-300 hover:text-white'
                }`}
              >
                All
              </button>
              {movies.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => setMovieFilter(movie.id === movieFilter ? null : movie.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                    movieFilter === movie.id ? 'bg-accent text-white' : 'glass text-dark-300 hover:text-white'
                  }`}
                >
                  <Film size={12} />
                  {movie.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wallpapers */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        <WallpaperGrid assets={filteredAssets} emptyMessage="No wallpapers uploaded yet" />
      </div>
    </MainLayout>
  )
}
