import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Trash2, Edit, Upload, ExternalLink, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '../../layouts/AdminLayout'
import { Modal } from '../../components/ui/Modal'
import { personsService, personAssetsService } from '../../services/persons'
import { storageService } from '../../services/storage'
import { tmdbService, tmdbImage } from '../../services/tmdb'
import { LazyImage } from '../../components/ui/LazyImage'

function PersonAssetsModal({ person, isOpen, onClose }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)
  const qc = useQueryClient()

  const { data: assets = [] } = useQuery({
    queryKey: ['person-assets', person?.id],
    queryFn: () => personAssetsService.getByPerson(person.id),
    enabled: !!person?.id && isOpen,
  })

  const deleteMutation = useMutation({
    mutationFn: personAssetsService.delete,
    onSuccess: () => qc.invalidateQueries(['person-assets', person?.id]),
  })

  const handleUpload = async (files) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const url = await storageService.uploadPersonAsset(person.id, file)
        await personAssetsService.add({ person_id: person.id, image_url: url })
      }
      qc.invalidateQueries(['person-assets', person.id])
      toast.success('Wallpapers uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (!person) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${person.name} — Wallpapers`} size="lg">
      <div className="p-5 space-y-4">
        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center hover:border-accent/40 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-dark-400">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            <>
              <Upload size={18} className="mx-auto mb-2 text-dark-400" />
              <p className="text-sm text-dark-400">Drop wallpapers here or click to upload</p>
            </>
          )}
        </div>

        {assets.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {assets.map(asset => (
              <div key={asset.id} className="group relative aspect-video rounded-xl overflow-hidden bg-dark-700">
                <LazyImage src={asset.image_url} alt="Wallpaper" className="w-full h-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <button
                    onClick={() => deleteMutation.mutate(asset.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-all"
                  >
                    <Trash2 size={13} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

function ImportPersonModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [importing, setImporting] = useState(null)
  const qc = useQueryClient()

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const data = await tmdbService.searchPersons(query)
      setResults(data || [])
    } catch {
      toast.error('TMDB search failed')
    } finally {
      setSearching(false)
    }
  }

  const importPerson = async (p) => {
    setImporting(p.id)
    try {
      await personsService.upsertByTmdbId({
        tmdb_id: p.id,
        name: p.name,
        profile_path: p.profile_path,
        department: p.known_for_department || 'Acting',
      })
      qc.invalidateQueries(['admin-persons'])
      toast.success(`${p.name} imported`)
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setImporting(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Person from TMDB" size="md">
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search person..." className="input-field" />
          <button onClick={search} disabled={searching} className="btn-primary flex-shrink-0">
            <Search size={15} />
          </button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {results.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-700 flex-shrink-0">
                <LazyImage src={p.profile_path ? tmdbImage(p.profile_path, 'w45') : null} alt={p.name} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{p.name}</p>
                <p className="text-xs text-dark-400">{p.known_for_department}</p>
              </div>
              <button onClick={() => importPerson(p)} disabled={importing === p.id} className="btn-primary text-xs flex items-center gap-1">
                {importing === p.id ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={12} />}
                Import
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default function AdminPersonsPage() {
  const [search, setSearch] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-persons'],
    queryFn: () => personsService.getAll({ limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: personsService.delete,
    onSuccess: () => {
      qc.invalidateQueries(['admin-persons'])
      toast.success('Person deleted')
    },
  })

  const persons = (data?.data || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter persons..." className="input-field text-sm max-w-xs" />
          <button onClick={() => setImportOpen(true)} className="btn-primary text-sm flex items-center gap-2">
            <Download size={14} /> Import Person
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer aspect-square rounded-xl" />)}
          </div>
        ) : persons.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {persons.map(person => (
              <div key={person.id} className="glass-dark rounded-xl p-3 text-center group">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-700 mx-auto mb-2">
                  <LazyImage src={person.profile_path ? tmdbImage(person.profile_path, 'w185') : null} alt={person.name} className="w-full h-full" />
                </div>
                <p className="text-xs font-medium text-white truncate">{person.name}</p>
                <p className="text-xs text-dark-500 capitalize mb-3">{person.department?.toLowerCase()}</p>
                <div className="flex justify-center gap-1">
                  <button onClick={() => setSelectedPerson(person)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Manage wallpapers">
                    <Upload size={13} className="text-dark-300" />
                  </button>
                  <a href={`/person/${person.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <ExternalLink size={13} className="text-dark-300" />
                  </a>
                  <button onClick={() => { if (confirm(`Delete ${person.name}?`)) deleteMutation.mutate(person.id) }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-dark-400">No persons found</div>
        )}
      </div>

      <PersonAssetsModal person={selectedPerson} isOpen={!!selectedPerson} onClose={() => setSelectedPerson(null)} />
      <ImportPersonModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </AdminLayout>
  )
}
