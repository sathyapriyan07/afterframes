import { supabase } from '../lib/supabase'

export const personsService = {
  getAll: async ({ page = 1, limit = 20 } = {}) => {
    const from = (page - 1) * limit
    const { data, error, count } = await supabase
      .from('persons')
      .select('*', { count: 'exact' })
      .order('name')
      .range(from, from + limit - 1)
    if (error) throw error
    return { data, count }
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('persons')
      .select(`*, person_assets(*), movie_person(*, movies(id, title, release_date, backdrop_path))`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  search: async (query) => {
    const { data, error } = await supabase
      .from('persons')
      .select('id, name, profile_path, department')
      .ilike('name', `%${query}%`)
      .limit(10)
    if (error) throw error
    return data
  },

  create: async (person) => {
    const { data, error } = await supabase.from('persons').insert(person).select().single()
    if (error) throw error
    return data
  },

  upsertByTmdbId: async (person) => {
    const { data, error } = await supabase
      .from('persons')
      .upsert(person, { onConflict: 'tmdb_id' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase.from('persons').delete().eq('id', id)
    if (error) throw error
  },
}

export const personAssetsService = {
  getByPerson: async (personId) => {
    const { data, error } = await supabase
      .from('person_assets')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  add: async (asset) => {
    const { data, error } = await supabase.from('person_assets').insert(asset).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase.from('person_assets').delete().eq('id', id)
    if (error) throw error
  },
}
