import { useState } from 'react'
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/es/styles-compiled.css'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch } from '../../store/hooks'
import { cardTokenized, setPaymentData, setDeliveryData, nextStep } from '../../store/checkoutSlice'
import { useTokenizeCardMutation } from '../../services/gateway/tokenizationCard.service'
import type { PaymentData, DeliveryData } from '../../store/checkoutSlice'
import { CreditCard, Calendar, Lock, User, MapPin, Mail, Phone, Home, Building2 } from 'lucide-react'

type Focused = 'number' | 'expiry' | 'cvc' | 'name' | ''

const schema = z.object({
  number:   z.string().regex(/^\d{16}$/, 'Número inválido (16 dígitos)'),
  expiry:   z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/AA'),
  cvc:      z.string().regex(/^\d{3,4}$/, 'CVC inválido'),
  name:     z.string().min(3, 'Mínimo 3 caracteres'),
  fullName: z.string().min(3, 'Mínimo 3 caracteres'),
  email:    z.string().email('Email inválido'),
  phone:    z.string().min(7, 'Teléfono inválido'),
  address:  z.string().min(5, 'Dirección muy corta'),
  city:     z.string().min(2, 'Ciudad requerida'),
  terms:    z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
})

type FormValues = z.infer<typeof schema>
export type PaymentFormValues = PaymentData

const FIELD_BASE = 'w-full min-w-0 py-2.5 pr-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all placeholder:text-gray-300'
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wide'

function Field({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <div className="[&>input]:pl-9">{children}</div>
    </div>
  )
}

interface Props {
  defaultValues?: Partial<FormValues>
  onNext: (p: PaymentData, d: DeliveryData) => void
}

export function StepPayment({ defaultValues, onNext }: Props) {
  const dispatch = useAppDispatch()
  const [focused, setFocused] = useState<Focused>('')
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenizeCard, { isLoading }] = useTokenizeCardMutation()

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })

  const values = watch()
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => setFocused(e.target.name as Focused)

  const onSubmit = async (data: FormValues) => {
    setTokenError(null)
    const [expMonth, expYear] = data.expiry.split('/')
    try {
      const res = await tokenizeCard({
        number: data.number, expMonth: expMonth ?? '',
        expYear: expYear ?? '', cvc: data.cvc, cardHolder: data.name,
      }).unwrap()
      dispatch(cardTokenized({ token: res.data.id, lastFour: res.data.last_four, brand: res.data.brand }))
      const paymentData: PaymentData = { number: data.number, expiry: data.expiry, cvc: data.cvc, name: data.name }
      const deliveryData: DeliveryData = { name: data.fullName, email: data.email, phone: data.phone, address: data.address, city: data.city, terms: true }
      dispatch(setPaymentData(paymentData))
      dispatch(setDeliveryData(deliveryData))
      dispatch(nextStep())
      onNext(paymentData, deliveryData)
    } catch {
      setTokenError('No se pudo validar la tarjeta. Verifica los datos e intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* ── Columna izquierda: tarjeta visual ── */}
        <div className="flex flex-col gap-5 min-w-0">
          <p className={`${LABEL} flex items-center gap-2`}><CreditCard size={12} /> Datos de la tarjeta</p>

          {/* Preview con fondo oscuro */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl px-6 py-8 flex justify-center shadow-xl">
            <Cards
              number={values.number ?? ''} expiry={values.expiry ?? ''}
              cvc={values.cvc ?? ''} name={values.name ?? ''} focused={focused}
            />
          </div>

          <div className="flex flex-col gap-3">
            {/* Número */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>Número</label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('number')} name="number" maxLength={16} placeholder="•••• •••• •••• ••••"
                  onFocus={onFocus} className={`${FIELD_BASE} pl-9`} />
              </div>
              {errors.number && <p className="text-[11px] text-red-500">{errors.number.message}</p>}
            </div>

            {/* Vencimiento + CVC */}
            <div className="grid grid-cols-2 gap-3 min-w-0">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className={LABEL}>Vencimiento</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input {...register('expiry')} name="expiry" placeholder="MM/AA" maxLength={5}
                    onFocus={onFocus} className={`${FIELD_BASE} pl-9`} />
                </div>
                {errors.expiry && <p className="text-[11px] text-red-500">{errors.expiry.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className={LABEL}>CVC</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input {...register('cvc')} name="cvc" type="password" maxLength={4} placeholder="•••"
                    onFocus={onFocus} className={`${FIELD_BASE} pl-9`} />
                </div>
                {errors.cvc && <p className="text-[11px] text-red-500">{errors.cvc.message}</p>}
              </div>
            </div>

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>Nombre en la tarjeta</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('name')} name="name" placeholder="JUAN PÉREZ"
                  onFocus={onFocus} className={`${FIELD_BASE} pl-9`} />
              </div>
              {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Columna derecha: datos de entrega + botón ── */}
        <div className="flex flex-col gap-4 min-w-0">
          <p className={`${LABEL} flex items-center gap-2`}><MapPin size={12} /> Datos de entrega</p>

          {[
            { field: 'fullName' as const, icon: User,      label: 'Nombre completo',    placeholder: 'Juan Pérez',        type: 'text' },
            { field: 'email'    as const, icon: Mail,      label: 'Correo electrónico', placeholder: 'juan@email.com',   type: 'email' },
            { field: 'phone'    as const, icon: Phone,     label: 'Teléfono',           placeholder: '300 123 4567',     type: 'tel' },
            { field: 'address'  as const, icon: Home,      label: 'Dirección',          placeholder: 'Calle 123 # 45-67', type: 'text' },
            { field: 'city'     as const, icon: Building2, label: 'Ciudad',             placeholder: 'Bogotá',           type: 'text' },
          ].map(({ field, icon: Icon, label, placeholder, type }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className={LABEL}>{label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register(field)} type={type} placeholder={placeholder} className={`${FIELD_BASE} pl-9`} />
              </div>
              {errors[field] && <p className="text-[11px] text-red-500">{errors[field]?.message}</p>}
            </div>
          ))}

          <label className="flex items-start gap-2.5 cursor-pointer mt-2">
            <input {...register('terms')} type="checkbox" className="mt-0.5 accent-gray-900 w-3.5 h-3.5" />
            <span className="text-xs text-gray-500 leading-relaxed">
              Acepto los <a href="#" className="underline text-gray-700 font-medium">términos y condiciones</a>
            </span>
          </label>
          {errors.terms && <p className="text-[11px] text-red-500 -mt-1">{errors.terms.message}</p>}

          {tokenError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <p className="text-xs text-red-600">{tokenError}</p>
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full mt-3 py-3.5 px-6 whitespace-nowrap bg-gray-900 text-white text-sm font-semibold rounded-xl
              hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validando tarjeta...
              </span>
            ) : 'Continuar al resumen →'}
          </button>
        </div>
      </div>
    </form>
  )
}
