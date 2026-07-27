import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft } from 'lucide-react'
import { initCheckout, resetCheckout, prevStep } from '../store/checkoutSlice'
import type { RootState } from '../store'
import { useGetProductByIdQuery } from '../services/product/product.service'
import { useCreateTransactionMutation } from '../services/transaction/transaction.service'
import { productsApi } from '../services/product/product.service'
import type { TransactionResult, TransactionStatus } from '../services/transaction/transaction.service'
import { StepPayment } from '../components/checkout/StepPayment'
import { StepSummary } from '../components/checkout/StepSummary'
import { PaymentProcessing } from '../components/checkout/PaymentProcessing'
import { PaymentSuccess } from '../components/checkout/PaymentSuccess'
import { PaymentError } from '../components/checkout/PaymentError'

const COMMISSION_RATE = 0.03
const SHIPPING_COST = 8000
const STEPS = ['Pago y Entrega', 'Resumen']

type PageState = 'checkout' | 'processing' | 'success' | 'error'

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const checkout = useSelector((s: RootState) => s.checkout)
  const { step, productId, quantity, paymentData, deliveryData } = checkout

  const [pageState, setPageState] = useState<PageState>('checkout')
  const [txResult, setTxResult] = useState<TransactionResult | null>(null)
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [errorStatus, setErrorStatus] = useState<TransactionStatus | 'CALL_FAILED'>('ERROR')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const idempotencyKey = useRef<string>(crypto.randomUUID())

  const [createTransaction] = useCreateTransactionMutation()

  useEffect(() => {
    if (id) dispatch(initCheckout({ productId: id, quantity: checkout.quantity }))
    return () => { dispatch(resetCheckout()) }
  }, [id, dispatch])

  const { data: product, isLoading } = useGetProductByIdQuery(productId ?? '', { skip: !productId })

  const handleConfirm = async () => {
    if (!product || !checkout.customerId || !checkout.acceptanceToken || !checkout.cardToken || !deliveryData) return

    const commission = Math.ceil(product.price * quantity * COMMISSION_RATE)
    const amountInCents = (product.price * quantity + commission + SHIPPING_COST) * 100

    setPageState('processing')

    try {
      const result = await createTransaction({
        idempotencyKey: idempotencyKey.current,
        reference: `REF-${idempotencyKey.current.slice(0, 8)}`,
        amountInCents,
        productId: product.id,
        quantity,
        customerId: checkout.customerId,
        cardToken: checkout.cardToken.token,
        acceptanceToken: checkout.acceptanceToken,
        customerEmail: deliveryData.email,
        customerName: deliveryData.name,
        delivery: {
          address: deliveryData.address,
          city: deliveryData.city,
          country: deliveryData.country,
        },
      }).unwrap()

      setTxResult(result)

      if (result.status === 'APPROVED') {
        setPaidAmount(amountInCents)
        dispatch(productsApi.util.invalidateTags(['Product']))
        setPageState('success')
        dispatch(resetCheckout())
      } else {
        setErrorStatus(result.status)
        setErrorMessage(undefined)
        setPageState('error')
      }
    } catch {
      setErrorStatus('CALL_FAILED')
      setErrorMessage(undefined)
      setPageState('error')
    }
  }

  const handleRetry = () => {
    idempotencyKey.current = crypto.randomUUID()
    setPageState('checkout')
    setTxResult(null)
  }

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

  const commission = Math.ceil(product.price * quantity * COMMISSION_RATE)
  const totalPesos = product.price * quantity + commission + SHIPPING_COST
  void totalPesos

  const showStepper = pageState === 'checkout'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[960px] mx-auto px-4 py-10">

        {showStepper && (
          <button
            onClick={() => step === 1 ? navigate(-1) : dispatch(prevStep())}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            {step === 1 ? 'Volver al producto' : 'Volver'}
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">

          {showStepper && (
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-400 mt-0.5">Paso {Math.min(step, 2)} de 2</p>
              <div className="flex gap-2 mt-4">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex-1 text-center">
                    <div className={`h-1 rounded-full mb-1.5 transition-colors ${i + 1 <= step ? 'bg-gray-900' : 'bg-gray-100'}`} />
                    <span className={`text-[10px] font-medium ${i + 1 === Math.min(step, 2) ? 'text-gray-900' : 'text-gray-300'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={pageState === 'checkout' && step === 1 ? '' : 'hidden'}>
            <StepPayment onNext={() => {}} />
          </div>

          {pageState === 'checkout' && step === 2 && paymentData && deliveryData && (
            <StepSummary
              product={product}
              quantity={quantity}
              payment={paymentData}
              delivery={deliveryData}
              onConfirm={handleConfirm}
              onBack={() => dispatch(prevStep())}
            />
          )}

          {pageState === 'processing' && <PaymentProcessing />}

          {pageState === 'success' && txResult && (
            <PaymentSuccess
              result={txResult}
              amountInCents={paidAmount}
              productName={product.name}
            />
          )}

          {pageState === 'error' && (
            <PaymentError
              status={errorStatus}
              message={errorMessage}
              onRetry={handleRetry}
            />
          )}

        </div>
      </div>
    </div>
  )
}
