import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../domain/entities/transaction.entity';
import {
  type ITransactionRepositoryPort,
  TRANSACTION_REPOSITORY,
} from '../domain/ports/transaction.repository.port';

@Injectable()
export class TransactionApplicationService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepositoryPort,
  ) {}

  async getById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  async getByIdempotencyKey(key: string): Promise<Transaction | null> {
    return this.transactionRepository.findByIdempotencyKey(key);
  }
}
