import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity';
import { ProductTypeOrmRepository } from './infrastructure/persistence/product.typeorm.repository';
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';

import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';

import { ProductController } from './infrastructure/http/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeOrmRepository,
    },
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateProductUseCase,
  ],
})
export class ProductsModule {}
