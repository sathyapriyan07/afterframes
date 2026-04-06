import axios from 'axios'

const tmdb = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: { api_key: import.meta.env.VITE_TMDB_API_KEY },
})

export const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p'
export const tmdbImage = (path, size = 'w500') => path ? `${IMAGE_BASE}/${size}${path}` : null

export const tmdbService = {
  searchMovies: (query) => tmdb.get('/search/movie', { params: { query } }).then(r => r.data.results),
  searchPersons: (query) => tmdb.get('/search/person', { params: { query } }).then(r => r.data.results),

  getMovie: (id) => tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'credits,images,videos' }
  }).then(r => r.data),

  getPerson: (id) => tmdb.get(`/person/${id}`, {
    params: { append_to_response: 'movie_credits,images' }
  }).then(r => r.data),

  getMovieImages: (id) => tmdb.get(`/movie/${id}/images`).then(r => r.data),
  getPersonImages: (id) => tmdb.get(`/person/${id}/images`).then(r => r.data),

  getTrending: (type = 'movie', window = 'week') =>
    tmdb.get(`/trending/${type}/${window}`).then(r => r.data.results),

  getPopular: (type = 'movie') =>
    tmdb.get(`/${type}/popular`).then(r => r.data.results),
}

export default tmdbService
