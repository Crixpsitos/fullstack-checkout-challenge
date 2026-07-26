interface CategoryFilterProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-colors
            ${active === cat
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
