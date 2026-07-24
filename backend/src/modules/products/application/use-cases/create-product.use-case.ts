import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../infrastructure/http/dto/create-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const product = new Product(
      randomUUID(),
      dto.name,
      dto.description,
      dto.price,
      dto.stock,
      dto.imageUrl,
      new Date(),
      new Date(),
    );
    return this.productRepository.save(product);
  }
}
