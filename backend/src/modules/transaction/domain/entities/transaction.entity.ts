import { uuidv7 } from 'uuidv7';
import { TransactionStatus } from './transaction-status.vo';
import {
  InvalidTransactionAmountError,
  TransactionAlreadyResolvedError,
} from '../errors/transaction.errors';

export class Transaction {
  private constructor(
    public readonly id: string,
    public readonly idempotencyKey: string,
    public readonly reference: string,
    public gatewayId: string | null,
    public status: TransactionStatus,
    public readonly amountInCents: number,
    public readonly productId: string,
    public readonly customerId: string,
    public readonly deliveryId: string,
    public cardLastFour: string | null,
    public cardBrand: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this.validate();
  }

  static create(properties: {
    idempotencyKey: string;
    reference: string;
    amountInCents: number;
    productId: string;
    customerId: string;
    deliveryId: string;
  }): Transaction {
    const now = new Date();
    return new Transaction(
      uuidv7(),
      properties.idempotencyKey,
      properties.reference,
      null,
      TransactionStatus.PENDING,
      properties.amountInCents,
      properties.productId,
      properties.customerId,
      properties.deliveryId,
      null,
      null,
      now,
      now,
    );
  }
  static reconstitute(properties: {
    id: string;
    idempotencyKey: string;
    reference: string;
    gatewayId: string | null;
    status: TransactionStatus;
    amountInCents: number;
    productId: string;
    customerId: string;
    deliveryId: string;
    cardLastFour: string | null;
    cardBrand: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction(
      properties.id,
      properties.idempotencyKey,
      properties.reference,
      properties.gatewayId,
      properties.status,
      properties.amountInCents,
      properties.productId,
      properties.customerId,
      properties.deliveryId,
      properties.cardLastFour,
      properties.cardBrand,
      properties.createdAt,
      properties.updatedAt,
    );
  }

  markAsSentToGateway(
    gatewayId: string,
    cardLastFour: string,
    cardBrand: string,
  ): void {
    this.gatewayId = gatewayId;
    this.cardLastFour = cardLastFour;
    this.cardBrand = cardBrand;
    this.updatedAt = new Date();
  }

  resolveWithStatus(status: TransactionStatus): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new TransactionAlreadyResolvedError(this.status);
    }
    this.status = status;
    this.updatedAt = new Date();
  }

  isApproved(): boolean {
    return this.status === TransactionStatus.APPROVED;
  }

  private validate(): void {
    if (this.idempotencyKey.length < 3) {
      throw new Error('El id de idempotencia debe tener al menos 3 caracteres');
    }

    if (this.reference.length < 3) {
      throw new Error('El referencia debe tener al menos 3 caracteres');
    }

    if (this.amountInCents <= 0) {
      throw new InvalidTransactionAmountError();
    }

    if (this.productId.length < 3) {
      throw new Error('El id del producto debe tener al menos 3 caracteres');
    }

    if (this.customerId.length < 3) {
      throw new Error('El id del cliente debe tener al menos 3 caracteres');
    }

    if (this.deliveryId.length < 3) {
      throw new Error('El id de entrega debe tener al menos 3 caracteres');
    }
  }
}
