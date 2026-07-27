import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/entities/transaction-status.vo';
import {
  type ITransactionRepositoryPort,
  TRANSACTION_REPOSITORY,
} from '../../domain/ports/transaction.repository.port';
import {
  type PaymentGatewayPort,
  PAYMENT_GATEWAY,
} from '../../domain/ports/payment-gateway.port';
import {
  type IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../products/domain/ports/product.repository.port';
import {
  type IDeliveryRepository,
  DELIVERY_REPOSITORY,
} from '../../../delivery/domain/ports/delivery.repository.port';
import { Delivery } from '../../../delivery/domain/entities/delivery.entity';
import { type Result, ok, err } from 'src/shared/result/result';
import { type PaymentError } from '../../domain/errors/payment.errors';
import { PaymentGatewayError } from '../../domain/errors/payment-gateway.errors';

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 15;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface ProcessPaymentInput {
  idempotencyKey: string;
  reference: string;
  amountInCents: number;
  quantity: number;
  productId: string;
  customerId: string;
  cardToken: string;
  acceptanceToken: string;
  customerEmail: string;
  customerName: string;
  delivery: {
    address: string;
    city: string;
    country: string;
  };
}

export interface ProcessPaymentResult {
  transactionId: string;
  status: TransactionStatus;
  gatewayId: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<ProcessPaymentResult, PaymentError>> {
    const existing = await this.transactionRepository.findByIdempotencyKey(
      input.idempotencyKey,
    );
    if (existing) {
      return ok(this.toResult(existing));
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return err({ code: 'PRODUCT_NOT_FOUND', message: 'El producto no existe' });
    }
    if (!product.hasStock(input.quantity)) {
      return err({ code: 'OUT_OF_STOCK', message: 'El producto no tiene stock suficiente' });
    }

    const delivery = await this.deliveryRepository.save(
      Delivery.create({
        customerId: input.customerId,
        address: input.delivery.address,
        city: input.delivery.city,
        country: input.delivery.country,
      }),
    );

    const transaction = await this.transactionRepository.create(
      Transaction.create({
        idempotencyKey: input.idempotencyKey,
        reference: input.reference,
        amountInCents: input.amountInCents,
        productId: input.productId,
        customerId: input.customerId,
        deliveryId: delivery.id,
      }),
    );

    let gatewayId: string;
    let cardLastFour: string;
    let cardBrand: string;

    try {
      const gatewayResult = await this.paymentGateway.createTransaction({
        reference: input.reference,
        amountInCents: input.amountInCents,
        cardToken: input.cardToken,
        acceptanceToken: input.acceptanceToken,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
      });
      gatewayId = gatewayResult.gatewayId;
      cardLastFour = gatewayResult.cardLastFour;
      cardBrand = gatewayResult.cardBrand;
    } catch (error) {
      const isTimeout =
        error instanceof PaymentGatewayError && error.code === 'PAYMENT_GATEWAY_TIMEOUT';
      transaction.resolveWithStatus(TransactionStatus.ERROR);
      await this.transactionRepository.update(transaction);
      return err({
        code: isTimeout ? 'TIMEOUT' : 'GATEWAY_CALL_FAILED',
        message: error instanceof Error ? error.message : 'Error en la pasarela de pago',
      });
    }

    transaction.markAsSentToGateway(gatewayId, cardLastFour, cardBrand);
    await this.transactionRepository.update(transaction);

    const finalStatus = await this.pollUntilTerminal(gatewayId);
    transaction.resolveWithStatus(finalStatus);
    await this.transactionRepository.update(transaction);

    if (finalStatus === TransactionStatus.APPROVED) {
      product.stock -= input.quantity;
      await this.productRepository.save(product);
    }

    return ok(this.toResult(transaction));
  }

  private async pollUntilTerminal(gatewayId: string): Promise<TransactionStatus> {
    const terminal = new Set<string>([
      TransactionStatus.APPROVED,
      TransactionStatus.DECLINED,
      TransactionStatus.VOIDED,
      TransactionStatus.ERROR,
    ]);

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      const status = await this.paymentGateway.pollStatus(gatewayId);
      if (status !== null && terminal.has(status)) {
        return status as TransactionStatus;
      }
      await delay(POLL_INTERVAL_MS);
    }

    return TransactionStatus.ERROR;
  }

  private toResult(t: Transaction): ProcessPaymentResult {
    return {
      transactionId: t.id,
      status: t.status,
      gatewayId: t.gatewayId,
      cardLastFour: t.cardLastFour,
      cardBrand: t.cardBrand,
    };
  }
}
