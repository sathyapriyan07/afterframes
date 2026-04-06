import { supabase } from '../lib/supabase'

export const moviesService = {
  getAll: async ({ page = 1, limit = 20 } = {}) => {
    const from = (page - 1) * limit
    const { data, error, count } = await supabase
      .from('movies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    if (error) throw error
    return { data, count }
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('movies')
      .select(`*, movie_assets(*), music_links(*), movie_person(*, persons(*))`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  search: async (query) => {
    const { data, error } = await supabase
      .from('movies')
      .select('id, title, release_date, backdrop_path')
      .ilike('title', `%${query}%`)
      .limit(10)
    if (error) throw error
    return data
  },

  create: async (movie) => {
    const { data, error } = await supabase.from('movies').insert(movie).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    const { data, error } = await supabase.from('movies').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase.from('movies').delete().eq('id', id)
    if (error) throw error
  },

  upsertByTmdbId: async (movie) => {
    const { data, error } = await supabase
      .from('movies')
      .upsert(movie, { onConflict: 'tmdb_id' })
      .select()
      .single()
    if (error) throw error
    return data
  },
}

export const assetsService = {
  getByMovie: async (movieId) => {
    const { data, error } = await supabase
      .from('movie_assets')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  add: async (asset) => {
    const { data, error } = await supabase.from('movie_assets').insert(asset).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase.from('movie_assets').delete().eq('id', id)
    if (error) throw error
  },
}

export const musicService = {
  getByMovie: async (movieId) => {
    const { data, error } = await supabase
      .from('music_links')
      .select('*')
      .eq('movie_id', movieId)
    if (error) throw error
    return data
  },

  upsert: async (links) => {
    const { data, error } = await supabase.from('music_links').upsert(links).select()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase.from('music_links').delete().eq('id', id)
    if (error) throw error
  },
}
