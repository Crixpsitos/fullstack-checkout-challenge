import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDeliveryRepository } from '../../../../domain/ports/delivery.repository.port';
import { Delivery } from '../../../../domain/entities/delivery.entity';
import { DeliveryOrmEntity } from '../schema/delivery.orm-entity';

@Injectable()
export class DeliveryTypeOrmRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repo: Repository<DeliveryOrmEntity>,
  ) {}

  async save(delivery: Delivery): Promise<Delivery> {
    const row = this.repo.create({
      id: delivery.id,
      customer: { id: delivery.customerId },
      address: delivery.address,
      city: delivery.city,
      country: delivery.country,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCustomerId(customerId: string): Promise<Delivery | null> {
    const row = await this.repo.findOne({
      where: { customer: { id: customerId } },
    });
    return row ? this.toDomain(row) : null;
  }

  async findLatestByCustomerId(customerId: string): Promise<Delivery | null> {
    const row = await this.repo.findOne({
      where: { customer: { id: customerId } },
      order: { createdAt: 'DESC' },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Delivery[]> {
    const rows = await this.repo.find();
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: DeliveryOrmEntity): Delivery {
    return Delivery.reconstitute({
      id: row.id,
      customerId: row.customerId,
      address: row.address,
      city: row.city,
      country: row.country,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
