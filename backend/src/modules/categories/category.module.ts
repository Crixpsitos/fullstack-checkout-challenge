import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryOrmEntity } from './infrastructure/persistence/typeorm/schema/category.orm-entity';
import { CategoryTypeOrmRepository } from './infrastructure/persistence/typeorm/repository/category.typeorm.repository';
import { CATEGORY_REPOSITORY } from './domain/ports/category.repository.port';

import { CategoryApplicationService } from './application/category.application.service';
import { CategoryController } from './infrastructure/http/category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity])],
  controllers: [CategoryController],
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryTypeOrmRepository,
    },
    CategoryApplicationService,
  ],
})
export class CategoryModule {}
