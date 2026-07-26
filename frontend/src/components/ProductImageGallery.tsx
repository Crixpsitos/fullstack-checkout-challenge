import { useState } from 'react'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0)
  const list = images.length > 0 ? images : ['https://picsum.photos/seed/placeholder/800/800']

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen principal */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
        <img
          key={active}
          src={list[active]}
          alt={`${name} — imagen ${active + 1}`}
          className="w-full h-full object-cover animate-[fadeIn_0.2s_ease]"
        />
        {/* Contador */}
        <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {active + 1}/{list.length}
        </span>
      </div>

      {/* Miniaturas */}
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                i === active ? 'border-gray-900' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={src} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
