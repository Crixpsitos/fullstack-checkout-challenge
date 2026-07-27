// src/services/tokenizationApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface TokenizeCardInput {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

interface TokenizeCardResponse {
  data: {
    id: string;
    brand: string;        
    last_four: string;
    created_at: string;
    status: string;
  };
}

export const tokenizationApi = createApi({
  reducerPath: 'tokenizationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_PAYMENT_GATEWAY_SANDBOX_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${import.meta.env.VITE_PAYMENT_PUBLIC_KEY}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    tokenizeCard: builder.mutation<TokenizeCardResponse, TokenizeCardInput>({
      query: (card) => ({
        url: 'tokens/cards',
        method: 'POST',
        body: {
          number: card.number,
          exp_month: card.expMonth,
          exp_year: card.expYear,
          cvc: card.cvc,
          card_holder: card.cardHolder,
        },
      }),
    }),
  }),
});

export const { useTokenizeCardMutation } = tokenizationApi;