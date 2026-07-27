import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import {
  PaymentGatewayPort,
  CreateGatewayTransactionInput,
  GatewayTransactionResult,
  PAYMENT_GATEWAY,
} from '../../domain/ports/payment-gateway.port';
import { TransactionStatus } from '../../domain/entities/transaction-status.vo';
import { PaymentGatewayError, PaymentGatewayTimeoutError } from '../../domain/errors/payment-gateway.errors';

const CURRENCY = 'COP';

@Injectable()
export class HttpPaymentGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(HttpPaymentGateway.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly integritySecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('gateway.baseUrl');
    this.apiKey = this.configService.getOrThrow<string>('gateway.apiKey');
    this.integritySecret = this.configService.getOrThrow<string>('gateway.integritySecret');
  }

  private buildSignature(reference: string, amountInCents: number): string {
    const raw = `${reference}${amountInCents}${CURRENCY}${this.integritySecret}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async createTransaction(
    input: CreateGatewayTransactionInput,
  ): Promise<GatewayTransactionResult> {
    const signature = this.buildSignature(input.reference, input.amountInCents);

    const body = {
      amount_in_cents: input.amountInCents,
      currency: CURRENCY,
      signature,
      reference: input.reference,
      customer_email: input.customerEmail,
      customer_data: { full_name: input.customerName },
      payment_method: {
        type: 'CARD',
        token: input.cardToken,
        installments: 1,
      },
      acceptance_token: input.acceptanceToken,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transactions`, body, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }),
      );

      const data = response.data?.data ?? {};
      const pm = data.payment_method ?? {};

      return {
        gatewayId: data.id,
        cardLastFour: pm.extra?.last_four ?? '',
        cardBrand: pm.extra?.brand ?? '',
      };
    } catch (error: unknown) {
      if (this.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new PaymentGatewayTimeoutError();
        }
        const body = error.response?.data as Record<string, unknown> | undefined;
        const gatewayError = body?.['error'] as Record<string, unknown> | undefined;
        const gatewayMessages = gatewayError?.['messages']
          ? JSON.stringify(gatewayError['messages'])
          : ((gatewayError?.['type'] as string) ?? 'Error desconocido de pasarela');
        this.logger.error(
          `Gateway respondió ${error.response?.status ?? 'sin status'}: ${gatewayMessages}`,
          JSON.stringify(body ?? {}),
        );
        throw new PaymentGatewayError(gatewayMessages);
      }
      throw error;
    }
  }

  async pollStatus(
    gatewayId: string,
  ): Promise<'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions/${gatewayId}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }),
      );

      const status: string = response.data?.data?.status ?? '';

      const MAP: Record<string, TransactionStatus> = {
        APPROVED: TransactionStatus.APPROVED,
        DECLINED: TransactionStatus.DECLINED,
        VOIDED: TransactionStatus.VOIDED,
        ERROR: TransactionStatus.ERROR,
      };

      return (MAP[status] as 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR') ?? null;
    } catch (error: unknown) {
      if (this.isAxiosError(error)) {
        this.logger.warn(`pollStatus error para ${gatewayId}: ${error.message}`);
        return null;
      }
      throw error;
    }
  }

  private isAxiosError(error: unknown): error is {
    code?: string;
    message: string;
    response?: { status: number; data: unknown };
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      ('response' in error || 'code' in error)
    );
  }
}

