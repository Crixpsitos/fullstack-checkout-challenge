import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Lock,
  ShoppingCart,
  Package,
  XCircle,
} from 'lucide-react'
import { useGetProductByIdQuery } from '../services/product/product.service'
import { ProductImageGallery } from '../components/ProductImageGallery'
import { ProductSkeleton } from '../components/ProductSkeleton'

const FEATURES = [
  'Diseño minimalista de alta calidad',
  'Materiales premium seleccionados',
  'Garantía de satisfacción incluida',
]

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
      <div className="aspect-square bg-gray-100 rounded-2xl" />
      <div className="space-y-5 pt-2">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-8 bg-gray-100 rounded w-3/4" />
        <div className="h-6 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-12 bg-gray-100 rounded-full w-full mt-6" />
      </div>
    </div>
  )
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading, isError } = useGetProductByIdQuery(id ?? '')

  const inStock = (product?.stock ?? 0) > 0

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DetailSkeleton />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Package size={48} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Producto no encontrado</h2>
        <p className="text-gray-400 text-sm mb-6">
          El producto que buscás no existe o fue eliminado.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-6 py-2.5 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-700 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-700 transition-colors">Productos</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería */}
        <ProductImageGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Categoría */}
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
              <Package size={11} />
              {product.category.name}
            </span>
          </div>

          {/* Nombre */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Precio + stock */}
          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold text-gray-900">
              ${product.price.toLocaleString('es-CO')}
            </p>
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
              inStock
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-500'
            }`}>
              {inStock
                ? <><CheckCircle size={13} /> {product.stock} disponibles</>
                : <><XCircle size={13} /> Sin stock</>
              }
            </span>
          </div>

          {/* Descripción */}
          <p className="text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-6">
            {product.description}
          </p>

          {/* Features */}
          <ul className="space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* Botón comprar */}
          <div className="pt-2">
            <button
              disabled={!inStock}
              onClick={() => id && navigate(`/checkout/${id}`)}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-full transition-all
                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98]"
            >
              <ShoppingCart size={16} />
              {inStock ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          </div>

          {/* Trust — pago seguro */}
          <div className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="bg-gray-50 p-2 rounded-lg">
                <CreditCard size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Pagar con tarjeta</p>
                <p className="text-xs text-gray-400">Débito o crédito</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-1">
              <div className="bg-gray-50 p-2 rounded-lg">
                <Lock size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Pago 100% seguro</p>
                <p className="text-xs text-gray-400">Transacción cifrada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
