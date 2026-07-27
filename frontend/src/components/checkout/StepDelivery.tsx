import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DeliveryData } from '../../store/checkoutSlice'

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),
  address: z.string().min(5, 'Dirección muy corta'),
  city: z.string().min(2, 'Ciudad requerida'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
})

export type DeliveryFormValues = DeliveryData

interface StepDeliveryProps {
  defaultValues?: Partial<DeliveryFormValues>
  onNext: (data: DeliveryFormValues) => void
  onBack: () => void
}

const FIELDS = [
  { name: 'name' as const, label: 'Nombre completo', placeholder: 'Juan Pérez', type: 'text' },
  { name: 'email' as const, label: 'Correo electrónico', placeholder: 'juan@email.com', type: 'email' },
  { name: 'phone' as const, label: 'Teléfono', placeholder: '300 123 4567', type: 'tel' },
  { name: 'address' as const, label: 'Dirección de envío', placeholder: 'Calle 123 # 45-67', type: 'text' },
  { name: 'city' as const, label: 'Ciudad', placeholder: 'Bogotá', type: 'text' },
]

export function StepDelivery({ defaultValues, onNext, onBack }: StepDeliveryProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormValues>({ resolver: zodResolver(schema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-4">
      {FIELDS.map(({ name, label, placeholder, type }) => (
        <div key={name}>
          <label className="text-xs font-medium text-gray-600">{label}</label>
          <input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            className="w-full mt-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"
          />
          {errors[name] && (
            <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>
          )}
        </div>
      ))}

      {/* Términos */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          {...register('terms')}
          type="checkbox"
          className="mt-0.5 accent-gray-900"
        />
        <span className="text-xs text-gray-500">
          Acepto los{' '}
          <a href="#" className="underline text-gray-700">términos y condiciones</a>
        </span>
      </label>
      {errors.terms && <p className="text-xs text-red-500 -mt-2">{errors.terms.message}</p>}

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-full hover:border-gray-400 transition-colors"
        >
          Volver
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors"
        >
          Continuar al resumen
        </button>
      </div>
    </form>
  )
}
