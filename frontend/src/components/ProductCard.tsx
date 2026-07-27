import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, CheckCircle, XCircle } from 'lucide-react'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  index?: number
  total?: number
  onBuyNow?: (product: Product) => void
}

export function ProductCard({ product, index, total }: ProductCardProps) {
  const inStock = product.stock > 0
  const image = product.images[0] ?? 'https://picsum.photos/seed/placeholder/800/600'
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <article className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          <img
            src={image}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!inStock && imgLoaded && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Sin stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
          {index !== undefined && total !== undefined && (
            <span className="text-gray-300 mr-1">{index}/{total}</span>
          )}
          {product.category.name}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug hover:underline block"
        >
          {product.name}
        </Link>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              ${product.price.toLocaleString('es-CO')}
            </p>
            <p className={`text-xs mt-0.5 flex items-center gap-1 ${
              inStock ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {inStock
                ? <><CheckCircle size={11} /> {product.stock} disponibles</>
                : <><XCircle size={11} /> Sin stock</>
              }
            </p>
          </div>

          <Link
            to={`/products/${product.id}`}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all
              ${!inStock
                ? 'bg-gray-100 text-gray-400 pointer-events-none'
                : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95'
              }`}
          >
            <ShoppingCart size={13} />
            Comprar
          </Link>
        </div>
      </div>
    </article>
  )
}
