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
  paymentData: PaymentData | null
  deliveryData: DeliveryData | null
  cardToken: CardToken | null
}

const initialState: CheckoutState = {
  step: 1,
  productId: null,
  paymentData: null,
  deliveryData: null,
  cardToken: null,
}

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    initCheckout: (state, action: PayloadAction<string>) => {
      state.step = 1
      state.productId = action.payload
      state.paymentData = null
      state.deliveryData = null
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
    nextStep: (state) => {
      if (state.step < 3) state.step = (state.step + 1) as CheckoutStep
    },
    prevStep: (state) => {
      if (state.step > 1) state.step = (state.step - 1) as CheckoutStep
    },
  },
})

export const { initCheckout, resetCheckout, setPaymentData, cardTokenized, setDeliveryData, deliveryInfoSubmitted, nextStep, prevStep } =
  checkoutSlice.actions
export default checkoutSlice.reducer
