import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

@Injectable()
export class ProductTypeOrmRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.repo.find();
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(product: Product): Promise<Product> {
    const row = this.repo.create({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: ProductOrmEntity): Product {
    return new Product(
      row.id,
      row.name,
      row.description,
      Number(row.price),
      row.stock,
      row.imageUrl,
      row.createdAt,
      row.updatedAt,
    );
  }
}
