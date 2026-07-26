import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Buscar productos...' }: SearchBarProps) {
  const [local, setLocal] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Guardar onChange en ref para no incluirlo en las deps del debounce
  // Evita que un cambio de referencia en onChange dispare la búsqueda
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // Debounce — solo reacciona a cambios del input del usuario (local)
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChangeRef.current(local), 400)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [local]) // ← solo local, no onChange

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:border-gray-400 transition-colors"
      />
      {local && (
        <button
          onClick={() => { setLocal(''); onChangeRef.current('') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
