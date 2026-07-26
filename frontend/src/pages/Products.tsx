import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductSkeleton } from '../components/ProductSkeleton'
import { CategoryFilter } from '../components/CategoryFilter'
import { SearchBar } from '../components/SearchBar'
import { Pagination } from '../components/Pagination'
import { useGetProductsQuery } from '../services/product/product.service'
import { useGetCategoriesQuery } from '../services/category/category.service'
import { AlertCircle, Package } from 'lucide-react'

const LIMIT = 9

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Leer estado desde la URL
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const search = searchParams.get('q') ?? ''
  const activeCategoryId = parseInt(searchParams.get('categoryId') ?? '0', 10)

  // Actualizar un param sin perder los demás
  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  const { data: productsData, isLoading, isError, isFetching } = useGetProductsQuery({
    page,
    limit: LIMIT,
    ...(activeCategoryId && { categoryId: activeCategoryId }),
    ...(search && { q: search }),
  })

  const { data: categories = [], isLoading: loadingCategories } = useGetCategoriesQuery()

  const categoryNames = ['Todos', ...categories.map((c) => c.name)]
  const activeName =
    activeCategoryId === 0
      ? 'Todos'
      : (categories.find((c) => c.id === activeCategoryId)?.name ?? 'Todos')

  const handleCategoryChange = (name: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('page')
      if (name === 'Todos') next.delete('categoryId')
      else {
        const cat = categories.find((c) => c.name === name)
        if (cat) next.set('categoryId', String(cat.id))
      }
      return next
    })
  }

  const handleSearch = useCallback((value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('page')
      if (value) next.set('q', value)
      else next.delete('q')
      return next
    })
  }, [setSearchParams])

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const items = productsData?.items ?? []
  const total = productsData?.total ?? 0
  const totalPages = productsData?.totalPages ?? 0
  const hasFilters = search !== '' || activeCategoryId !== 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest mb-2">
          <Package size={13} />
          Catálogo
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Todos los Productos</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isLoading ? 'Cargando...' : `${total} productos disponibles`}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Búsqueda */}
          <div className="w-full sm:w-72 shrink-0">
            <SearchBar value={search} onChange={handleSearch} />
          </div>

          {/* Categorías */}
          <div className="flex-1 overflow-x-auto">
            {loadingCategories ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse shrink-0" />
                ))}
              </div>
            ) : (
              <CategoryFilter
                categories={categoryNames}
                active={activeName}
                onChange={handleCategoryChange}
              />
            )}
          </div>

          {/* Limpiar filtros */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-700 underline whitespace-nowrap transition-colors shrink-0"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 mb-8">
          <AlertCircle size={18} />
          <p className="text-sm">
            No se pudo cargar los productos. Verificá que el servidor esté corriendo.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
        {isLoading
          ? Array.from({ length: LIMIT }).map((_, i) => <ProductSkeleton key={i} />)
          : items.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={(page - 1) * LIMIT + i + 1}
                total={total}
                onBuyNow={(p) => console.log('Comprar:', p.name)}
              />
            ))}
      </div>

      {/* Sin resultados */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-600 font-medium mb-1">Sin resultados</p>
          <p className="text-gray-400 text-sm mb-6">
            No se encontraron productos con "{search || activeName}".
          </p>
          <button
            onClick={clearFilters}
            className="text-sm bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={LIMIT}
        onPageChange={(p) => setParam('page', p === 1 ? '' : String(p))}
      />
    </div>
  )
}
