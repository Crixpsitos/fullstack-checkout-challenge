import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductOrmEntity } from './infrastructure/persistence/typeorm/schema/product.orm-entity';
import { ProductTypeOrmRepository } from './infrastructure/persistence/typeorm/repository/product.typeorm.repository';
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';
import { LocalStorageService } from './infrastructure/storage/local-storage.service';
import { STORAGE_SERVICE } from 'src/shared/storage/storage.service.port';

import { ProductApplicationService } from './application/product.application.service';
import { ProductController } from './infrastructure/http/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductTypeOrmRepository,
    },
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
    ProductApplicationService,
  ],
})
export class ProductsModule {}
