import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '../layouts/MainLayout'
import { Carousel } from '../components/ui/Carousel'
import { MovieCard } from '../components/movie/MovieCard'
import { PersonCard } from '../components/person/PersonCard'
import { SearchBar } from '../components/ui/SearchBar'
import { MovieCardSkeleton, PersonCardSkeleton } from '../components/ui/Skeleton'
import { sectionsService } from '../services/sections'
import { tmdbImage } from '../services/tmdb'

function HeroSection() {
  const [bgIndex, setBgIndex] = useState(0)
  const { data: sections } = useQuery({
    queryKey: ['sections-hero'],
    queryFn: sectionsService.getWithItems,
  })

  const heroMovies = sections?.flatMap(s => s.items?.filter(i => i.ref_type === 'movie' && i.backdrop_path) || []).slice(0, 5) || []

  useEffect(() => {
    if (!heroMovies.length) return
    const timer = setInterval(() => setBgIndex(i => (i + 1) % heroMovies.length), 6000)
    return () => clearInterval(timer)
  }, [heroMovies.length])

  const current = heroMovies[bgIndex]

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {current?.backdrop_path ? (
          <img
            key={bgIndex}
            src={tmdbImage(current.backdrop_path, 'w1280')}
            alt=""
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-dark-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-transparent to-dark-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight">
          Movie & Person
          <span className="block text-gradient">Media Hub</span>
        </h1>
        <p className="text-dark-300 text-lg mb-8">
          Download posters, wallpapers, logos & more
        </p>
        <SearchBar large />
      </div>

      {/* Dots */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {heroMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setBgIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === bgIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: sectionsService.getWithItems,
    staleTime: 60_000,
  })

  return (
    <MainLayout>
      <Helmet>
        <title>MediaHub — Movie & Person Media Hub</title>
        <meta name="description" content="Download movie posters, wallpapers, title logos, and person wallpapers. Explore music links for your favorite movies." />
      </Helmet>

      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {isLoading ? (
          <>
            {[1, 2, 3].map(i => (
              <section key={i} className="mb-10">
                <div className="shimmer h-6 w-40 rounded-lg mb-4" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, j) => <MovieCardSkeleton key={j} />)}
                </div>
              </section>
            ))}
          </>
        ) : sections?.length ? (
          sections.map(section => (
            <Carousel key={section.id} title={section.title}>
              {section.items?.map(item =>
                item.ref_type === 'movie'
                  ? <MovieCard key={item.id} movie={item} />
                  : <PersonCard key={item.id} person={item} />
              )}
            </Carousel>
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-dark-400 text-lg mb-2">No content yet</p>
            <p className="text-dark-500 text-sm">Add movies and create sections in the admin panel to get started.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
