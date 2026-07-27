import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type CheckoutStep = 1 | 2 | 3

export interface PaymentData {
  number: string
  expiry: string
  cvc: string
  name: string
}

export interface DeliveryData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  terms: true
}

export interface CardToken {
  token: string
  lastFour: string
  brand: string
}

interface CheckoutState {
  step: CheckoutStep
  productId: string | null
  quantity: number
  paymentData: PaymentData | null
  deliveryData: DeliveryData | null
  cardToken: CardToken | null
  customerId: string | null
  acceptanceToken: string | null
}

const initialState: CheckoutState = {
  step: 1,
  productId: null,
  quantity: 1,
  paymentData: null,
  deliveryData: null,
  cardToken: null,
  customerId: null,
  acceptanceToken: null,
}

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    initCheckout: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      state.step = 1
      state.productId = action.payload.productId
      state.quantity = action.payload.quantity
      state.paymentData = null
      state.deliveryData = null
      state.cardToken = null
      state.customerId = null
      state.acceptanceToken = null
    },
    resetCheckout: () => initialState,
    setPaymentData: (state, action: PayloadAction<PaymentData>) => {
      state.paymentData = action.payload
    },
    cardTokenized: (state, action: PayloadAction<CardToken>) => {
      state.cardToken = action.payload
    },
    setDeliveryData: (state, action: PayloadAction<DeliveryData>) => {
      state.deliveryData = action.payload
    },
    deliveryInfoSubmitted: (state, action: PayloadAction<DeliveryData>) => {
      state.deliveryData = action.payload
    },
    setCustomerId: (state, action: PayloadAction<string>) => {
      state.customerId = action.payload
    },
    setAcceptanceToken: (state, action: PayloadAction<string>) => {
      state.acceptanceToken = action.payload
    },
    nextStep: (state) => {
      if (state.step < 3) state.step = (state.step + 1) as CheckoutStep
    },
    prevStep: (state) => {
      if (state.step > 1) state.step = (state.step - 1) as CheckoutStep
    },
  },
})

export const { initCheckout, resetCheckout, setPaymentData, cardTokenized, setDeliveryData, deliveryInfoSubmitted, setCustomerId, setAcceptanceToken, nextStep, prevStep } =
  checkoutSlice.actions
export default checkoutSlice.reducer
