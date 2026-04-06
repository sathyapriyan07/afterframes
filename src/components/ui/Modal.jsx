import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, children, title, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl', full: 'max-w-[95vw]' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className={`relative glass-dark rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={18} className="text-dark-300" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
