import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../../../domain/ports/customer.repository.port';
import { Customer } from '../../../../domain/entities/customer.entity';
import { CustomerOrmEntity } from '../schema/customer.orm-entity';

@Injectable()
export class CustomerTypeOrmRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>,
  ) {}

  async findAll(): Promise<Customer[]> {
    const rows = await this.repo.find();
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const row = await this.repo.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const row = await this.repo.findOne({ where: { phone } });
    return row ? this.toDomain(row) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const row = this.repo.create({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: CustomerOrmEntity): Customer {
    return Customer.reconstitute({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
