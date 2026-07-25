import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../domain/entities/product.entity';
import {
  type IProductRepository,
  PRODUCT_REPOSITORY,
} from '../domain/ports/product.repository.port';
import { CreateProductDto } from '../infrastructure/http/dto/create-product.dto';
import { UpdateProductDto } from '../infrastructure/http/dto/update-product.dto';
import { ProductFilterDto } from '../infrastructure/http/dto/product-filter.dto';
import { PaginationResult } from 'src/shared/interfaces/pagination-result.interface';
import { Result, ok, err, Err } from 'src/shared/result/result';
import { ProductNotFoundError } from '../domain/errors/product.errors';

@Injectable()
export class ProductApplicationService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async getAll(filter: ProductFilterDto): Promise<PaginationResult<Product>> {
    return this.productRepository.findAll(filter);
  }

  async getById(id: string): Promise<Result<Product, ProductNotFoundError>> {
    const product = await this.productRepository.findById(id);
    if (!product) return err(new ProductNotFoundError(id));
    return ok(product);
  }

  async create(dto: CreateProductDto & { images: string[] }): Promise<Product> {
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      images: dto.images,
      categoryId: dto.categoryId,
    });
    return this.productRepository.save(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Result<Product, ProductNotFoundError>> {
    const found = await this.getById(id);
    if (found instanceof Err) return found;

    const product = found.value;
    if (dto.name) product.name = dto.name.trim();
    if (dto.description) product.description = dto.description.trim();
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.categoryId) product.category = { id: dto.categoryId };

    return ok(await this.productRepository.save(product));
  }

  async delete(id: string): Promise<Result<void, ProductNotFoundError>> {
    const found = await this.getById(id);
    if (found instanceof Err) return found;
    await this.productRepository.delete(id);
    return ok(undefined);
  }
}
