import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepositoryPort {
  create(transaction: Transaction): Promise<Transaction>;
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null>;
}

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');
