import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-400">
        Mostrando <span className="font-medium text-gray-600">{from}–{to}</span> de{' '}
        <span className="font-medium text-gray-600">{total}</span> productos
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border border-gray-200
            disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
        >
          <ChevronLeft size={14} />
          Anterior
        </button>

        <div className="flex gap-1 mx-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-8 h-8 text-sm rounded-full transition-colors ${
                    p === page
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              )
            )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border border-gray-200
            disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
        >
          Siguiente
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
