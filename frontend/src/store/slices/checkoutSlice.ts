import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { randomUUID } from "crypto";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface DeliveryInfo {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR"
  | null;

interface CheckoutState {
  step: "payment-info" | "summary" | "result" | null;
  idempotencyKey: string | null;
  cardToken: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  customer: CustomerInfo | null;
  delivery: DeliveryInfo | null;
  productId: string | null;
  transactionId: string | null;
  transactionStatus: TransactionStatus;
}

const initialState: CheckoutState = {
  step: null,
  idempotencyKey: null,
  cardToken: null,
  cardLastFour: null,
  cardBrand: null,
  customer: null,
  delivery: null,
  productId: null,
  transactionId: null,
  transactionStatus: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    checkoutStarted: (state, action: PayloadAction<{ productId: string }>) => {
      state.productId = action.payload.productId;
      state.idempotencyKey = randomUUID();
      state.step = "payment-info";
    },

    cardTokenized: (
      state,
      action: PayloadAction<{ token: string; lastFour: string; brand: string }>,
    ) => {
      state.cardToken = action.payload.token;
      state.cardLastFour = action.payload.lastFour;
      state.cardBrand = action.payload.brand;
    },

    deliveryInfoSubmitted: (
      state,
      action: PayloadAction<{ customer: CustomerInfo; delivery: DeliveryInfo }>,
    ) => {
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
      state.step = "summary";
    },

    transactionCreated: (state, action: PayloadAction<string>) => {
      state.transactionId = action.payload;
      state.transactionStatus = "PENDING";
    },

    transactionResolved: (state, action: PayloadAction<TransactionStatus>) => {
      state.transactionStatus = action.payload;
      state.step = "result";
    },

    checkoutReset: () => initialState,
  },
});

export const {
  checkoutStarted,
  cardTokenized,
  deliveryInfoSubmitted,
  transactionCreated,
  transactionResolved,
  checkoutReset,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
