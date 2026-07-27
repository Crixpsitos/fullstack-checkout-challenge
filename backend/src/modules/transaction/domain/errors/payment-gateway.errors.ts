export class PaymentGatewayError extends Error {
  readonly code: string = 'PAYMENT_GATEWAY_ERROR';

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}

export class PaymentGatewayTimeoutError extends PaymentGatewayError {
  readonly code = 'PAYMENT_GATEWAY_TIMEOUT';

  constructor() {
    super('La pasarela de pagos no respondió a tiempo');
  }
}
