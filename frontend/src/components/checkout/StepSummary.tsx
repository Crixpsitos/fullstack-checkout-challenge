import { CreditCard, Lock, MapPin } from 'lucide-react'
import type { PaymentData, DeliveryData } from '../../store/checkoutSlice'
import type { Product } from '../../types'

const COMMISSION_RATE = 0.03
const SHIPPING_COST   = 8000

interface Props {
  product: Product
  quantity: number
  payment: PaymentData
  delivery: DeliveryData
  onConfirm: () => void
  onBack: () => void
}

export function StepSummary({ product, quantity, payment, delivery, onConfirm, onBack }: Props) {
  const subtotal = product.price * quantity
  const commission = Math.ceil(subtotal * COMMISSION_RATE)
  const total = subtotal + commission + SHIPPING_COST

  return (
    <div className="flex flex-col gap-6">

      {/* Producto */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
        <img src={product.images[0]} alt={product.name}
          className="w-16 h-16 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{product.category.name}</p>
          {quantity > 1 && (
            <p className="text-xs text-gray-500 mt-0.5">× {quantity} unidades</p>
          )}
        </div>
        <p className="text-sm font-bold text-gray-900 shrink-0">
          ${subtotal.toLocaleString('es-CO')}
        </p>
      </div>

      {/* Costos */}
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal{quantity > 1 ? ` (${quantity} × $${product.price.toLocaleString('es-CO')})` : ''}</span>
          <span>${subtotal.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Comisión ({(COMMISSION_RATE * 100).toFixed(0)}%)</span>
          <span>${commission.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Envío</span>
          <span>${SHIPPING_COST.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-3">
          <span>Total</span>
          <span>${total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Pago y entrega */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
            <CreditCard size={11} /> Pago
          </p>
          <p className="text-gray-700">•••• •••• •••• {payment.number.slice(-4)}</p>
          <p className="text-gray-400 text-xs">{payment.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
            <MapPin size={11} /> Entrega
          </p>
          <p className="text-gray-700">{delivery.name}</p>
          <p className="text-gray-400 text-xs">{delivery.address}, {delivery.city}</p>
          <p className="text-gray-400 text-xs">{delivery.email}</p>
        </div>
      </div>

      {/* Seguridad */}
      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        <Lock size={11} /> Pago 100% seguro y cifrado
      </p>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-gray-400 transition-colors">
          ← Volver y editar
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-[0.98] transition-all">
          Confirmar pago · ${total.toLocaleString('es-CO')}
        </button>
      </div>
    </div>
  )
}
