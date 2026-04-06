import { supabase } from '../lib/supabase'

const MOVIE_BUCKET = 'movie-assets'
const PERSON_BUCKET = 'person-assets'

export const storageService = {
  uploadMovieAsset: async (movieId, type, file) => {
    const ext = file.name.split('.').pop()
    const path = `movies/${movieId}/${type}s/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(MOVIE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const { data } = supabase.storage.from(MOVIE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  uploadPersonAsset: async (personId, file) => {
    const ext = file.name.split('.').pop()
    const path = `persons/${personId}/wallpapers/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(PERSON_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const { data } = supabase.storage.from(PERSON_BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw error
  },

  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
}
