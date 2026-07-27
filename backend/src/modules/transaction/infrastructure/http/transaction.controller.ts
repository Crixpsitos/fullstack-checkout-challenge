import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { TransactionApplicationService } from '../../application/transaction.application.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Err } from '../../../../shared/result/result';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly processPayment: ProcessPaymentUseCase,
    private readonly transactionService: TransactionApplicationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTransactionDto): Promise<TransactionResponseDto> {
    const result = await this.processPayment.execute(body);

    if (result instanceof Err) {
      const { code, message } = result.error;
      if (code === 'PRODUCT_NOT_FOUND') throw new NotFoundException(message);
      if (code === 'OUT_OF_STOCK') throw new UnprocessableEntityException(message);
      if (code === 'TIMEOUT') {
        throw new BadRequestException(message);
      }
      throw new BadRequestException(message);
    }

    return plainToInstance(TransactionResponseDto, result.value, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionService.getById(id);

    if (!transaction) {
      throw new NotFoundException(`Transacción ${id} no encontrada`);
    }

    return plainToInstance(TransactionResponseDto, {
      transactionId: transaction.id,
      status: transaction.status,
      gatewayId: transaction.gatewayId,
      cardLastFour: transaction.cardLastFour,
      cardBrand: transaction.cardBrand,
    }, { excludeExtraneousValues: true });
  }

  @Get('idempotency/:key')
  async findByIdempotencyKey(
    @Param('key') key: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionService.getByIdempotencyKey(key);

    if (!transaction) {
      throw new NotFoundException(`Transacción con clave ${key} no encontrada`);
    }

    return plainToInstance(TransactionResponseDto, {
      transactionId: transaction.id,
      status: transaction.status,
      gatewayId: transaction.gatewayId,
      cardLastFour: transaction.cardLastFour,
      cardBrand: transaction.cardBrand,
    }, { excludeExtraneousValues: true });
  }
}
