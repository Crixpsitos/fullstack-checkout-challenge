import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { initCheckout, resetCheckout, prevStep } from '../store/checkoutSlice'
import type { RootState } from '../store'
import { useGetProductByIdQuery } from '../services/product/product.service'
import { StepPayment } from '../components/checkout/StepPayment'
import { StepSummary } from '../components/checkout/StepSummary'

/* Paso 1 = Pago y Entrega (combinado), Paso 2 = Resumen (backdrop) */
const STEPS = ['Pago y Entrega', 'Resumen']

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { step, productId, paymentData, deliveryData } = useSelector((s: RootState) => s.checkout)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (id) dispatch(initCheckout(id))
    return () => { dispatch(resetCheckout()) }
  }, [id, dispatch])

  const { data: product, isLoading } = useGetProductByIdQuery(productId ?? '', { skip: !productId })

  if (isLoading) return (
    <div className="max-w-[960px] mx-auto px-4 py-20 animate-pulse space-y-4">
      <div className="h-6 bg-gray-100 rounded w-1/3" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>
  )

  if (!product) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-gray-400 mb-4">Producto no encontrado.</p>
      <Link to="/products" className="text-sm underline text-gray-600">Volver al catálogo</Link>
    </div>
  )

  if (confirmed) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle size={52} className="mx-auto text-emerald-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h2>
      <p className="text-gray-400 text-sm mb-8">Recibirás un correo con los detalles de tu pedido.</p>
      <Link to="/" className="inline-block bg-gray-900 text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-gray-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[960px] mx-auto px-4 py-10">
        <button onClick={() => step === 1 ? navigate(-1) : dispatch(prevStep())}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={16} />
          {step === 1 ? 'Volver al producto' : 'Volver'}
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Header + stepper — ancho completo sobre ambas columnas */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-400 mt-0.5">Paso {Math.min(step, 2)} de 2</p>
          </div>

          <div className="flex gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 text-center">
                <div className={`h-1 rounded-full mb-1.5 transition-colors ${i + 1 <= step ? 'bg-gray-900' : 'bg-gray-100'}`} />
                <span className={`text-[10px] font-medium ${i + 1 === Math.min(step, 2) ? 'text-gray-900' : 'text-gray-300'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Formulario combinado — solo visible en paso 1 */}
          {step === 1 && (
            <StepPayment
              onNext={() => {/* dispatch ya fue llamado dentro del componente */}}
            />
          )}

          {/* Resumen — reemplaza el formulario en paso 2 */}
          {step === 2 && paymentData && deliveryData && (
            <StepSummary
              product={product}
              payment={paymentData}
              delivery={deliveryData}
              onConfirm={() => {
                console.log('Pago confirmado', { productId, paymentData, deliveryData })
                setConfirmed(true)
                dispatch(resetCheckout())
              }}
              onBack={() => dispatch(prevStep())}
            />
          )}
        </div>
      </div>

    </div>
  )
}
