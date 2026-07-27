import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HeroSection() {
  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-4">
          Nueva Colección
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Menos es <em className="not-italic font-light">más</em>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Productos seleccionados para quienes aprecian la calidad, la simplicidad y el diseño duradero.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-gray-700 transition-colors"
        >
          Ver productos
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
