import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { closeCheckout, nextStep, prevStep } from '../../store/checkoutSlice'
import { useGetProductByIdQuery } from '../../services/product/product.service'
import { StepPayment, type PaymentFormValues } from './StepPayment'
import { StepDelivery, type DeliveryFormValues } from './StepDelivery'
import { StepSummary } from './StepSummary'

const STEP_LABELS = ['Pago', 'Entrega', 'Resumen']

export function CheckoutModal() {
  const dispatch = useDispatch()
  const { isOpen, step, productId } = useSelector((s: RootState) => s.checkout)

  const [paymentData, setPaymentData] = useState<PaymentFormValues | null>(null)
  const [deliveryData, setDeliveryData] = useState<DeliveryFormValues | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)

  const { data: product } = useGetProductByIdQuery(productId ?? '', {
    skip: !productId,
  })

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) dispatch(closeCheckout())
  }

  const handlePaymentNext = (data: PaymentFormValues) => {
    setPaymentData(data)
    dispatch(nextStep())
  }

  const handleDeliveryNext = (data: DeliveryFormValues) => {
    setDeliveryData(data)
    dispatch(nextStep())
  }

  const handleConfirm = () => {
    console.log('Pedido confirmado:', { productId, paymentData, deliveryData })
    dispatch(closeCheckout())
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[95dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Pago y Entrega</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paso {step} de 3</p>
          </div>
          <button
            onClick={() => dispatch(closeCheckout())}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex px-5 pt-4 gap-2 shrink-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`h-1 rounded-full mb-1.5 transition-colors ${
                  i + 1 <= step ? 'bg-gray-900' : 'bg-gray-100'
                }`}
              />
              <span className={`text-[10px] font-medium ${i + 1 === step ? 'text-gray-900' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Contenido — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {step === 1 && <StepPayment onNext={handlePaymentNext} />}

          {step === 2 && (
            <StepDelivery
              onNext={handleDeliveryNext}
              onBack={() => dispatch(prevStep())}
            />
          )}

          {step === 3 && product && paymentData && deliveryData && (
            <StepSummary
              product={product}
              payment={paymentData}
              delivery={deliveryData}
              onConfirm={handleConfirm}
              onBack={() => dispatch(prevStep())}
            />
          )}
        </div>
      </div>
    </div>
  )
}
