import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

const FACTS = [
  'Tu pago viaja cifrado a través de miles de kilómetros de fibra óptica.',
  'Los pagos en línea pasan por hasta 7 capas de seguridad antes de aprobarse.',
  'Cada transacción genera una firma única que la hace imposible de duplicar.',
  'El e-commerce global mueve más de $6 billones de dólares al año.',
  'Más del 70% de las compras en línea se hacen desde el celular.',
  'Tu información de tarjeta nunca toca nuestros servidores directamente.',
  'El estándar PCI DSS protege más de 100 millones de transacciones al día.',
  'Los datos de tu pago se tokenizaron antes de salir de tu dispositivo.',
  'Colombia tiene uno de los ecosistemas de pagos digitales más robustos de Latam.',
]

const DOTS_INTERVAL = 500
const FACT_INTERVAL = 3500

export function PaymentProcessing() {
  const [factIdx, setFactIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, DOTS_INTERVAL)
    return () => clearInterval(dotsTimer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setFactIdx(i => (i + 1) % FACTS.length)
        setVisible(true)
      }, 300)
    }, FACT_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">

      {/* Anillo animado */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-gray-900 border-r-gray-900 border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-transparent border-b-gray-300 border-l-gray-300 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck size={28} className="text-gray-900" />
        </div>
      </div>

      {/* Texto principal */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Procesando tu pago{dots}
        </h2>
        <p className="text-sm text-gray-400 mt-1">No cierres esta ventana</p>
      </div>

      {/* Fact rotativo */}
      <div
        className="max-w-sm bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-center transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <p className="text-xs text-gray-500 leading-relaxed">
          💡 {FACTS[factIdx]}
        </p>
      </div>

      {/* Barra de progreso indeterminada */}
      <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gray-900 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}
