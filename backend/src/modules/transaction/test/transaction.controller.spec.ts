import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionController } from '../infrastructure/http/transaction.controller';
import { ProcessPaymentUseCase } from '../application/use-cases/process-payment.use-case';
import { TransactionApplicationService } from '../application/transaction.application.service';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionStatus } from '../domain/entities/transaction-status.vo';
import { ok, err } from 'src/shared/result/result';

const makeTransaction = (status = TransactionStatus.APPROVED) =>
  Transaction.reconstitute({
    id: 'tx-uuid-001',
    idempotencyKey: 'idem-key-abc',
    reference: 'REF-00001',
    gatewayId: 'gw-ext-001',
    status,
    amountInCents: 500_000,
    productId: 'prod-id-001',
    customerId: 'cust-id-001',
    deliveryId: 'deliv-id-001',
    cardLastFour: '4242',
    cardBrand: 'VISA',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

const makeProcessResult = (status = TransactionStatus.APPROVED) => ({
  transactionId: 'tx-uuid-001',
  status,
  gatewayId: 'gw-ext-001',
  cardLastFour: '4242',
  cardBrand: 'VISA',
});

describe('TransactionController', () => {
  let controller: TransactionController;
  let processPayment: jest.Mocked<ProcessPaymentUseCase>;
  let transactionService: jest.Mocked<TransactionApplicationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: ProcessPaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: TransactionApplicationService,
          useValue: { getById: jest.fn(), getByIdempotencyKey: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(TransactionController);
    processPayment = module.get(ProcessPaymentUseCase);
    transactionService = module.get(TransactionApplicationService);
  });

  const validBody = {
    idempotencyKey: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    reference: 'REF-ABCD1234',
    amountInCents: 500_000,
    quantity: 1,
    productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    customerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    cardToken: 'tok_test_abc',
    acceptanceToken: 'accept_xyz',
    customerEmail: 'test@test.com',
    customerName: 'Juan Pérez',
    delivery: { address: 'Calle 1', city: 'Bogotá', country: 'CO' },
  } as any;

  describe('POST /transactions (create)', () => {
    it('retorna 201 con TransactionResponseDto cuando el pago es APPROVED', async () => {
      processPayment.execute.mockResolvedValue(ok(makeProcessResult()));

      const result = await controller.create(validBody);

      expect(result.transactionId).toBe('tx-uuid-001');
      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(result.gatewayId).toBe('gw-ext-001');
      expect(result.cardLastFour).toBe('4242');
      expect(result.cardBrand).toBe('VISA');
    });

    it('retorna resultado con status DECLINED (sin lanzar error)', async () => {
      processPayment.execute.mockResolvedValue(ok(makeProcessResult(TransactionStatus.DECLINED)));

      const result = await controller.create(validBody);

      expect(result.status).toBe(TransactionStatus.DECLINED);
    });

    it('lanza NotFoundException cuando code es PRODUCT_NOT_FOUND', async () => {
      processPayment.execute.mockResolvedValue(
        err({ code: 'PRODUCT_NOT_FOUND', message: 'El producto no existe' }),
      );

      await expect(controller.create(validBody)).rejects.toThrow(NotFoundException);
    });

    it('lanza UnprocessableEntityException cuando code es OUT_OF_STOCK', async () => {
      processPayment.execute.mockResolvedValue(
        err({ code: 'OUT_OF_STOCK', message: 'Sin stock' }),
      );

      await expect(controller.create(validBody)).rejects.toThrow(UnprocessableEntityException);
    });

    it('lanza BadRequestException cuando code es TIMEOUT', async () => {
      processPayment.execute.mockResolvedValue(
        err({ code: 'TIMEOUT', message: 'Pasarela no respondió' }),
      );

      await expect(controller.create(validBody)).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException cuando code es GATEWAY_CALL_FAILED', async () => {
      processPayment.execute.mockResolvedValue(
        err({ code: 'GATEWAY_CALL_FAILED', message: 'Error de pasarela' }),
      );

      await expect(controller.create(validBody)).rejects.toThrow(BadRequestException);
    });

    it('el mensaje de NotFoundException incluye el mensaje del error', async () => {
      processPayment.execute.mockResolvedValue(
        err({ code: 'PRODUCT_NOT_FOUND', message: 'El producto no existe' }),
      );

      let caught: NotFoundException | null = null;
      try {
        await controller.create(validBody);
      } catch (e) {
        caught = e as NotFoundException;
      }
      expect(caught!.message).toBe('El producto no existe');
    });
  });

  describe('GET /transactions/:id (findOne)', () => {
    it('retorna TransactionResponseDto cuando la transacción existe', async () => {
      transactionService.getById.mockResolvedValue(makeTransaction());

      const result = await controller.findOne('tx-uuid-001');

      expect(result.transactionId).toBe('tx-uuid-001');
      expect(result.status).toBe(TransactionStatus.APPROVED);
    });

    it('lanza NotFoundException cuando no existe', async () => {
      transactionService.getById.mockResolvedValue(null);

      await expect(controller.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });

    it('el mensaje de NotFoundException incluye el id', async () => {
      transactionService.getById.mockResolvedValue(null);

      let caught: NotFoundException | null = null;
      try {
        await controller.findOne('uuid-123');
      } catch (e) {
        caught = e as NotFoundException;
      }
      expect(caught!.message).toContain('uuid-123');
    });

    it('delega el id exacto al servicio', async () => {
      transactionService.getById.mockResolvedValue(makeTransaction());
      await controller.findOne('tx-uuid-999');
      expect(transactionService.getById).toHaveBeenCalledWith('tx-uuid-999');
    });
  });

  describe('GET /transactions/idempotency/:key (findByIdempotencyKey)', () => {
    it('retorna TransactionResponseDto cuando la clave existe', async () => {
      transactionService.getByIdempotencyKey.mockResolvedValue(makeTransaction());

      const result = await controller.findByIdempotencyKey('idem-key-abc');

      expect(result.transactionId).toBe('tx-uuid-001');
    });

    it('lanza NotFoundException cuando la clave no existe', async () => {
      transactionService.getByIdempotencyKey.mockResolvedValue(null);

      await expect(controller.findByIdempotencyKey('no-existe')).rejects.toThrow(NotFoundException);
    });

    it('el mensaje de NotFoundException incluye la clave', async () => {
      transactionService.getByIdempotencyKey.mockResolvedValue(null);

      let caught: NotFoundException | null = null;
      try {
        await controller.findByIdempotencyKey('mi-clave');
      } catch (e) {
        caught = e as NotFoundException;
      }
      expect(caught!.message).toContain('mi-clave');
    });

    it('delega la clave exacta al servicio', async () => {
      transactionService.getByIdempotencyKey.mockResolvedValue(makeTransaction());
      await controller.findByIdempotencyKey('clave-especial-xyz');
      expect(transactionService.getByIdempotencyKey).toHaveBeenCalledWith('clave-especial-xyz');
    });
  });
});
