import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '../layouts/MainLayout'
import { SearchBar } from '../components/ui/SearchBar'
import { MovieGridCard } from '../components/movie/MovieCard'
import { PersonCard } from '../components/person/PersonCard'
import { GridSkeleton } from '../components/ui/Skeleton'
import { moviesService } from '../services/movies'
import { personsService } from '../services/persons'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [tab, setTab] = useState('movies')

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ['search-movies', query],
    queryFn: () => moviesService.search(query),
    enabled: !!query,
  })

  const { data: persons = [], isLoading: personsLoading } = useQuery({
    queryKey: ['search-persons', query],
    queryFn: () => personsService.search(query),
    enabled: !!query,
  })

  useEffect(() => {
    if (movies.length === 0 && persons.length > 0) setTab('persons')
    else setTab('movies')
  }, [query])

  return (
    <MainLayout>
      <Helmet>
        <title>{query ? `"${query}" — Search` : 'Search'} — MediaHub</title>
      </Helmet>

      <div className="pt-20 pb-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Search Input */}
        <div className="max-w-xl mb-8">
          <SearchBar autoFocus />
        </div>

        {query ? (
          <>
            <p className="text-dark-400 text-sm mb-5">
              Results for <span className="text-white font-medium">"{query}"</span>
            </p>

            {/* Tabs */}
            <div className="flex gap-1 glass-dark rounded-2xl p-1 w-fit mb-6">
              {[
                { key: 'movies', label: `Movies (${movies.length})` },
                { key: 'persons', label: `People (${persons.length})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tab === key ? 'bg-accent text-white' : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Results */}
            {tab === 'movies' && (
              moviesLoading ? <GridSkeleton count={10} /> :
              movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movies.map(movie => <MovieGridCard key={movie.id} movie={movie} />)}
                </div>
              ) : (
                <div className="text-center py-16 text-dark-400">No movies found for "{query}"</div>
              )
            )}

            {tab === 'persons' && (
              personsLoading ? <GridSkeleton count={10} /> :
              persons.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {persons.map(person => <PersonCard key={person.id} person={person} />)}
                </div>
              ) : (
                <div className="text-center py-16 text-dark-400">No people found for "{query}"</div>
              )
            )}
          </>
        ) : (
          <div className="text-center py-20 text-dark-400">
            Type something to search movies and people
          </div>
        )}
      </div>
    </MainLayout>
  )
}
