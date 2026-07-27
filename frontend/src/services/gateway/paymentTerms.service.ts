import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface AcceptanceTokenResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string
      permalink: string
    }
  }
}

export const paymentTermsApi = createApi({
  reducerPath: 'paymentTermsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_PAYMENT_GATEWAY_SANDBOX_URL as string,
  }),
  endpoints: (builder) => ({
    getAcceptanceToken: builder.query<AcceptanceTokenResponse, string>({
      query: (publicKey) => `merchants/${publicKey}`,
    }),
  }),
})

export const { useGetAcceptanceTokenQuery } = paymentTermsApi
