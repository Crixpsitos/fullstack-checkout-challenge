import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrmEntity } from './infrastructure/persistence/typeorm/schema/customer.orm-entity';
import { CustomerTypeOrmRepository } from './infrastructure/persistence/typeorm/repository/customer.typeorm.repository';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer.repository.port';
import { DeliveryModule } from '../delivery/delivery.module';
import { CustomerApplicationService } from './application/customer.application.service';
import { CustomerController } from './infrastructure/http/customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity]), DeliveryModule],
  controllers: [CustomerController],
  providers: [
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerTypeOrmRepository },
    CustomerApplicationService,
  ],
  exports: [CustomerApplicationService],
})
export class CustomersModule {}
