import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, Trash2, Plus, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '../../layouts/AdminLayout'
import { moviesService, assetsService, musicService } from '../../services/movies'
import { storageService } from '../../services/storage'
import { tmdbImage } from '../../services/tmdb'
import { LazyImage } from '../../components/ui/LazyImage'

const ASSET_TYPES = ['poster', 'wallpaper', 'logo']
const PLATFORMS = ['spotify', 'apple', 'youtube_music', 'youtube', 'jiosaavn']
const MUSIC_TYPES = ['OST', 'BGM']

function AssetUploader({ movieId, type, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = async (files) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const url = await storageService.uploadMovieAsset(movieId, type, file)
        await assetsService.add({ movie_id: movieId, type, image_url: url })
      }
      onUploaded()
      toast.success(`${files.length} ${type}(s) uploaded`)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-accent/40 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {uploading ? (
        <div className="flex items-center justify-center gap-2 text-dark-400">
          <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          Uploading...
        </div>
      ) : (
        <>
          <Upload size={20} className="mx-auto mb-2 text-dark-400" />
          <p className="text-sm text-dark-400">Drop {type}s here or click to upload</p>
          <p className="text-xs text-dark-500 mt-1">PNG, JPG, WebP supported</p>
        </>
      )}
    </div>
  )
}

function MusicLinksEditor({ movieId }) {
  const qc = useQueryClient()
  const { data: links = [] } = useQuery({
    queryKey: ['music-links', movieId],
    queryFn: () => musicService.getByMovie(movieId),
  })

  const [newLink, setNewLink] = useState({ platform: 'spotify', type: 'OST', url: '' })

  const addMutation = useMutation({
    mutationFn: () => musicService.upsert([{ movie_id: movieId, ...newLink }]),
    onSuccess: () => {
      qc.invalidateQueries(['music-links', movieId])
      setNewLink({ platform: 'spotify', type: 'OST', url: '' })
      toast.success('Music link added')
    },
    onError: () => toast.error('Failed to add link'),
  })

  const deleteMutation = useMutation({
    mutationFn: musicService.delete,
    onSuccess: () => qc.invalidateQueries(['music-links', movieId]),
  })

  return (
    <div className="space-y-4">
      {/* Existing Links */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map(link => (
            <div key={link.id} className="flex items-center gap-3 glass-dark rounded-xl p-3">
              <span className="text-xs font-medium text-accent uppercase w-16">{link.type}</span>
              <span className="text-xs text-dark-400 capitalize w-24">{link.platform.replace('_', ' ')}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-dark-300 truncate hover:text-white">
                {link.url}
              </a>
              <button onClick={() => deleteMutation.mutate(link.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New */}
      <div className="glass-dark rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">Add Music Link</p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newLink.platform}
            onChange={e => setNewLink(p => ({ ...p, platform: e.target.value }))}
            className="input-field text-sm"
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
          </select>
          <select
            value={newLink.type}
            onChange={e => setNewLink(p => ({ ...p, type: e.target.value }))}
            className="input-field text-sm"
          >
            {MUSIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            value={newLink.url}
            onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
            placeholder="https://..."
            className="input-field text-sm flex-1"
          />
          <button
            onClick={() => newLink.url && addMutation.mutate()}
            disabled={!newLink.url || addMutation.isPending}
            className="btn-primary text-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminMovieDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('poster')
  const qc = useQueryClient()

  const { data: movie } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesService.getById(id),
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['movie-assets', id],
    queryFn: () => assetsService.getByMovie(id),
  })

  const deleteMutation = useMutation({
    mutationFn: assetsService.delete,
    onSuccess: () => {
      qc.invalidateQueries(['movie-assets', id])
      toast.success('Asset deleted')
    },
  })

  const tabAssets = assets.filter(a => a.type === activeTab)

  if (!movie) return <AdminLayout><div className="shimmer h-32 rounded-xl" /></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin/movies" className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="text-dark-300" />
          </Link>
          <div className="flex items-center gap-3">
            {movie.backdrop_path && (
              <img src={tmdbImage(movie.backdrop_path, 'w92')} alt="" className="w-12 h-8 object-cover rounded-lg" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">{movie.title}</h2>
              <p className="text-xs text-dark-400">{movie.release_date?.slice(0, 4)}</p>
            </div>
          </div>
        </div>

        {/* Asset Tabs */}
        <div className="glass-dark rounded-2xl p-5 space-y-4">
          <div className="flex gap-1 glass rounded-xl p-1 w-fit">
            {ASSET_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                  activeTab === type ? 'bg-accent text-white' : 'text-dark-400 hover:text-white'
                }`}
              >
                {type}s ({assets.filter(a => a.type === type).length})
              </button>
            ))}
          </div>

          <AssetUploader
            movieId={id}
            type={activeTab}
            onUploaded={() => qc.invalidateQueries(['movie-assets', id])}
          />

          {tabAssets.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {tabAssets.map(asset => (
                <div key={asset.id} className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-700">
                  <LazyImage src={asset.image_url} alt={asset.type} className="w-full h-full" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <button
                      onClick={() => deleteMutation.mutate(asset.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-all"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Music Links */}
        <div className="glass-dark rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Music Links</h3>
          <MusicLinksEditor movieId={id} />
        </div>
      </div>
    </AdminLayout>
  )
}
