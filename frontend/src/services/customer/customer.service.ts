import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface CustomerDelivery {
  id: string
  address: string
  city: string
  country: string
}

export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string
  latestDelivery: CustomerDelivery | null
}

export interface CreateCustomerInput {
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api' }),
  endpoints: (builder) => ({
    getCustomerByEmail: builder.query<CustomerProfile | null, string>({
      query: (email) => `customers/email/${encodeURIComponent(email)}`,
    }),
    createOrUpdateCustomer: builder.mutation<CustomerProfile, CreateCustomerInput>({
      query: (body) => ({ url: 'customers', method: 'POST', body }),
    }),
  }),
})

export const {
  useGetCustomerByEmailQuery,
  useLazyGetCustomerByEmailQuery,
  useCreateOrUpdateCustomerMutation,
} = customersApi
