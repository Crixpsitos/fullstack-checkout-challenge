import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryOrmEntity } from './infrastructure/persistence/typeorm/schema/delivery.orm-entity';
import { DeliveryTypeOrmRepository } from './infrastructure/persistence/typeorm/repository/delivery.typeorm.repository';
import { DELIVERY_REPOSITORY } from './domain/ports/delivery.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryOrmEntity])],
  providers: [
    { provide: DELIVERY_REPOSITORY, useClass: DeliveryTypeOrmRepository },
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveryModule {}
