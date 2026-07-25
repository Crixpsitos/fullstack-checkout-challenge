import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../../../domain/ports/product.repository.port';
import { Product } from '../../../../domain/entities/product.entity';
import { ProductOrmEntity } from '../schema/product.orm-entity';
import { CategoryOrmEntity } from 'src/modules/categories/infrastructure/persistence/typeorm/schema/category.orm-entity';
import { type ProductFilterDto } from '../../../http/dto/product-filter.dto';
import { PaginationResult } from 'src/shared/interfaces/pagination-result.interface';

@Injectable()
export class ProductTypeOrmRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findAll(filter: ProductFilterDto): Promise<PaginationResult<Product>> {
    const { page, limit, categoryId, minPrice, maxPrice, q } = filter;

    const query = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .skip((page - 1) * limit)
      .take(limit);

    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }
    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (q) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:q) OR LOWER(product.description) LIKE LOWER(:q))',
        { q: `%${q}%` },
      );
    }

    const [rows, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      items: rows.map((row) => this.toDomain(row)),
      total,
      page,
      limit,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.repo.findOne({
      where: { id },
      relations: { category: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(product: Product): Promise<Product> {
    const row = this.repo.create({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      category: { id: product.category.id } as CategoryOrmEntity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async update(product: Product): Promise<Product> {
    await this.repo.update(product.id, {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      category: { id: product.category.id },
    });
    return this.findById(product.id).then((p) => p!);
  }

  private toDomain(row: ProductOrmEntity): Product {
    return Product.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      stock: row.stock,
      images: row.images ?? [],
      category: {
        id: row.category?.id,
        name: row.category?.name,
        slug: row.category?.slug,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
