import { ProductCard } from '../components/ProductCard'
import { ProductSkeleton } from '../components/ProductSkeleton'
import { HeroSection } from '../components/HeroSection'
import { TrustStrip } from '../components/TrustStrip'
import { useGetProductsQuery } from '../services/product/product.service'
import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const PREVIEW_LIMIT = 6

export function HomePage() {
  const { data: productsData, isLoading, isError } = useGetProductsQuery({
    page: 1,
    limit: PREVIEW_LIMIT,
  })

  const items = productsData?.items ?? []

  return (
    <>
      <HeroSection />

      <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nuestros Productos</h2>
            <p className="text-sm text-gray-400 mt-1">
              {isLoading ? 'Cargando...' : `${productsData?.total ?? 0} productos disponibles`}
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Ver todos
            <ArrowRight size={15} />
          </Link>
        </div>

        {isError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 mb-8">
            <AlertCircle size={18} />
            <p className="text-sm">No se pudo cargar los productos. Verificá que el servidor esté corriendo.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: PREVIEW_LIMIT }).map((_, i) => <ProductSkeleton key={i} />)
            : items.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i + 1}
                  total={items.length}
                  onBuyNow={(p) => console.log('Comprar:', p.name)}
                />
              ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 border border-gray-200 text-sm text-gray-600 px-6 py-2.5 rounded-full hover:border-gray-400 transition-colors"
          >
            Ver todos los productos
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <TrustStrip />
    </>
  )
}