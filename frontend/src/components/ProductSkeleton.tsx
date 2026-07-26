export function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-100 rounded w-1/4" />
          <div className="h-8 bg-gray-100 rounded-full w-24" />
        </div>
      </div>
    </div>
  )
}
