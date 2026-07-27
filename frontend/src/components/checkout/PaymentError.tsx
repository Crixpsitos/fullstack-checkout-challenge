import { useEffect, useState } from 'react'
import { XCircle, AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TransactionStatus } from '../../services/transaction/transaction.service'

interface Props {
  status: TransactionStatus | 'CALL_FAILED'
  message?: string
  onRetry: () => void
}

const CONFIG: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
  DECLINED: {
    icon: <XCircle size={44} className="text-red-400" strokeWidth={1.5} />,
    title: 'Pago declinado',
    description: 'Tu banco no autorizó el pago. Verifica los datos de la tarjeta o intenta con otra.',
  },
  VOIDED: {
    icon: <XCircle size={44} className="text-red-400" strokeWidth={1.5} />,
    title: 'Transacción anulada',
    description: 'La transacción fue anulada. Puedes intentarlo de nuevo.',
  },
  ERROR: {
    icon: <AlertTriangle size={44} className="text-amber-400" strokeWidth={1.5} />,
    title: 'Error en el pago',
    description: 'Ocurrió un error técnico al procesar tu pago. Por favor intenta de nuevo.',
  },
  CALL_FAILED: {
    icon: <AlertTriangle size={44} className="text-amber-400" strokeWidth={1.5} />,
    title: 'Error de conexión',
    description: 'No pudimos comunicarnos con la pasarela de pago. Revisa tu conexión e intenta de nuevo.',
  },
}

export function PaymentError({ status, message, onRetry }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [])

  const cfg = CONFIG[status] ?? CONFIG.ERROR

  return (
    <div
      className="flex flex-col items-center py-12 gap-6 transition-all duration-500"
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)' }}
    >
      {/* Ícono */}
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        {cfg.icon}
      </div>

      {/* Título */}
      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-bold text-gray-900">{cfg.title}</h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          {message ?? cfg.description}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-[0.98] transition-all"
        >
          <RefreshCw size={14} /> Intentar de nuevo
        </button>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-gray-400 transition-colors py-3"
        >
          <Home size={14} /> Ir al inicio
        </Link>
      </div>
    </div>
  )
}
