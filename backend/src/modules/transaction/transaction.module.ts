import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TransactionOrmEntity } from './infrastructure/persistence/typeorm/schema/transaction.orm-entity';
import { TransactionTypeOrmRepository } from './infrastructure/persistence/typeorm/repository/transaction.typeorm.repository';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository.port';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';
import { HttpPaymentGateway } from './infrastructure/gateway/http-payment.gateway';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { TransactionApplicationService } from './application/transaction.application.service';
import { TransactionController } from './infrastructure/http/transaction.controller';

import { ProductsModule } from '../products/products.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrmEntity]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.getOrThrow<string>('gateway.baseUrl'),
        timeout: config.getOrThrow<number>('gateway.timeout'),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.getOrThrow<string>('gateway.apiKey')}`,
        },
      }),
    }),
    ProductsModule,
    DeliveryModule,
  ],
  controllers: [TransactionController],
  providers: [
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionTypeOrmRepository },
    { provide: PAYMENT_GATEWAY, useClass: HttpPaymentGateway },
    ProcessPaymentUseCase,
    TransactionApplicationService,
  ],
})
export class TransactionModule {}
