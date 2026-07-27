import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface CreateTransactionInput {
  idempotencyKey: string
  reference: string
  amountInCents: number
  quantity: number
  productId: string
  customerId: string
  cardToken: string
  acceptanceToken: string
  customerEmail: string
  customerName: string
  delivery: {
    address: string
    city: string
    country: string
  }
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export interface TransactionResult {
  transactionId: string
  status: TransactionStatus
  gatewayId: string | null
  cardLastFour: string | null
  cardBrand: string | null
}

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api' }),
  endpoints: (builder) => ({
    createTransaction: builder.mutation<TransactionResult, CreateTransactionInput>({
      query: (body) => ({ url: 'transactions', method: 'POST', body }),
    }),
  }),
})

export const { useCreateTransactionMutation } = transactionsApi
