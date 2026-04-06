import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, GripVertical, Film, Users, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '../../layouts/AdminLayout'
import { Modal } from '../../components/ui/Modal'
import { sectionsService } from '../../services/sections'
import { moviesService } from '../../services/movies'
import { personsService } from '../../services/persons'
import { tmdbImage } from '../../services/tmdb'

function AddItemModal({ section, isOpen, onClose }) {
  const [tab, setTab] = useState('movie')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: movies } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesService.getAll({ limit: 100 }),
    enabled: isOpen,
  })

  const { data: persons } = useQuery({
    queryKey: ['admin-persons'],
    queryFn: () => personsService.getAll({ limit: 100 }),
    enabled: isOpen,
  })

  const addMutation = useMutation({
    mutationFn: (item) => sectionsService.addItem(item),
    onSuccess: () => {
      qc.invalidateQueries(['admin-sections'])
      toast.success('Item added to section')
    },
  })

  const items = tab === 'movie'
    ? (movies?.data || []).filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    : (persons?.data || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add to "${section?.title}"`} size="md">
      <div className="p-5 space-y-4">
        <div className="flex gap-1 glass rounded-xl p-1 w-fit">
          {['movie', 'person'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${tab === t ? 'bg-accent text-white' : 'text-dark-400 hover:text-white'}`}>
              {t}s
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}s...`} className="input-field text-sm" />
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                {tab === 'movie' ? (
                  item.backdrop_path && <img src={tmdbImage(item.backdrop_path, 'w92')} alt="" className="w-full h-full object-cover" />
                ) : (
                  item.profile_path && <img src={tmdbImage(item.profile_path, 'w45')} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="flex-1 text-sm text-white truncate">{item.title || item.name}</span>
              <button
                onClick={() => addMutation.mutate({ section_id: section.id, ref_id: item.id, ref_type: tab })}
                disabled={addMutation.isPending}
                className="btn-primary text-xs"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default function AdminSectionsPage() {
  const [newTitle, setNewTitle] = useState('')
  const [addItemSection, setAddItemSection] = useState(null)
  const qc = useQueryClient()

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: sectionsService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => sectionsService.create({ title: newTitle, is_active: true, sort_order: sections.length }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-sections'])
      setNewTitle('')
      toast.success('Section created')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: sectionsService.delete,
    onSuccess: () => qc.invalidateQueries(['admin-sections']),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => sectionsService.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries(['admin-sections']),
  })

  const removeItemMutation = useMutation({
    mutationFn: sectionsService.removeItem,
    onSuccess: () => qc.invalidateQueries(['admin-sections']),
  })

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Create Section */}
        <div className="glass-dark rounded-2xl p-4">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-3">New Section</p>
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newTitle.trim() && createMutation.mutate()}
              placeholder="Section title (e.g. Trending Movies)"
              className="input-field text-sm flex-1"
            />
            <button
              onClick={() => newTitle.trim() && createMutation.mutate()}
              disabled={!newTitle.trim() || createMutation.isPending}
              className="btn-primary text-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus size={14} /> Create
            </button>
          </div>
        </div>

        {/* Sections List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map(section => (
              <div key={section.id} className="glass-dark rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-dark-500" />
                    <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                    <span className="text-xs text-dark-500">({section.section_items?.length || 0} items)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleMutation.mutate({ id: section.id, is_active: !section.is_active })}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title={section.is_active ? 'Hide section' : 'Show section'}
                    >
                      {section.is_active ? <Eye size={14} className="text-green-400" /> : <EyeOff size={14} className="text-dark-400" />}
                    </button>
                    <button
                      onClick={() => setAddItemSection(section)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Plus size={14} className="text-accent" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${section.title}"?`)) deleteMutation.mutate(section.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                {section.section_items?.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {section.section_items.map(item => (
                      <div key={item.id} className="group relative flex-shrink-0 w-16">
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-dark-700">
                          <div className="w-full h-full bg-dark-600 flex items-center justify-center">
                            {item.ref_type === 'movie' ? <Film size={12} className="text-dark-400" /> : <Users size={12} className="text-dark-400" />}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItemMutation.mutate(item.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white text-xs leading-none">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-dark-500 italic">No items. Click + to add movies or persons.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-dark-400">
            <p>No sections yet. Create one above.</p>
          </div>
        )}
      </div>

      <AddItemModal section={addItemSection} isOpen={!!addItemSection} onClose={() => setAddItemSection(null)} />
    </AdminLayout>
  )
}
