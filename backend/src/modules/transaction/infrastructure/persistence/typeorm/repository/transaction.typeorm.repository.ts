import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionRepositoryPort } from '../../../../domain/ports/transaction.repository.port';
import { Transaction } from '../../../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../schema/transaction.orm-entity';

@Injectable()
export class TransactionTypeOrmRepository implements ITransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repo: Repository<TransactionOrmEntity>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const row = this.toOrmEntity(transaction);

    await this.repo.insert(row);

    const saved = await this.repo.findOneOrFail({
      where: { id: transaction.id },
      relations: { product: true, customer: true, delivery: true },
    });
    return this.toDomain(saved);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const row = this.toOrmEntity(transaction);
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.repo.findOne({
      where: { id },
      relations: { product: true, customer: true, delivery: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Transaction | null> {
    const row = await this.repo.findOne({
      where: { idempotencyKey },
      relations: { product: true, customer: true, delivery: true },
    });
    return row ? this.toDomain(row) : null;
  }

  private toOrmEntity(transaction: Transaction) {
    return this.repo.create({
      id: transaction.id,
      idempotencyKey: transaction.idempotencyKey,
      reference: transaction.reference,
      gatewayId: transaction.gatewayId,
      status: transaction.status,
      amountInCents: transaction.amountInCents,
      product: { id: transaction.productId },
      customer: { id: transaction.customerId },
      delivery: { id: transaction.deliveryId },
      cardLastFour: transaction.cardLastFour,
      cardBrand: transaction.cardBrand,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  }

  private toDomain(row: TransactionOrmEntity): Transaction {
    return Transaction.reconstitute({
      id: row.id,
      idempotencyKey: row.idempotencyKey,
      reference: row.reference,
      gatewayId: row.gatewayId,
      status: row.status,
      amountInCents: row.amountInCents,
      productId: row.product.id,
      customerId: row.customer.id,
      deliveryId: row.delivery.id,
      cardLastFour: row.cardLastFour,
      cardBrand: row.cardBrand,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
