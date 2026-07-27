export type PaymentErrorCode =
  | 'ALREADY_PROCESSED'
  | 'OUT_OF_STOCK'
  | 'GATEWAY_CALL_FAILED'
  | 'TIMEOUT'
  | 'STOCK_CONFLICT_AFTER_PAYMENT'
  | 'INVALID_CARD_TOKEN'
  | 'PRODUCT_NOT_FOUND';

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
}
