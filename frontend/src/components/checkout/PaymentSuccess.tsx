import { useEffect, useState } from 'react'
import { CheckCircle, CreditCard, Package, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TransactionResult } from '../../services/transaction/transaction.service'

interface Props {
  result: TransactionResult
  amountInCents: number
  productName: string
}

export function PaymentSuccess({ result, amountInCents, productName }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [])

  const shortId = result.transactionId.slice(0, 8).toUpperCase()

  return (
    <div
      className="flex flex-col items-center py-12 gap-6 transition-all duration-500"
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)' }}
    >
      {/* Ícono */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={44} className="text-emerald-500" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
      </div>

      {/* Título */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">¡Pago aprobado!</h2>
        <p className="text-sm text-gray-400 mt-1">Tu pedido está en camino</p>
      </div>

      {/* Tarjeta de detalles */}
      <div className="w-full max-w-sm bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          <Package size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Producto</p>
            <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4">
          <CreditCard size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-400">Tarjeta</p>
            <p className="text-sm font-medium text-gray-900">
              {result.cardBrand ?? ''} •••• {result.cardLastFour ?? '----'}
            </p>
          </div>
          <span className="text-sm font-bold text-gray-900">
            ${(amountInCents / 100).toLocaleString('es-CO')}
          </span>
        </div>

        <div className="px-5 py-3">
          <p className="text-[11px] text-gray-400">
            Ref. <span className="font-mono text-gray-600">{shortId}</span>
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
        <Link
          to="/products"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-[0.98] transition-all"
        >
          Seguir comprando <ArrowRight size={15} />
        </Link>
        <Link
          to="/"
          className="flex-1 py-3 text-center border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-gray-400 transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
