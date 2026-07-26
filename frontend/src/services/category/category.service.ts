import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category } from '../../types';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
      providesTags: ['Category'],
    }),
    getCategoryById: builder.query<Category, number>({
      query: (id) => `categories/${id}`,
      providesTags: ['Category'],
    }),
  }),
});

export const { useGetCategoriesQuery, useGetCategoryByIdQuery } = categoriesApi;
