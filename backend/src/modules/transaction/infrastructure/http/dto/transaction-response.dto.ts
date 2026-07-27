import { Expose } from 'class-transformer';
import { TransactionStatus } from '../../../domain/entities/transaction-status.vo';

export class TransactionResponseDto {
  @Expose()
  transactionId!: string;

  @Expose()
  status!: TransactionStatus;

  @Expose()
  gatewayId!: string | null;

  @Expose()
  cardLastFour!: string | null;

  @Expose()
  cardBrand!: string | null;
}
