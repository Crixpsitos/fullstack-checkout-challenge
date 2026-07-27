export abstract class TransactionDomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidTransactionAmountError extends TransactionDomainError {
  readonly code = 'INVALID_TRANSACTION_AMOUNT';

  constructor() {
    super('El monto de la transacción debe ser mayor a cero');
  }
}

export class TransactionAlreadyResolvedError extends TransactionDomainError {
  readonly code = 'TRANSACTION_ALREADY_RESOLVED';

  constructor(currentStatus: string) {
    super(
      `No se puede modificar una transacción ya resuelta (estado actual: ${currentStatus})`,
    );
  }
}
