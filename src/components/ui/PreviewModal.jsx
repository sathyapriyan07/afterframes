import { Download, ExternalLink } from 'lucide-react'
import { Modal } from './Modal'

export function PreviewModal({ isOpen, onClose, asset }) {
  if (!asset) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(asset.image_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${asset.type || 'image'}-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(asset.image_url, '_blank')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-4">
        <img
          src={asset.image_url}
          alt="Preview"
          className="w-full max-h-[70vh] object-contain rounded-xl"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-dark-300 text-sm capitalize">{asset.type || 'Image'}</span>
          <div className="flex gap-2">
            <a
              href={asset.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <ExternalLink size={15} /> Open
            </a>
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2 text-sm">
              <Download size={15} /> Download
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
