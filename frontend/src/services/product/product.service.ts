import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PaginatedResponse, Product } from '../../types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ProductFilters | void>({
      query: (filters) => ({
        url: 'products',
        params: filters ?? {},
      }),
      providesTags: ['Product'],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      providesTags: ['Product'],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productsApi;