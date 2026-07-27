export interface CreateGatewayTransactionInput {
  reference: string;
  amountInCents: number;
  cardToken: string;
  acceptanceToken: string;
  customerEmail: string;
}

export interface GatewayTransactionResult {
  gatewayId: string;
  cardLastFour: string;
  cardBrand: string;
}

export interface PaymentGatewayPort {
  createTransaction(
    input: CreateGatewayTransactionInput,
  ): Promise<GatewayTransactionResult>;
  pollStatus(
    gatewayId: string,
  ): Promise<'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | null>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
