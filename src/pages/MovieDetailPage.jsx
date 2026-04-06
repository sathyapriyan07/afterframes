import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { MainLayout } from '../layouts/MainLayout'
import { AssetGrid, WallpaperGrid, LogoGrid } from '../components/movie/AssetGrid'
import { MusicSection } from '../components/movie/MusicSection'
import { PersonCard } from '../components/person/PersonCard'
import { Skeleton } from '../components/ui/Skeleton'
import { moviesService, assetsService, musicService } from '../services/movies'
import { tmdbImage } from '../services/tmdb'

const TABS = ['Posters', 'Wallpapers', 'Logos', 'Cast', 'Music']

export default function MovieDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Posters')

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesService.getById(id),
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['movie-assets', id],
    queryFn: () => assetsService.getByMovie(id),
    enabled: !!id,
  })

  const { data: musicLinks = [] } = useQuery({
    queryKey: ['music-links', id],
    queryFn: () => musicService.getByMovie(id),
    enabled: !!id,
  })

  const posters = assets.filter(a => a.type === 'poster')
  const wallpapers = assets.filter(a => a.type === 'wallpaper')
  const logos = assets.filter(a => a.type === 'logo')
  const cast = movie?.movie_person?.filter(mp => mp.role === 'cast').map(mp => mp.persons) || []

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-[50vh] shimmer" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
      </MainLayout>
    )
  }

  if (!movie) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-dark-400 text-lg">Movie not found</p>
            <Link to="/" className="text-accent text-sm mt-2 inline-block">← Back to Home</Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const heroLogo = logos[0]
  const backdropUrl = movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'original') : null

  return (
    <MainLayout>
      <Helmet>
        <title>{movie.title} — MediaHub</title>
        <meta name="description" content={movie.overview} />
        {backdropUrl && <meta property="og:image" content={backdropUrl} />}
      </Helmet>

      {/* Hero */}
      <div className="relative h-[55vh] md:h-[65vh] overflow-hidden">
        {backdropUrl ? (
          <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/60 to-transparent" />

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-16 left-4 md:left-8 flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors glass px-3 py-1.5 rounded-xl"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 max-w-7xl mx-auto">
          {heroLogo ? (
            <img src={heroLogo.image_url} alt={movie.title} className="h-16 md:h-24 object-contain mb-4 max-w-xs" />
          ) : (
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">{movie.title}</h1>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-dark-300">
            {movie.release_date && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {new Date(movie.release_date).getFullYear()}
              </span>
            )}
            {movie.genres?.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag size={13} />
                {movie.genres.join(', ')}
              </span>
            )}
          </div>
          {movie.overview && (
            <p className="text-dark-300 text-sm mt-2 max-w-2xl line-clamp-2">{movie.overview}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 glass-dark rounded-2xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-accent text-white'
                  : 'text-dark-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
              {tab === 'Posters' && posters.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({posters.length})</span>
              )}
              {tab === 'Wallpapers' && wallpapers.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({wallpapers.length})</span>
              )}
              {tab === 'Logos' && logos.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({logos.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'Posters' && <AssetGrid assets={posters} emptyMessage="No posters uploaded yet" />}
          {activeTab === 'Wallpapers' && <WallpaperGrid assets={wallpapers} emptyMessage="No wallpapers uploaded yet" />}
          {activeTab === 'Logos' && <LogoGrid assets={logos} emptyMessage="No logos uploaded yet" />}
          {activeTab === 'Cast' && (
            <div>
              {cast.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {cast.map(person => person && <PersonCard key={person.id} person={person} />)}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-dark-400 text-sm">
                  No cast information available
                </div>
              )}
            </div>
          )}
          {activeTab === 'Music' && <MusicSection links={musicLinks} />}
        </div>
      </div>
    </MainLayout>
  )
}
