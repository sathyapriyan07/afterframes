import { supabase } from '../lib/supabase'

export const sectionsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('sections')
      .select(`*, section_items(*)`)
      .order('sort_order')
    if (error) throw error
    return data
  },

  getWithItems: async () => {
    const { data: sections, error } = await supabase
      .from('sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error

    const enriched = await Promise.all(
      sections.map(async (section) => {
        const { data: items } = await supabase
          .from('section_items')
          .select('*')
          .eq('section_id', section.id)
          .order('sort_order')

        const refs = await Promise.all(
          (items || []).map(async (item) => {
            const table = item.ref_type === 'movie' ? 'movies' : 'persons'
            const { data } = await supabase
              .from(table)
              .select('*')
              .eq('id', item.ref_id)
              .single()
            return data ? { ...data, ref_type: item.ref_type } : null
          })
        )
        return { ...section, items: refs.filter(Boolean) }
      })
    )
    return enriched
  },

  create: async (section) => {
    const { data, error } = await supabase.from('sections').insert(section).select().single()
    if (error) throw error
    return data
  },

  update: async (id, updates) => {
    const { data, error } = await supabase.from('sections').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase.from('sections').delete().eq('id', id)
    if (error) throw error
  },

  addItem: async (item) => {
    const { data, error } = await supabase.from('section_items').insert(item).select().single()
    if (error) throw error
    return data
  },

  removeItem: async (id) => {
    const { error } = await supabase.from('section_items').delete().eq('id', id)
    if (error) throw error
  },
}
