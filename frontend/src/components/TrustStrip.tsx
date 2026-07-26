import { Lock, Truck, RotateCcw } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Lock,      title: 'Pagos seguros',      desc: 'Transacciones cifradas SSL' },
  { icon: Truck,     title: 'Envío gratis',        desc: 'En pedidos mayores de $150' },
  { icon: RotateCcw, title: 'Devoluciones fáciles', desc: 'Política de 30 días' },
]

export function TrustStrip() {
  return (
    <section className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon size={22} className="text-gray-500" />
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
