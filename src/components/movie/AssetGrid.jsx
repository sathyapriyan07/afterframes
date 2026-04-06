import { useState } from 'react'
import { Download } from 'lucide-react'
import { LazyImage } from '../ui/LazyImage'
import { PreviewModal } from '../ui/PreviewModal'

export function AssetGrid({ assets = [], emptyMessage = 'No assets available' }) {
  const [selected, setSelected] = useState(null)

  if (!assets.length) {
    return (
      <div className="flex items-center justify-center py-16 text-dark-400 text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-700 cursor-pointer card-hover"
            onClick={() => setSelected(asset)}
          >
            <LazyImage src={asset.image_url} alt={asset.type} className="w-full h-full" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <Download size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PreviewModal isOpen={!!selected} onClose={() => setSelected(null)} asset={selected} />
    </>
  )
}

export function WallpaperGrid({ assets = [], emptyMessage = 'No wallpapers available' }) {
  const [selected, setSelected] = useState(null)

  if (!assets.length) {
    return (
      <div className="flex items-center justify-center py-16 text-dark-400 text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group relative aspect-video rounded-xl overflow-hidden bg-dark-700 cursor-pointer card-hover"
            onClick={() => setSelected(asset)}
          >
            <LazyImage src={asset.image_url} alt={asset.type} className="w-full h-full" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <Download size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PreviewModal isOpen={!!selected} onClose={() => setSelected(null)} asset={selected} />
    </>
  )
}

export function LogoGrid({ assets = [], emptyMessage = 'No logos available' }) {
  const [selected, setSelected] = useState(null)

  if (!assets.length) {
    return (
      <div className="flex items-center justify-center py-16 text-dark-400 text-sm">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group relative aspect-video rounded-xl overflow-hidden bg-dark-800/50 border border-white/5 cursor-pointer card-hover flex items-center justify-center p-4"
            onClick={() => setSelected(asset)}
          >
            <img
              src={asset.image_url}
              alt="Logo"
              className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center rounded-xl">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <Download size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PreviewModal isOpen={!!selected} onClose={() => setSelected(null)} asset={selected} />
    </>
  )
}
